import api, { unwrap } from "./api";
import type { AppNotification, Paginated } from "@/types";

export const notificationApi = {
  async listNotifications(params?: { per_page?: number }): Promise<Paginated<AppNotification>> {
    const query: Record<string, string> = {};
    if (params?.per_page) query.per_page = String(params.per_page);
    return unwrap(await api.get<Paginated<AppNotification>>("/notifications", { params: query }));
  },

  async markAsRead(id: number): Promise<AppNotification> {
    return unwrap(await api.post<AppNotification>(`/notifications/${id}/read`));
  },

  async markAllAsRead(): Promise<void> {
    await api.post("/notifications/read-all");
  },

  async deleteNotification(id: number): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },
};