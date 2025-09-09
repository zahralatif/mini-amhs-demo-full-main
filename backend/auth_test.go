package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/assert"
)

func TestRegisterHandler_Success(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer db.Close()

	// Mock bcrypt since it's slow
	bcryptGenerateFromPassword = func(password []byte, cost int) ([]byte, error) {
		return []byte("hashedpassword"), nil
	}

	reqBody := map[string]string{
		"username": "testuser",
		"password": "password123",
	}
	body, _ := json.Marshal(reqBody)

	req, err := http.NewRequest("POST", "/api/auth/register", bytes.NewReader(body))
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := registerHandler(db)

	rows := sqlmock.NewRows([]string{"id", "username", "created_at"}).
		AddRow(1, "testuser", time.Now())

	mock.ExpectQuery(`INSERT INTO users`).
		WithArgs("testuser", "hashedpassword").
		WillReturnRows(rows)

	handler.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusOK, rr.Code)

	var user User
	err = json.Unmarshal(rr.Body.Bytes(), &user)
	assert.NoError(t, err)
	assert.Equal(t, "testuser", user.Username)

	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestRegisterHandler_UsernameTaken(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer db.Close()

	bcryptGenerateFromPassword = func(password []byte, cost int) ([]byte, error) {
		return []byte("hashedpassword"), nil
	}

	reqBody := map[string]string{
		"username": "testuser",
		"password": "password123",
	}
	body, _ := json.Marshal(reqBody)

	req, err := http.NewRequest("POST", "/api/auth/register", bytes.NewReader(body))
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := registerHandler(db)

	mock.ExpectQuery(`INSERT INTO users`).
		WithArgs("testuser", "hashedpassword").
		WillReturnError(errors.New("pq: duplicate key value violates unique constraint \"users_username_key\""))

	handler.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusConflict, rr.Code)
	assert.Equal(t, "username already taken\n", rr.Body.String())
	assert.NoError(t, mock.ExpectationsWereMet())
}

func TestLoginHandler_Success(t *testing.T) {
	jwtKey = []byte("test-secret") // Set a dummy secret for testing
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer db.Close()

	// Mock bcrypt compare
	bcryptCompareHashAndPassword = func(hashedPassword, password []byte) error {
		return nil
	}

	reqBody := map[string]string{
		"username": "testuser",
		"password": "password123",
	}
	body, _ := json.Marshal(reqBody)

	req, err := http.NewRequest("POST", "/api/login", bytes.NewReader(body))
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := loginHandler(db)

	rows := sqlmock.NewRows([]string{"id", "username", "password_hash", "created_at"}).
		AddRow(1, "testuser", "hashedpassword", time.Now())
	
	mock.ExpectQuery(`SELECT id, username, password_hash, created_at FROM users`).
		WithArgs("testuser").
		WillReturnRows(rows)

	handler.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusOK, rr.Code)

	var respBody map[string]string
	err = json.Unmarshal(rr.Body.Bytes(), &respBody)
	assert.NoError(t, err)
	assert.Contains(t, respBody, "token")

	assert.NoError(t, mock.ExpectationsWereMet())
}
