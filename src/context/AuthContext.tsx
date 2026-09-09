import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { tokenStorage, USER_KEY } from "@/services/api";
import { authApi, type RegisterPayload } from "@/services/authApi";
import type { User, UserRole } from "@/types";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  role: UserRole | null;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  completeSocialSession: (user: User, token: string) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = sessionStorage.getItem(USER_KEY);
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => tokenStorage.getToken());
  const [loading, setLoading] = useState(() => Boolean(tokenStorage.getToken()));

  useEffect(() => {
    const currentToken = tokenStorage.getToken();
    if (!currentToken) {
      return;
    }
    authApi
      .me()
      .then((currentUser) => {
        setUser(currentUser);
        sessionStorage.setItem(USER_KEY, JSON.stringify(currentUser));
      })
      .catch(() => {
        tokenStorage.clearToken();
        sessionStorage.removeItem(USER_KEY);
        setUser(null);
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const storeSession = useCallback((authUser: User, authToken: string) => {
    tokenStorage.setToken(authToken);
    sessionStorage.setItem(USER_KEY, JSON.stringify(authUser));
    setUser(authUser);
    setToken(authToken);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    storeSession(response.user, response.token);
    return response.user;
  }, [storeSession]);

  const register = useCallback(async (payload: RegisterPayload) => {
    const response = await authApi.register(payload);
    storeSession(response.user, response.token);
    return response.user;
  }, [storeSession]);

  const completeSocialSession = useCallback(
    (authUser: User, authToken: string) => {
      storeSession(authUser, authToken);
    },
    [storeSession],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // The token may already be invalid.
    }
    tokenStorage.clearToken();
    sessionStorage.removeItem(USER_KEY);
    setUser(null);
    setToken(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const currentUser = await authApi.me();
    setUser(currentUser);
    sessionStorage.setItem(USER_KEY, JSON.stringify(currentUser));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      role: user?.role ?? null,
      login,
      register,
      completeSocialSession,
      logout,
      refreshUser,
    }),
    [user, token, loading, login, register, completeSocialSession, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}