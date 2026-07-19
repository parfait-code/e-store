// lib/api/admin/reviews.ts
import { apiClient } from "@/lib/api-client";
import type { ProductReviewsResponse } from "@/lib/types";

export const adminReviewsApi = {
  byProduct: (productId: string, page = 1, limit = 50) =>
    apiClient.get<ProductReviewsResponse>(
      `/products/${productId}/reviews?page=${page}&limit=${limit}`,
    ),

  update: (reviewId: string, payload: { rating?: number; comment?: string }) =>
    apiClient.put(`/reviews/${reviewId}`, payload),

  remove: (reviewId: string) => apiClient.delete(`/reviews/${reviewId}`),
};
