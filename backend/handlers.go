package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"math"
	"net/http"
	"strconv"
	"strings"
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
			in.Subject  = strings.TrimSpace(in.Subject)
			in.Body     = strings.TrimSpace(in.Body)
			if in.Receiver == "" || in.Subject == "" || in.Body == "" {
				http.Error(w, "missing fields", http.StatusBadRequest)
				return
			}

			var msg Message
			err := db.QueryRow(
				`INSERT INTO messages(sender, receiver, subject, body)
				 VALUES($1,$2,$3,$4)
				 RETURNING id, sender, receiver, subject, body, created_at`,
				username, in.Receiver, in.Subject, in.Body,
			).Scan(&msg.ID, &msg.Sender, &msg.Receiver, &msg.Subject, &msg.Body, &msg.CreatedAt)
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

			var totalItems int64
			if err := db.QueryRow(`SELECT COUNT(*) FROM messages WHERE receiver=$1`, username).Scan(&totalItems); err != nil {
				log.Println("count query error:", err)
				http.Error(w, "db error", http.StatusInternalServerError)
				return
			}

			totalPages := int(math.Ceil(float64(totalItems) / float64(pageSize)))
			offset := (page - 1) * pageSize

			rows, err := db.Query(
				`SELECT id, sender, receiver, subject, body, created_at
				 FROM messages
				 WHERE receiver=$1
				 ORDER BY created_at DESC
				 LIMIT $2 OFFSET $3`,
				username, pageSize, offset,
			)
			if err != nil {
				log.Println("select query error:", err)
				http.Error(w, "db error", http.StatusInternalServerError)
				return
			}
			defer rows.Close()

			var messages []Message
			for rows.Next() {
				var m Message
				if err := rows.Scan(&m.ID, &m.Sender, &m.Receiver, &m.Subject, &m.Body, &m.CreatedAt); err != nil {
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

		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	})
}
