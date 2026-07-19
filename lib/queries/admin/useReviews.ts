// lib/queries/admin/useReviews.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminReviewsApi } from "@/lib/api/admin/reviews";

export function useAdminProductReviews(productId: string) {
  return useQuery({
    queryKey: ["admin", "reviews", "product", productId],
    queryFn: () => adminReviewsApi.byProduct(productId),
    enabled: Boolean(productId),
  });
}

export function useAdminUpdateReview(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      reviewId,
      payload,
    }: {
      reviewId: string;
      payload: { rating?: number; comment?: string };
    }) => adminReviewsApi.update(reviewId, payload),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ["admin", "reviews", "product", productId],
      }),
  });
}

export function useAdminDeleteReview(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => adminReviewsApi.remove(reviewId),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ["admin", "reviews", "product", productId],
      }),
  });
}
