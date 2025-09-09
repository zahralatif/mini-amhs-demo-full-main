'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { postJSON } from './api';

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
    const storedToken = localStorage.getItem('jwt_token');
    if (storedToken) {
      setToken(storedToken);
      // You could also decode the token here to get the username
      const storedUsername = localStorage.getItem('username');
      if (storedUsername) {
        setUsername(storedUsername);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (user: string, pass: string) => {
    try {
      const { token: newToken } = await postJSON<{ token: string }>('/api/auth/login', {
        username: user,
        password: pass,
      });
      setToken(newToken);
      setUsername(user); // Or decode from JWT
      localStorage.setItem('jwt_token', newToken);
      localStorage.setItem('username', user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error; // Re-throw to be handled by the form
    }
  };

  const logout = () => {
    setToken(null);
    setUsername(null);
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('username');
  };

  const register = async (user: string, pass: string) => {
    try {
      await postJSON('/api/auth/register', {
        username: user,
        password: pass,
      });
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
