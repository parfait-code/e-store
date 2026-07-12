// components/ReviewsSection.tsx
"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { RatingStars } from "./RatingStars";
import { formatDate } from "@/lib/format";
import type { ProductReviewsResponse } from "@/lib/types";

export function ReviewsSection({ productId }: { productId: string }) {
  const [data, setData] = useState<ProductReviewsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<ProductReviewsResponse>(`/products/${productId}/reviews`)
      .then(setData)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [productId]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 size={20} className="animate-spin text-gray-400" />
      </div>
    );
  }

  const reviews = Array.isArray(data?.reviews) ? data!.reviews : [];

  if (!data || reviews.length === 0) {
    return (
      <p className="text-sm text-gray-400">
        Aucun avis pour ce produit pour le moment.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <span className="text-3xl font-semibold">
          {(data.average_rating ?? 0).toFixed(1)}
        </span>
        <div>
          <RatingStars rating={data.average_rating ?? 0} size={16} />
          <p className="text-xs text-gray-500">
            {data.total_reviews ?? reviews.length} avis
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="border-b border-gray-100 pb-4 last:border-0"
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium">
                {review.user?.firstName} {review.user?.lastName?.charAt(0)}.
              </span>
              <span className="text-xs text-gray-400">
                {formatDate(review.createdAt)}
              </span>
            </div>
            <RatingStars rating={review.rating} size={12} />
            {review.comment && (
              <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
