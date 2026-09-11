import api, { unwrap } from "./api";
import type { Conversation, Message, Paginated, UserRef } from "@/types";

export const messageApi = {
  async conversations(): Promise<Conversation[]> {
    return unwrap(await api.get<Conversation[]>("/conversations"));
  },

  async contacts(): Promise<UserRef[]> {
    return unwrap(await api.get<UserRef[]>("/conversations/contacts"));
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