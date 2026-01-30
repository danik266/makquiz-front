"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface User {
  username: string;
  email?: string;
  role?: "teacher" | "student";
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string, username: string, role?: "teacher" | "student") => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");
    const storedRole = localStorage.getItem("role") as "teacher" | "student" | null;

    if (storedToken && storedUsername) {
      const userRole = storedRole || "student";
      setToken(storedToken);
      setUser({
        username: storedUsername,
        role: userRole
      });
      // Восстанавливаем cookie при загрузке страницы
      document.cookie = `user_role=${userRole}; path=/; max-age=${60 * 60 * 24 * 30}`;
    }

    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUsername: string, role: "teacher" | "student" = "student") => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("username", newUsername);
    localStorage.setItem("role", role);

    // Устанавливаем cookie для middleware
    document.cookie = `user_role=${role}; path=/; max-age=${60 * 60 * 24 * 30}`; // 30 дней

    setToken(newToken);
    setUser({
      username: newUsername,
      role
    });

    // Автоматическое перенаправление
    if (role === "teacher") {
      router.push("/teacher-dashboard");
    } else {
      router.push("/dashboard");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    // Удаляем cookie
    document.cookie = "user_role=; path=/; max-age=0";

    setToken(null);
    setUser(null);

    router.push("/auth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
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