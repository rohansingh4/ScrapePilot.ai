"use client";

import * as React from "react";
import { apiClient, type User } from "@/lib/api/client";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, name: string, password: string) => Promise<{ success: boolean; error?: string }>;
  googleLogin: (credential: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const isAuthenticated = !!user;

  const refreshUser = React.useCallback(async () => {
    if (!apiClient.getAccessToken()) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.getMe();
      if (response.success && response.data?.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
        apiClient.clearTokens();
      }
    } catch {
      setUser(null);
      apiClient.clearTokens();
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = React.useCallback(async (email: string, password: string) => {
    const response = await apiClient.login(email, password);
    if (response.success && response.data) {
      apiClient.setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
      setUser(response.data.user);
      return { success: true };
    }
    return { success: false, error: response.error?.message || "Login failed" };
  }, []);

  const register = React.useCallback(async (email: string, name: string, password: string) => {
    const response = await apiClient.register(email, name, password);
    if (response.success && response.data) {
      apiClient.setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
      setUser(response.data.user);
      return { success: true };
    }
    return { success: false, error: response.error?.message || "Registration failed" };
  }, []);

  const googleLogin = React.useCallback(async (credential: string) => {
    const response = await apiClient.googleAuth(credential);
    if (response.success && response.data) {
      apiClient.setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
      setUser(response.data.user);
      return { success: true };
    }
    return { success: false, error: response.error?.message || "Google login failed" };
  }, []);

  const logout = React.useCallback(async () => {
    await apiClient.logout();
    setUser(null);
  }, []);

  const value = React.useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      login,
      register,
      googleLogin,
      logout,
      refreshUser,
    }),
    [user, isLoading, isAuthenticated, login, register, googleLogin, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
