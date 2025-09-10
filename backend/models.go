package main

import "time"

type User struct {
	ID           int64     `json:"id"`
	Username     string    `json:"username"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"created_at"`
}

type Message struct {
	ID         int64     `json:"id"`
	Sender     string    `json:"sender"`
	Receiver   string    `json:"receiver"`
	Subject    string    `json:"subject"`
	Body       string    `json:"body"`
	IsRead     bool      `json:"is_read"`
	IsArchived bool      `json:"is_archived"`
	CreatedAt  time.Time `json:"created_at"`
}

type PaginatedMessagesResponse struct {
	Data       []Message  `json:"data"`
	Pagination Pagination `json:"pagination"`
}

type Pagination struct {
	TotalItems  int64 `json:"totalItems"`
	TotalPages  int   `json:"totalPages"`
	CurrentPage int   `json:"currentPage"`
	PageSize    int   `json:"pageSize"`
}
