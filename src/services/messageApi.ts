import api, { unwrap } from "./api";
import type { Message, Paginated } from "@/types";

export const messageApi = {
  async conversations(): Promise<Message[]> {
    return unwrap(await api.get<Message[]>("/conversations"));
  },

  async conversation(userId: number, params?: { per_page?: number }): Promise<Paginated<Message>> {
    const query: Record<string, string> = {};
    if (params?.per_page) query.per_page = String(params.per_page);
    return unwrap(await api.get<Paginated<Message>>(`/conversations/${userId}`, { params: query }));
  },

  async sendMessage(payload: { receiver_id: number; content: string; appointment_id?: number }): Promise<Message> {
    return unwrap(await api.post<Message>("/messages", payload));
  },

  async markConversationRead(userId: number): Promise<void> {
    await api.post(`/conversations/${userId}/read`);
  },
};