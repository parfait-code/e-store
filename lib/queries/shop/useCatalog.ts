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

// NOUVEAU — produits paginés d'une catégorie (et ses descendantes) par slug
export function useCategoryProducts(slug: string, page: number, limit = 24) {
  return useQuery({
    queryKey: queryKeys.shop.categoryProducts(slug, page),
    queryFn: () => shopCatalogApi.productsByCategorySlug(slug, page, limit),
    enabled: Boolean(slug),
    placeholderData: (prev) => prev,
  });
}

export function useProducts(params: {
  page: number;
  categoryId?: string;
  search?: string;
  limit?: number; // NOUVEAU — nécessaire pour la home (étape 10)
}) {
  return useQuery({
    queryKey: queryKeys.shop.products(params),
    queryFn: () => shopCatalogApi.listProducts(params),
    placeholderData: (prev) => prev,
  });
}

export function useNewestProducts(limit = 8) {
  return useQuery({
    queryKey: queryKeys.shop.newestProducts(limit),
    queryFn: () => shopCatalogApi.newestProducts(limit),
    staleTime: 5 * 60 * 1000, // pas besoin de re-fetch agressif pour ce bloc
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
