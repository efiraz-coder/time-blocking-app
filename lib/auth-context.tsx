"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  user: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => false,
  logout: () => {},
  isLoading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tb_user");
      if (saved) {
        setUser(saved);
      }
    } catch {
      // localStorage not available
    }
    setIsLoading(false);
  }, []);

  const login = (username: string, password: string): boolean => {
    if (!username.trim() || !password.trim()) return false;

    // Simple auth - store username as session
    // Passwords are stored in localStorage (hashed in a real app)
    const usersJson = localStorage.getItem("tb_users") || "{}";
    const users: Record<string, string> = JSON.parse(usersJson);

    if (users[username]) {
      // User exists - check password
      if (users[username] !== password) {
        return false;
      }
    } else {
      // New user - register
      users[username] = password;
      localStorage.setItem("tb_users", JSON.stringify(users));
    }

    setUser(username);
    localStorage.setItem("tb_user", username);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("tb_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
