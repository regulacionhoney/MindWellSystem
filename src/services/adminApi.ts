import api, { unwrap } from "./api";
import type { AdminStats, Paginated, User, UserRole } from "@/types";

export type UserListParams = {
  role?: UserRole | "all";
  search?: string;
  per_page?: number;
};

export type UpdateUserPayload = {
  name?: string;
  email?: string;
  role?: UserRole;
  phone?: string;
  avatar?: string;
  is_active?: boolean;
};

export const adminApi = {
  async listUsers(params?: UserListParams): Promise<Paginated<User>> {
    const query: Record<string, string> = {};
    if (params?.role && params.role !== "all") query.role = params.role;
    if (params?.search) query.search = params.search;
    if (params?.per_page) query.per_page = String(params.per_page);
    return unwrap(await api.get<Paginated<User>>("/admin/users", { params: query }));
  },

  async getUser(id: number): Promise<User> {
    return unwrap(await api.get<User>(`/admin/users/${id}`));
  },

  async updateUser(id: number, payload: UpdateUserPayload): Promise<User> {
    return unwrap(await api.put<User>(`/admin/users/${id}`, payload));
  },

  async toggleActive(id: number): Promise<User> {
    return unwrap(await api.patch<User>(`/admin/users/${id}/toggle-active`));
  },

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/admin/users/${id}`);
  },

  async stats(): Promise<AdminStats> {
    return unwrap(await api.get<AdminStats>("/admin/stats"));
  },
};