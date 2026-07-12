// lib/queries/shop/useLoyalty.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { loyaltyApi } from "@/lib/api/loyalty";
import { queryKeys } from "@/lib/queries/keys";

export function useMyLoyaltyBalance(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.shop.loyaltyBalance(userId ?? ""),
    queryFn: () => loyaltyApi.balance(userId!),
    enabled: Boolean(userId),
  });
}

export function useMyLoyaltyHistory(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.shop.loyaltyHistory(userId ?? ""),
    queryFn: () => loyaltyApi.history(userId!),
    enabled: Boolean(userId),
  });
}
