// lib/api/admin/dashboard.ts
import { apiClient } from "@/lib/api-client";
import type { DashboardStats, SalesChartResponse } from "@/lib/types";

export const adminDashboardApi = {
  stats: () => apiClient.get<DashboardStats>("/dashboard/stats"),
  salesChart: (year: number) =>
    apiClient.get<SalesChartResponse>(
      `/dashboard/sales-chart?year=${year}&period=monthly`,
    ),
};
