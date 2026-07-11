// lib/queries/shop/usePromotions.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { shopPromotionsApi } from "@/lib/api/shop/promotions";
import { queryKeys } from "@/lib/queries/keys";

export function useActivePromotions() {
  return useQuery({
    queryKey: queryKeys.shop.activePromotions,
    queryFn: shopPromotionsApi.active,
  });
}
