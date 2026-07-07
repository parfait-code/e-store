// lib/queries/shop/useCatalog.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { shopCatalogApi } from "@/lib/api/shop/catalog";
import { queryKeys } from "@/lib/queries/keys";

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.shop.categories,
    queryFn: shopCatalogApi.listCategories,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategoryBySlug(slug: string) {
  return useQuery({
    queryKey: queryKeys.shop.categoryBySlug(slug),
    queryFn: () => shopCatalogApi.categoryBySlug(slug),
    enabled: Boolean(slug),
  });
}

export function useProducts(params: {
  page: number;
  categoryId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: queryKeys.shop.products(params),
    queryFn: () => shopCatalogApi.listProducts(params),
    placeholderData: (prev) => prev,
  });
}

export function useProduct(productId: string) {
  return useQuery({
    queryKey: queryKeys.shop.product(productId),
    queryFn: () => shopCatalogApi.productById(productId),
    enabled: Boolean(productId),
  });
}

export function useProductCombinations(productId: string) {
  return useQuery({
    queryKey: queryKeys.shop.combinations(productId),
    queryFn: () => shopCatalogApi.combinations(productId),
    enabled: Boolean(productId),
  });
}
