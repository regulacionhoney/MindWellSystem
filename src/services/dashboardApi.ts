import api, { unwrap } from "./api";
import type { DashboardData } from "@/types";

export const dashboardApi = {
  async getDashboard(): Promise<DashboardData> {
    return unwrap(await api.get<DashboardData>("/dashboard"));
  },
};