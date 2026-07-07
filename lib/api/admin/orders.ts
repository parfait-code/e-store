// lib/api/admin/orders.ts
import { apiClient } from "@/lib/api-client";
import type {
  Order,
  OrderStatus,
  OrderStatusUpdateInput,
  Paginated,
  Shipment,
} from "@/lib/types";

export const adminOrdersApi = {
  list: (
    params: {
      page?: number;
      status?: OrderStatus | "";
      customer?: string;
    } = {},
  ) => {
    const qs = new URLSearchParams({
      page: String(params.page ?? 1),
      limit: "20",
    });
    if (params.status) qs.set("status", params.status);
    if (params.customer) qs.set("customer", params.customer);
    return apiClient.get<Paginated<Order>>(`/orders?${qs.toString()}`);
  },

  byId: (orderId: string) => apiClient.get<Order>(`/orders/${orderId}`),

  updateStatus: (orderId: string, payload: OrderStatusUpdateInput) =>
    apiClient.put<Order>(`/orders/${orderId}/status`, payload),

  shipmentForOrder: (orderId: string) =>
    apiClient
      .get<Shipment | null>(`/orders/${orderId}/shipment`)
      .catch(() => null),
};
