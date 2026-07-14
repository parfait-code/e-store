// lib/queries/shop/usePopups.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { shopPopupsApi } from "@/lib/api/shop/popups";
import { queryKeys } from "@/lib/queries/keys";

export function useActivePopups() {
  return useQuery({
    queryKey: queryKeys.shop.activePopups,
    queryFn: shopPopupsApi.active,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
