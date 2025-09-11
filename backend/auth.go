package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var (
	bcryptGenerateFromPassword    = bcrypt.GenerateFromPassword
	bcryptCompareHashAndPassword  = bcrypt.CompareHashAndPassword
)

var jwtKey = []byte(os.Getenv("JWT_SECRET_KEY"))

type Claims struct {
	Username string `json:"username"`
	jwt.RegisteredClaims
}

func registerHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		setCORS(w, r)
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		if r.Method != http.MethodPost {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var in struct {
			Username string `json:"username"`
			Password string `json:"password"`
		}
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			http.Error(w, "invalid json", http.StatusBadRequest)
			return
		}

		in.Username = strings.TrimSpace(in.Username)
		in.Password = strings.TrimSpace(in.Password)
		if in.Username == "" || len(in.Username) < 3 {
			http.Error(w, "username must be at least 3 characters", http.StatusBadRequest)
			return
		}
		if in.Password == "" || len(in.Password) < 8 {
			http.Error(w, "password must be at least 8 characters", http.StatusBadRequest)
			return
		}

		passwordHash, err := bcryptGenerateFromPassword([]byte(in.Password), bcrypt.DefaultCost)
		if err != nil {
			log.Println("bcrypt error:", err)
			http.Error(w, "server error", http.StatusInternalServerError)
			return
		}

		var user User
		err = db.QueryRow(
			`INSERT INTO users(username, password_hash) VALUES($1, $2)
			 RETURNING id, username, created_at`,
			in.Username, string(passwordHash),
		).Scan(&user.ID, &user.Username, &user.CreatedAt)
		if err != nil {
			log.Println("db insert user error:", err)
			if strings.Contains(strings.ToLower(err.Error()), "unique") {
				http.Error(w, "username already taken", http.StatusConflict)
			} else {
				http.Error(w, "db error", http.StatusInternalServerError)
			}
			return
		}

		writeJSON(w, user)
	}
}

func loginHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		setCORS(w, r)
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		if r.Method != http.MethodPost {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var in struct {
			Username string `json:"username"`
			Password string `json:"password"`
		}
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			http.Error(w, "invalid json", http.StatusBadRequest)
			return
		}

		var user User
		err := db.QueryRow(
			`SELECT id, username, password_hash, created_at FROM users WHERE username=$1`,
			in.Username,
		).Scan(&user.ID, &user.Username, &user.PasswordHash, &user.CreatedAt)
		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "invalid credentials", http.StatusUnauthorized)
			} else {
				log.Println("db query user error:", err)
				http.Error(w, "db error", http.StatusInternalServerError)
			}
			return
		}

		if err := bcryptCompareHashAndPassword([]byte(user.PasswordHash), []byte(in.Password)); err != nil {
			http.Error(w, "invalid credentials", http.StatusUnauthorized)
			return
		}

		expirationTime := time.Now().Add(24 * time.Hour)
		claims := &Claims{
			Username: user.Username,
			RegisteredClaims: jwt.RegisteredClaims{
				ExpiresAt: jwt.NewNumericDate(expirationTime),
			},
		}

		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
		tokenString, err := token.SignedString(jwtKey)
		if err != nil {
			log.Println("jwt sign error:", err)
			http.Error(w, "server error", http.StatusInternalServerError)
			return
		}

		writeJSON(w, map[string]string{"token": tokenString})
	}
}
