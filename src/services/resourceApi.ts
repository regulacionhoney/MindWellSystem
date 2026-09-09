import api, { unwrap } from "./api";
import type { Paginated, ResourceCategory, WellnessResource } from "@/types";

export type ResourceListParams = {
  category?: ResourceCategory | "all";
  search?: string;
  per_page?: number;
};

export type CreateResourcePayload = {
  title: string;
  content: string;
  category: ResourceCategory;
  author?: string;
  is_published?: boolean;
  image_url?: string;
};

export type UpdateResourcePayload = Partial<CreateResourcePayload>;

export const resourceApi = {
  async publicList(params?: ResourceListParams): Promise<Paginated<WellnessResource>> {
    const query: Record<string, string> = {};
    if (params?.category && params.category !== "all") query.category = params.category;
    if (params?.search) query.search = params.search;
    if (params?.per_page) query.per_page = String(params.per_page);
    return unwrap(await api.get<Paginated<WellnessResource>>("/wellness-resources", { params: query }));
  },

  async manageList(params?: ResourceListParams): Promise<Paginated<WellnessResource>> {
    const query: Record<string, string> = {};
    if (params?.category && params.category !== "all") query.category = params.category;
    if (params?.per_page) query.per_page = String(params.per_page);
    return unwrap(await api.get<Paginated<WellnessResource>>("/wellness-resources/manage", { params: query }));
  },

  async getResource(id: number): Promise<WellnessResource> {
    return unwrap(await api.get<WellnessResource>(`/wellness-resources/${id}`));
  },

  async createResource(payload: CreateResourcePayload): Promise<WellnessResource> {
    return unwrap(await api.post<WellnessResource>("/wellness-resources", payload));
  },

  async updateResource(id: number, payload: UpdateResourcePayload): Promise<WellnessResource> {
    return unwrap(await api.put<WellnessResource>(`/wellness-resources/${id}`, payload));
  },

  async deleteResource(id: number): Promise<void> {
    await api.delete(`/wellness-resources/${id}`);
  },
};