import api, { unwrap } from "./api";
import type { CounselingRequest, CounselingRequestStatus, Paginated } from "@/types";

export type RequestListParams = {
  status?: CounselingRequestStatus | "all";
  per_page?: number;
};

export type CreateRequestPayload = {
  category: string;
  description: string;
  urgency: "low" | "medium" | "high" | "urgent";
};

export type UpdateRequestPayload = Partial<CreateRequestPayload>;

export const counselingApi = {
  async listRequests(params?: RequestListParams): Promise<Paginated<CounselingRequest>> {
    const query: Record<string, string> = {};
    if (params?.status && params.status !== "all") query.status = params.status;
    if (params?.per_page) query.per_page = String(params.per_page);
    return unwrap(await api.get<Paginated<CounselingRequest>>("/counseling-requests", { params: query }));
  },

  async getRequest(id: number): Promise<CounselingRequest> {
    return unwrap(await api.get<CounselingRequest>(`/counseling-requests/${id}`));
  },

  async createRequest(payload: CreateRequestPayload): Promise<CounselingRequest> {
    return unwrap(await api.post<CounselingRequest>("/counseling-requests", payload));
  },

  async updateRequest(id: number, payload: UpdateRequestPayload): Promise<CounselingRequest> {
    return unwrap(await api.put<CounselingRequest>(`/counseling-requests/${id}`, payload));
  },

  async deleteRequest(id: number): Promise<void> {
    await api.delete(`/counseling-requests/${id}`);
  },

  async reviewRequest(id: number, status: CounselingRequestStatus): Promise<CounselingRequest> {
    return unwrap(await api.patch<CounselingRequest>(`/counseling-requests/${id}/review`, { status }));
  },
};