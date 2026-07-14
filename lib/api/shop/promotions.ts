// lib/api/shop/promotions.ts
import { apiClient } from "@/lib/api-client";
import type {
  PromotionPublic,
  PromotionProductsResponse,
  Paginated,
} from "@/lib/types";

export const shopPromotionsApi = {
  active: (params: { page?: number; limit?: number; slot?: "hero" } = {}) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.slot) qs.set("slot", params.slot);
    return apiClient
      .get<Paginated<PromotionPublic>>(`/promotions/active?${qs.toString()}`)
      .then((res) => ({
        items: Array.isArray(res?.items) ? res.items : [],
        total: res?.total ?? 0,
        page: res?.page ?? 1,
        limit: res?.limit ?? 20,
        totalPages: res?.totalPages ?? 1,
      }));
  },

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
