// lib/api/admin/payments.ts
import { apiClient } from "@/lib/api-client";
import type { Payment, PaymentStatus, Paginated } from "@/lib/types";

export const adminPaymentsApi = {
  list: (
    params: {
      page?: number;
      limit?: number;
      status?: PaymentStatus | "";
      method?: string;
      orderId?: string;
    } = {},
  ) => {
    const qs = new URLSearchParams({
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 20),
    });
    if (params.status) qs.set("status", params.status);
    if (params.method) qs.set("method", params.method);
    if (params.orderId) qs.set("order_id", params.orderId);
    return apiClient.get<Paginated<Payment>>(`/payments?${qs.toString()}`);
  },

  updateStatus: (
    paymentId: string,
    payload: { status: PaymentStatus; notes?: string },
  ) => apiClient.put<Payment>(`/payments/${paymentId}/status`, payload),

  reconcileCod: () =>
    apiClient.post<{ reconciledCount: number }>("/payments/reconcile-cod"),
};
