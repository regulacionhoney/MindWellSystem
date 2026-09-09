import axios, { type AxiosError, type AxiosInstance, type AxiosResponse } from "axios";

export const TOKEN_KEY = "mindwell_token";
export const USER_KEY = "mindwell_user";

export const tokenStorage = {
  getToken: (): string | null => sessionStorage.getItem(TOKEN_KEY),
  setToken: (token: string): void => sessionStorage.setItem(TOKEN_KEY, token),
  clearToken: (): void => sessionStorage.removeItem(TOKEN_KEY),
};

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
    accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && tokenStorage.getToken()) {
      tokenStorage.clearToken();
      sessionStorage.removeItem(USER_KEY);
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  },
);

export type ApiResponseEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export function unwrap<T>(response: AxiosResponse<ApiResponseEnvelope<T> | T>): T {
  return (response.data as ApiResponseEnvelope<T>).data;
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; data?: { errors?: Record<string, string[]> } }
      | undefined;
    const errors = data?.data?.errors;
    if (errors) {
      const first = Object.values(errors)[0];
      if (first?.length) return first[0];
    }
    if (data?.message) return data.message;
    if (error.code === "ERR_NETWORK") return "Cannot reach the server. Is the API running?";
  }
  return "Something went wrong. Please try again.";
}

export default api;