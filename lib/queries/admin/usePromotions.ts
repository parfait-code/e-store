// lib/queries/admin/usePromotions.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminPromotionsApi } from "@/lib/api/admin/promotions";
import { queryKeys } from "@/lib/queries/keys";
import type { PromotionStatus } from "@/lib/types";

export function useAdminPromotions(params: {
  status?: PromotionStatus | "";
  isActive?: "" | "true" | "false";
}) {
  return useQuery({
    queryKey: queryKeys.admin.promotions(params),
    queryFn: () => adminPromotionsApi.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useTogglePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminPromotionsApi.toggle(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin", "promotions"] }),
  });
}

export function useDeletePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminPromotionsApi.remove(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin", "promotions"] }),
  });
}
