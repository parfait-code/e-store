// lib/api/admin/promotions.ts
import { apiClient } from "@/lib/api-client";
import type { Promotion, PromotionStatus, Paginated } from "@/lib/types";

// Le guide (§4) documente la pagination {items,total,page,limit,totalPages}
// pour "les endpoints de listing" — mais certains renvoient encore un
// tableau brut selon leur ancienneté. On normalise ici une bonne fois pour
// toutes plutôt que de laisser chaque composant deviner la forme et planter
// sur un .map() si ce n'est pas un tableau.
function normalize(
  res: Paginated<Promotion> | Promotion[] | null,
): Paginated<Promotion> {
  if (Array.isArray(res)) {
    return {
      items: res,
      total: res.length,
      page: 1,
      limit: res.length || 1,
      totalPages: 1,
    };
  }
  return {
    items: res?.items ?? [],
    total: res?.total ?? 0,
    page: res?.page ?? 1,
    limit: res?.limit ?? 20,
    totalPages: res?.totalPages ?? 1,
  };
}

export const adminPromotionsApi = {
  list: (
    params: {
      status?: PromotionStatus | "";
      isActive?: "" | "true" | "false";
    } = {},
  ) => {
    const qs = new URLSearchParams();
    if (params.status) qs.set("status", params.status);
    if (params.isActive) qs.set("isActive", params.isActive);
    return apiClient
      .get<Paginated<Promotion> | Promotion[]>(`/promotions?${qs.toString()}`)
      .then(normalize);
  },

  affectedProducts: (id: string) =>
    apiClient.get<{
      promotionId: string;
      promotionName: string;
      count: number;
      products: import("@/lib/types").Product[];
    }>(`/promotions/${id}/products`),

  toggle: (id: string) =>
    apiClient.patch<Promotion>(`/promotions/${id}/toggle`),

  remove: (id: string) => apiClient.delete(`/promotions/${id}`),
};
