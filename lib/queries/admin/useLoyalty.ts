// lib/queries/admin/useLoyalty.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { loyaltyApi } from "@/lib/api/loyalty";
import { queryKeys } from "@/lib/queries/keys";
import type { LoyaltyAdjustInput } from "@/lib/types";

export function useAdminLoyaltyBalance(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.admin.loyaltyBalance(userId ?? ""),
    queryFn: () => loyaltyApi.balance(userId!),
    enabled: Boolean(userId),
  });
}

export function useAdminLoyaltyHistory(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.admin.loyaltyHistory(userId ?? ""),
    queryFn: () => loyaltyApi.history(userId!),
    enabled: Boolean(userId),
  });
}

export function useAdjustLoyaltyPoints(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: LoyaltyAdjustInput) => loyaltyApi.adjust(payload),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.admin.loyaltyBalance(userId),
      });
      qc.invalidateQueries({
        queryKey: queryKeys.admin.loyaltyHistory(userId),
      });
    },
  });
}
