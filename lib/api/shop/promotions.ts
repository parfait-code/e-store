// lib/api/shop/promotions.ts
import { apiClient } from "@/lib/api-client";
import type { PromotionPublic, PromotionProductsResponse } from "@/lib/types";

export const shopPromotionsApi = {
  active: () =>
    apiClient
      .get<
        PromotionPublic[] | { items: PromotionPublic[] }
      >("/promotions/active")
      .then((res) => {
        if (Array.isArray(res)) return res;
        return Array.isArray(res?.items) ? res.items : [];
      }),

  bySlug: (slug: string) =>
    apiClient.get<PromotionPublic>(`/promotions/slug/${slug}`),

  productsBySlug: (slug: string) =>
    apiClient
      .get<PromotionProductsResponse>(`/promotions/slug/${slug}/products`)
      .then((res) => ({
        ...res,
        products: Array.isArray(res?.products) ? res.products : [],
      })),
};
