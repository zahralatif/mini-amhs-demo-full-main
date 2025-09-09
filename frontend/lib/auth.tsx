'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { postJSON } from './api';
import type { LoginRequest, LoginResponse, RegisterRequest } from './types';

// Define the shape of the context data
interface AuthContextType {
  token: string | null;
  username: string | null;
  register: (username: string, password: string) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the props for the provider component
interface AuthProviderProps {
  children: ReactNode;
}

// Create a provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('jwt_token');
        const storedUsername = localStorage.getItem('username');
        
        if (storedToken && storedUsername) {
          setToken(storedToken);
          setUsername(storedUsername);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear potentially corrupted data
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('username');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (user: string, pass: string) => {
    try {
      const loginData: LoginRequest = {
        username: user,
        password: pass,
      };
      const response = await postJSON<LoginRequest, LoginResponse>('/api/login', loginData);
      
      // Validate response
      if (!response.token) {
        throw new Error('Invalid response: No token received');
      }
      
      setToken(response.token);
      setUsername(user); // Or decode from JWT
      
      // Store in localStorage with error handling
      try {
        localStorage.setItem('jwt_token', response.token);
        localStorage.setItem('username', user);
      } catch (storageError) {
        console.warn('Failed to store auth data in localStorage:', storageError);
        // Continue anyway - the user is still logged in for this session
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error; // Re-throw to be handled by the form
    }
  };

  const logout = () => {
    try {
      setToken(null);
      setUsername(null);
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('username');
    } catch (error) {
      console.error('Error during logout:', error);
      // Force clear state even if localStorage fails
      setToken(null);
      setUsername(null);
    }
  };

  const register = async (user: string, pass: string) => {
    try {
      const registerData: RegisterRequest = {
        username: user,
        password: pass,
      };
      await postJSON<RegisterRequest, { message: string }>('/api/register', registerData);
      // After successful registration, log the user in
      await login(user, pass);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error; // Re-throw to be handled by the form
    }
  };

  const value = { token, username, register, login, logout, isLoading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Create a custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
