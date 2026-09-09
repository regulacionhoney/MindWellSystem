import api, { unwrap } from "./api";
import type { CounselingRecord, Paginated } from "@/types";

export type RecordListParams = {
  per_page?: number;
};

export type CreateRecordPayload = {
  appointment_id: number;
  student_id: number;
  session_notes: string;
  follow_up_notes?: string;
  follow_up_date?: string;
  is_confidential?: boolean;
};

export type UpdateRecordPayload = Partial<
  Pick<CreateRecordPayload, "session_notes" | "follow_up_notes" | "follow_up_date" | "is_confidential">
>;

export const recordApi = {
  async listRecords(params?: RecordListParams): Promise<Paginated<CounselingRecord>> {
    const query: Record<string, string> = {};
    if (params?.per_page) query.per_page = String(params.per_page);
    return unwrap(await api.get<Paginated<CounselingRecord>>("/counseling-records", { params: query }));
  },

  async getRecord(id: number): Promise<CounselingRecord> {
    return unwrap(await api.get<CounselingRecord>(`/counseling-records/${id}`));
  },

  async createRecord(payload: CreateRecordPayload): Promise<CounselingRecord> {
    return unwrap(await api.post<CounselingRecord>("/counseling-records", payload));
  },

  async updateRecord(id: number, payload: UpdateRecordPayload): Promise<CounselingRecord> {
    return unwrap(await api.put<CounselingRecord>(`/counseling-records/${id}`, payload));
  },

  async deleteRecord(id: number): Promise<void> {
    await api.delete(`/counseling-records/${id}`);
  },
};