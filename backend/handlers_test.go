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
	q := req.URL.Query()
	q.Add("page", "1")
	q.Add("pageSize", "10")
	// Note: archived=false is the default
	req.URL.RawQuery = q.Encode()

	rr := httptest.NewRecorder()
	handler := messagesHandler(db)

	// Mock for the COUNT query for inbox
	mock.ExpectQuery(`SELECT COUNT\(\*\) FROM messages WHERE receiver=\$1 AND receiver_archived=\$2`).
		WithArgs("testuser", false).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(1))

	// Mock for the SELECT query for inbox
	rows := sqlmock.NewRows([]string{"id", "sender", "receiver", "subject", "body", "is_read", "receiver_archived", "sender_archived", "created_at"}).
		AddRow(1, "sender1", "testuser", "Test Subject", "Test Body", false, false, false, time.Now())

	mock.ExpectQuery(`SELECT id, sender, receiver, subject, body, is_read, receiver_archived, sender_archived, created_at FROM messages WHERE receiver=\$1 AND receiver_archived=\$2`).
		WithArgs("testuser", false, 10, 0). // username, archived, pageSize, offset
		WillReturnRows(rows)

	handler.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusOK, rr.Code, "Expected status OK")

	var resp PaginatedMessagesResponse
	err = json.Unmarshal(rr.Body.Bytes(), &resp)
	assert.NoError(t, err, "Error unmarshalling response")
	assert.Equal(t, int64(1), resp.Pagination.TotalItems, "Expected 1 total item")
	assert.Equal(t, 1, resp.Pagination.TotalPages, "Expected 1 total page")
	assert.Len(t, resp.Data, 1, "Expected 1 message in data")

	assert.NoError(t, mock.ExpectationsWereMet(), "Mock expectations not met")
}
