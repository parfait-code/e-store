// lib/api/admin/pickupRequests.ts
import { apiClient } from "@/lib/api-client";
import type {
  PickupRequest,
  PickupRequestStatus,
  PickupRequestLocationUpdateInput,
  PickupRequestStatusUpdateInput,
  Paginated,
} from "@/lib/types";

export const adminPickupRequestsApi = {
  list: (
    params: {
      page?: number;
      limit?: number;
      status?: PickupRequestStatus | "";
      orderId?: string;
    } = {},
  ) => {
    const qs = new URLSearchParams({
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 20),
    });
    if (params.status) qs.set("status", params.status);
    if (params.orderId) qs.set("order_id", params.orderId);
    return apiClient.get<Paginated<PickupRequest>>(
      `/pickup-requests?${qs.toString()}`,
    );
  },

  byId: (id: string) => apiClient.get<PickupRequest>(`/pickup-requests/${id}`),

  updateLocation: (id: string, payload: PickupRequestLocationUpdateInput) =>
    apiClient.patch<PickupRequest>(`/pickup-requests/${id}/location`, payload),

  updateStatus: (id: string, payload: PickupRequestStatusUpdateInput) =>
    apiClient.patch<PickupRequest>(`/pickup-requests/${id}/status`, payload),

  expireOverdue: () => apiClient.post("/pickup-requests/expire-overdue"),
};
