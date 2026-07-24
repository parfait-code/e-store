// lib/api/shop/orders.ts
import { apiClient } from "@/lib/api-client";
import type {
  Order,
  OrderStatus,
  Paginated,
  ReturnRequest,
  ReturnCreateInput,
  ProductReview,
  ReviewCreateInput,
} from "@/lib/types";

export const shopOrdersApi = {
  list: (
    params: { page?: number; limit?: number; status?: OrderStatus | "" } = {},
  ) => {
    const qs = new URLSearchParams();
    qs.set("page", String(params.page ?? 1));
    qs.set("limit", String(params.limit ?? 50));
    if (params.status) qs.set("status", params.status);
    return apiClient.get<Paginated<Order>>(`/orders?${qs.toString()}`);
  },

  byId: (orderId: string) => apiClient.get<Order>(`/orders/${orderId}`),

  cancel: (orderId: string) => apiClient.delete(`/orders/${orderId}`),

  returnsForOrder: (orderId: string) =>
    apiClient
      .get<ReturnRequest[]>(`/orders/${orderId}/returns`)
      .catch(() => [] as ReturnRequest[]),

  createReturn: (payload: ReturnCreateInput) =>
    apiClient.post<ReturnRequest>("/returns", payload),

  createReview: (payload: ReviewCreateInput) =>
    apiClient.post<ProductReview>("/reviews", payload),

  updateReview: (
    reviewId: string,
    payload: { rating: number; comment?: string },
  ) => apiClient.put<ProductReview>(`/reviews/${reviewId}`, payload),

  deleteReview: (reviewId: string) => apiClient.delete(`/reviews/${reviewId}`),
};
