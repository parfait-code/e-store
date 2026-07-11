// lib/api/admin/shipments.ts
import { apiClient } from "@/lib/api-client";
import type {
  Shipment,
  ShipmentStatus,
  ShipmentStatusUpdateInput,
  ShipmentTrackingInput,
  ShipmentFormInput,
  Paginated,
} from "@/lib/types";

export const adminShipmentsApi = {
  list: (
    params: {
      page?: number;
      limit?: number;
      status?: ShipmentStatus | "";
      orderId?: string;
    } = {},
  ) => {
    const qs = new URLSearchParams({
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 20),
    });
    if (params.status) qs.set("status", params.status);
    if (params.orderId) qs.set("order_id", params.orderId);
    return apiClient.get<Paginated<Shipment>>(`/shipments?${qs.toString()}`);
  },

  byId: (id: string) => apiClient.get<Shipment>(`/shipments/${id}`),

  create: (payload: ShipmentFormInput) =>
    apiClient.post<Shipment>("/shipments", payload),

  updateStatus: (id: string, payload: ShipmentStatusUpdateInput) =>
    apiClient.put<Shipment>(`/shipments/${id}/status`, payload),

  addTracking: (id: string, payload: ShipmentTrackingInput) =>
    apiClient.post<Shipment>(`/shipments/${id}/track`, payload),

  cancel: (id: string) => apiClient.post(`/shipments/${id}/cancel`),

  generateLabel: (id: string) =>
    apiClient.get<{ label_id: string; label_url: string }>(`/labels/${id}`),
};
