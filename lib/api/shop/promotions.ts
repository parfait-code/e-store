// lib/api/shop/promotions.ts
import { apiClient } from "@/lib/api-client";
import type { PromotionPublic, PromotionProductsResponse } from "@/lib/types";

export const shopPromotionsApi = {
  // Normalisé défensivement : que l'API renvoie un tableau brut ou un objet
  // paginé {items,...}, le composant reçoit toujours un tableau exploitable.
  active: () =>
    apiClient
      .get<
        PromotionPublic[] | { items: PromotionPublic[] }
      >("/promotions/active")
      .then((res) => (Array.isArray(res) ? res : (res?.items ?? []))),

  bySlug: (slug: string) =>
    apiClient.get<PromotionPublic>(`/promotions/slug/${slug}`),

  productsBySlug: (slug: string) =>
    apiClient.get<PromotionProductsResponse>(
      `/promotions/slug/${slug}/products`,
    ),
};
