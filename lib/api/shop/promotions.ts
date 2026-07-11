// lib/api/shop/promotions.ts
import { apiClient } from "@/lib/api-client";
import type { PromotionPublic, PromotionProductsResponse } from "@/lib/types";

export const shopPromotionsApi = {
  // ⚠️ Route en attente de confirmation côté backend — voir doc transmise.
  active: () => apiClient.get<PromotionPublic[]>("/promotions/active"),

  bySlug: (slug: string) =>
    apiClient.get<PromotionPublic>(`/promotions/slug/${slug}`),

  productsBySlug: (slug: string) =>
    apiClient.get<PromotionProductsResponse>(
      `/promotions/slug/${slug}/products`,
    ),
};
