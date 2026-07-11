// lib/api/admin/returns.ts
import { apiClient } from "@/lib/api-client";
import type {
  ReturnRequest,
  ReturnStatus,
  ReturnStatusUpdateInput,
  Paginated,
} from "@/lib/types";

export const adminReturnsApi = {
  list: (params: { page?: number; status?: ReturnStatus | "" } = {}) => {
    const qs = new URLSearchParams({
      page: String(params.page ?? 1),
      limit: "20",
    });
    if (params.status) qs.set("status", params.status);
    return apiClient.get<Paginated<ReturnRequest>>(
      `/returns?${qs.toString()}`,
    );
  },

  byId: (returnId: string) =>
    apiClient.get<ReturnRequest>(`/returns/${returnId}`),

  updateStatus: (returnId: string, payload: ReturnStatusUpdateInput) =>
    apiClient.put<ReturnRequest>(`/returns/${returnId}/status`, payload),
};