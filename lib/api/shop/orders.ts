// lib/api/shop/orders.ts
import { apiClient } from "@/lib/api-client";
import type {
  Order,
  Paginated,
  ReturnRequest,
  ReturnCreateInput,
  ProductReview,
  ReviewCreateInput,
} from "@/lib/types";

export const shopOrdersApi = {
  list: (limit = 50) =>
    apiClient.get<Paginated<Order>>(`/orders?limit=${limit}`),

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
