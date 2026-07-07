// lib/queries/admin/useDashboard.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { adminDashboardApi } from "@/lib/api/admin/dashboard";
import { queryKeys } from "@/lib/queries/keys";

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.admin.dashboardStats,
    queryFn: adminDashboardApi.stats,
  });
}

export function useSalesChart(year: number) {
  return useQuery({
    queryKey: queryKeys.admin.salesChart(year),
    queryFn: () => adminDashboardApi.salesChart(year),
  });
}
