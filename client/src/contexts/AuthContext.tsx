"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import axios from "axios";
import api from "../services/api";

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    // Check if token is stored in localStorage
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      loadUser(storedToken);
    } else {
      setLoading(false);
    }

    // Check for token in URL (for OAuth callbacks)
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get("token");
    if (tokenParam) {
      localStorage.setItem("token", tokenParam);
      setToken(tokenParam);
      loadUser(tokenParam);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const loadUser = async (authToken: string) => {
    try {
      // Set auth token in axios headers
      api.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;

      const res = await api.get("/auth/me");
      setUser(res.data);
      setIsAuthenticated(true);
      setIsAdmin(res.data.isAdmin);
      setLoading(false);
    } catch (err) {
      localStorage.removeItem("token");
      setToken(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.post("/auth/register", { name, email, password });

      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setIsAuthenticated(true);
      setIsAdmin(res.data.user.isAdmin);

      // Set auth token in axios headers
      api.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;

      setLoading(false);
    } catch (err) {
      setLoading(false);
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || "Registration failed");
      } else {
        setError("Registration failed");
      }
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.post("/auth/login", { email, password });

      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setIsAuthenticated(true);
      setIsAdmin(res.data.user.isAdmin);

      // Set auth token in axios headers
      api.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;

      setLoading(false);
    } catch (err) {
      setLoading(false);
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || "Login failed");
      } else {
        setError("Login failed");
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);

    // Remove auth token from axios headers
    delete api.defaults.headers.common["Authorization"];
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        register,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
