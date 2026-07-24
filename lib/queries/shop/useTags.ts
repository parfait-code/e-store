// lib/queries/shop/useTags.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { shopTagsApi } from "@/lib/api/shop/tags";

export function useShopTags() {
  return useQuery({
    queryKey: ["shop", "tags"],
    queryFn: shopTagsApi.list,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProductTags(productId: string) {
  return useQuery({
    queryKey: ["shop", "product-tags", productId],
    queryFn: () => shopTagsApi.byProduct(productId),
    enabled: Boolean(productId),
  });
}
