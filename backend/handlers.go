package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"math"
	"net/http"
	"strconv"
	"strings"

	"github.com/lib/pq"
)

func healthHandler(w http.ResponseWriter, r *http.Request) {
	setCORS(w, r)
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("ok"))
}

func messagesHandler(db *sql.DB) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		setCORS(w, r)
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		username, ok := getUsername(r.Context())
		if !ok {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		switch r.Method {
		case http.MethodPost:
			var in struct {
				Receiver string `json:"receiver"`
				Subject  string `json:"subject"`
				Body     string `json:"body"`
			}
			if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
				http.Error(w, "invalid json", http.StatusBadRequest)
				return
			}

			in.Receiver = strings.TrimSpace(in.Receiver)
			in.Subject = strings.TrimSpace(in.Subject)
			in.Body = strings.TrimSpace(in.Body)
			if in.Receiver == "" || in.Subject == "" || in.Body == "" {
				http.Error(w, "missing fields", http.StatusBadRequest)
				return
			}

			var msg Message
			err := db.QueryRow(
				`INSERT INTO messages(sender, receiver, subject, body)
				 VALUES($1,$2,$3,$4)
				 RETURNING id, sender, receiver, subject, body, is_read, is_archived, created_at`,
				username, in.Receiver, in.Subject, in.Body,
			).Scan(&msg.ID, &msg.Sender, &msg.Receiver, &msg.Subject, &msg.Body, &msg.IsRead, &msg.IsArchived, &msg.CreatedAt)
			if err != nil {
				log.Println("insert error:", err)
				http.Error(w, "db error", http.StatusInternalServerError)
				return
			}
			writeJSON(w, msg)

		case http.MethodGet:
			page, _ := strconv.Atoi(r.URL.Query().Get("page"))
			if page < 1 {
				page = 1
			}
			pageSize, _ := strconv.Atoi(r.URL.Query().Get("pageSize"))
			if pageSize < 1 || pageSize > 100 {
				pageSize = 25
			}
			archived := r.URL.Query().Get("archived") == "true"
			sent := r.URL.Query().Get("sent") == "true"

			var totalItems int64
			if sent {
				if err := db.QueryRow(`SELECT COUNT(*) FROM messages WHERE sender=$1 AND is_archived=$2`, username, archived).Scan(&totalItems); err != nil {
					log.Println("count query error:", err)
					http.Error(w, "db error", http.StatusInternalServerError)
					return
				}
			} else {
				if err := db.QueryRow(`SELECT COUNT(*) FROM messages WHERE receiver=$1 AND is_archived=$2`, username, archived).Scan(&totalItems); err != nil {
					log.Println("count query error:", err)
					http.Error(w, "db error", http.StatusInternalServerError)
					return
				}
			}

			totalPages := int(math.Ceil(float64(totalItems) / float64(pageSize)))
			offset := (page - 1) * pageSize

			var rows *sql.Rows
			var err error
			if sent {
				rows, err = db.Query(
					`SELECT id, sender, receiver, subject, body, is_read, is_archived, created_at
					 FROM messages
					 WHERE sender=$1 AND is_archived=$2
					 ORDER BY created_at DESC
					 LIMIT $3 OFFSET $4`,
					username, archived, pageSize, offset,
				)
			} else {
				rows, err = db.Query(
					`SELECT id, sender, receiver, subject, body, is_read, is_archived, created_at
					 FROM messages
					 WHERE receiver=$1 AND is_archived=$2
					 ORDER BY created_at DESC
					 LIMIT $3 OFFSET $4`,
					username, archived, pageSize, offset,
				)
			}
			if err != nil {
				log.Println("select query error:", err)
				http.Error(w, "db error", http.StatusInternalServerError)
				return
			}
			defer rows.Close()

			var messages []Message
			for rows.Next() {
				var m Message
				if err := rows.Scan(&m.ID, &m.Sender, &m.Receiver, &m.Subject, &m.Body, &m.IsRead, &m.IsArchived, &m.CreatedAt); err != nil {
					log.Println("scan error:", err)
					continue
				}
				messages = append(messages, m)
			}

			response := PaginatedMessagesResponse{
				Data: messages,
				Pagination: Pagination{
					TotalItems:  totalItems,
					TotalPages:  totalPages,
					CurrentPage: page,
					PageSize:    pageSize,
				},
			}
			writeJSON(w, response)

		case http.MethodPut:
			var in struct {
				IDs        []int64 `json:"ids"`
				IsRead     *bool   `json:"is_read"`
				IsArchived *bool   `json:"is_archived"`
			}
			if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
				http.Error(w, "invalid json", http.StatusBadRequest)
				return
			}
			if len(in.IDs) == 0 {
				http.Error(w, "no ids provided", http.StatusBadRequest)
				return
			}
			if in.IsRead == nil && in.IsArchived == nil {
				http.Error(w, "no update fields provided", http.StatusBadRequest)
				return
			}

			// Build dynamic update
			q := "UPDATE messages SET "
			args := []any{}
			idx := 1
			if in.IsRead != nil {
				q += "is_read=$" + strconv.Itoa(idx)
				args = append(args, *in.IsRead)
				idx++
			}
			if in.IsArchived != nil {
				if len(args) > 0 {
					q += ", "
				}
				q += "is_archived=$" + strconv.Itoa(idx)
				args = append(args, *in.IsArchived)
				idx++
			}
			q += " WHERE receiver=$" + strconv.Itoa(idx) + " AND id = ANY($" + strconv.Itoa(idx+1) + ")"
			args = append(args, username, pq.Array(in.IDs))

			res, err := db.Exec(q, args...)
			if err != nil {
				log.Println("update error:", err)
				http.Error(w, "db error", http.StatusInternalServerError)
				return
			}
			n, _ := res.RowsAffected()
			writeJSON(w, map[string]any{"updated": n})

		case http.MethodDelete:
			var in struct {
				IDs []int64 `json:"ids"`
			}
			if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
				http.Error(w, "invalid json", http.StatusBadRequest)
				return
			}
			if len(in.IDs) == 0 {
				http.Error(w, "no ids provided", http.StatusBadRequest)
				return
			}

			res, err := db.Exec(
				`DELETE FROM messages WHERE receiver=$1 AND id = ANY($2)`,
				username,
				pq.Array(in.IDs),
			)
			if err != nil {
				log.Println("delete error:", err)
				http.Error(w, "db error", http.StatusInternalServerError)
				return
			}
			n, _ := res.RowsAffected()
			writeJSON(w, map[string]any{"deleted": n})

		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	})
}
