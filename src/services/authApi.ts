import api, { unwrap } from "./api";
import type { User } from "@/types";

export type AuthResponse = {
  user: User;
  token: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: "student" | "counselor";
  phone?: string;
};

export type UpdateProfilePayload = {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
};

export type UpdatePasswordPayload = {
  current_password: string;
  password: string;
  password_confirmation: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export type ForgotPasswordResponse = {
  reset_token: string | null;
  reset_url: string | null;
};

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    return unwrap(await api.post<AuthResponse>("/login", { email, password }));
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    return unwrap(await api.post<AuthResponse>("/register", payload));
  },

  async me(): Promise<User> {
    return unwrap(await api.get<User>("/me"));
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    return unwrap(await api.put<User>("/me", payload));
  },

  async updatePassword(payload: UpdatePasswordPayload): Promise<void> {
    await api.put("/me/password", payload);
  },

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    return unwrap(await api.post<ForgotPasswordResponse>("/auth/forgot-password", { email }));
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    await api.post("/auth/reset-password", payload);
  },

  async logout(): Promise<void> {
    await api.post("/logout");
  },
};