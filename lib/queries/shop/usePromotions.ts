// lib/queries/shop/usePromotions.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { shopPromotionsApi } from "@/lib/api/shop/promotions";
import { queryKeys } from "@/lib/queries/keys";

export function useActivePromotions(
  params: { page?: number; limit?: number; slot?: "hero" } = {},
) {
  return useQuery({
    queryKey: queryKeys.shop.activePromotions(params),
    queryFn: () => shopPromotionsApi.active(params),
  });
}

export function usePromotionBySlug(slug: string) {
  return useQuery({
    queryKey: queryKeys.shop.promotionBySlug(slug),
    queryFn: () => shopPromotionsApi.bySlug(slug),
    enabled: Boolean(slug),
  });
}

// Non bloquant côté page : si cet appel échoue, on masque simplement le
// bouton "Voir les produits" plutôt que de faire échouer la page entière —
// d'où l'absence de gestion d'erreur ici, gérée au niveau du composant via
// `productsInfo ?? null`.
export function usePromotionProductsBySlug(slug: string) {
  return useQuery({
    queryKey: queryKeys.shop.promotionProductsBySlug(slug),
    queryFn: () => shopPromotionsApi.productsBySlug(slug),
    enabled: Boolean(slug),
    retry: false,
  });
}
