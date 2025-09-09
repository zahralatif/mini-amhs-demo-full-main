package main

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/assert"
)

// Helper function to create a request with an authenticated user in the context
func newAuthenticatedRequest(username string) *http.Request {
	req, _ := http.NewRequest("GET", "/", nil)
	ctx := context.WithValue(req.Context(), userContextKey, username)
	return req.WithContext(ctx)
}

func TestMessagesHandler_GetMessages_Success(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer db.Close()

	req := newAuthenticatedRequest("testuser")
	// Add query params for pagination
	q := req.URL.Query()
	q.Add("page", "1")
	q.Add("pageSize", "10")
	req.URL.RawQuery = q.Encode()

	rr := httptest.NewRecorder()
	handler := messagesHandler(db)

	mock.ExpectQuery(`SELECT COUNT\(\*\) FROM messages`).
		WithArgs("testuser").
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(1))

	rows := sqlmock.NewRows([]string{"id", "sender", "receiver", "subject", "body", "created_at"}).
		AddRow(1, "sender1", "testuser", "Test Subject", "Test Body", time.Now())
	
	mock.ExpectQuery(`SELECT id, sender, receiver, subject, body, created_at FROM messages`).
		WithArgs("testuser", 10, 0).
		WillReturnRows(rows)

	handler.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusOK, rr.Code)

	var resp PaginatedMessagesResponse
	err = json.Unmarshal(rr.Body.Bytes(), &resp)
	assert.NoError(t, err)
	assert.Equal(t, int64(1), resp.Pagination.TotalItems)
	assert.Equal(t, 1, resp.Pagination.TotalPages)
	assert.Len(t, resp.Data, 1)

	assert.NoError(t, mock.ExpectationsWereMet())
}
