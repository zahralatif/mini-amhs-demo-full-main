// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

// Auth Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user?: {
    id: string;
    username: string;
  };
}

export interface RegisterRequest {
  username: string;
  password: string;
}

// Message Types
export interface Message {
  id: number;
  sender: string;
  receiver: string;
  subject: string;
  body: string;
  created_at: string; // ISO string from backend
  updated_at?: string;
}

export interface CreateMessageRequest {
  receiver: string;
  subject: string;
  body: string;
}

export interface CreateMessageResponse {
  id: number;
  message: string;
}

// User Types
export interface User {
  id: string;
  username: string;
  created_at: string;
}

// Error Types
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// Theme Types
export type ColorMode = 'light' | 'dark';

// Form Types
export interface FormState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}
