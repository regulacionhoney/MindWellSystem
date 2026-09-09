import api, { unwrap } from "./api";
import type { Appointment, AppointmentStatus, Paginated } from "@/types";

export type AppointmentListParams = {
  status?: AppointmentStatus | "all";
  per_page?: number;
};

export type CreateAppointmentPayload = {
  request_id?: number;
  student_id: number;
  scheduled_at: string;
  duration_minutes: number;
  notes?: string;
};

export type UpdateAppointmentPayload = Partial<CreateAppointmentPayload> & {
  status?: AppointmentStatus;
};

export const appointmentApi = {
  async listAppointments(params?: AppointmentListParams): Promise<Paginated<Appointment>> {
    const query: Record<string, string> = {};
    if (params?.status && params.status !== "all") query.status = params.status;
    if (params?.per_page) query.per_page = String(params.per_page);
    return unwrap(await api.get<Paginated<Appointment>>("/appointments", { params: query }));
  },

  async getAppointment(id: number): Promise<Appointment> {
    return unwrap(await api.get<Appointment>(`/appointments/${id}`));
  },

  async createAppointment(payload: CreateAppointmentPayload): Promise<Appointment> {
    return unwrap(await api.post<Appointment>("/appointments", payload));
  },

  async updateAppointment(id: number, payload: UpdateAppointmentPayload): Promise<Appointment> {
    return unwrap(await api.put<Appointment>(`/appointments/${id}`, payload));
  },

  async deleteAppointment(id: number): Promise<void> {
    await api.delete(`/appointments/${id}`);
  },

  async confirmAppointment(id: number): Promise<Appointment> {
    return unwrap(await api.patch<Appointment>(`/appointments/${id}/confirm`));
  },

  async completeAppointment(id: number): Promise<Appointment> {
    return unwrap(await api.patch<Appointment>(`/appointments/${id}/complete`));
  },

  async cancelAppointment(id: number): Promise<Appointment> {
    return unwrap(await api.patch<Appointment>(`/appointments/${id}/cancel`));
  },
};