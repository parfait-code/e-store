// lib/queries/admin/useCatalog.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminCatalogApi } from "@/lib/api/admin/catalog";
import { queryKeys } from "@/lib/queries/keys";
import type { Product, ProductStatus } from "@/lib/types";

export function useAdminProducts(params: {
  page: number;
  categoryId?: string;
  search?: string;
  status?: ProductStatus | "";
}) {
  return useQuery({
    queryKey: queryKeys.admin.products(params),
    queryFn: () => adminCatalogApi.listProducts(params),
    placeholderData: (prev) => prev,
  });
}

export function useAdminProduct(productId: string) {
  return useQuery({
    queryKey: queryKeys.admin.product(productId),
    queryFn: () => adminCatalogApi.productById(productId),
    enabled: Boolean(productId),
  });
}

export function useAdminCategories() {
  return useQuery({
    queryKey: queryKeys.admin.categories,
    queryFn: adminCatalogApi.listCategories,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      adminCatalogApi.createProduct(payload),
    onSuccess: (created: Product) => {
      qc.setQueryData(queryKeys.admin.product(created.id), created);
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}

export function useUpdateProduct(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      adminCatalogApi.updateProduct(productId, payload),
    onSuccess: (updated: Product) => {
      qc.setQueryData(queryKeys.admin.product(productId), updated);
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => adminCatalogApi.deleteProduct(productId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}

// --- Images ---

export function useUploadProductImage(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => adminCatalogApi.uploadImage(productId, file),
    onSuccess: (updated: Product) => {
      qc.setQueryData(queryKeys.admin.product(productId), updated);
    },
  });
}

export function useDeleteProductImage(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (imageId: string) =>
      adminCatalogApi.deleteImage(productId, imageId),
    onSuccess: (updated: Product) => {
      qc.setQueryData(queryKeys.admin.product(productId), updated);
    },
  });
}

// --- Attributs non-variante ---

export function useSaveProductAttributes(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (
      attributes: { attributeDefinitionId: string; value: string }[],
    ) => adminCatalogApi.saveAttributes(productId, attributes),
    onSuccess: (updated: Product) => {
      qc.setQueryData(queryKeys.admin.product(productId), updated);
    },
  });
}

// --- Tags ---

export function useProductTags(productId: string) {
  return useQuery({
    queryKey: queryKeys.admin.productTags(productId),
    queryFn: () => adminCatalogApi.productTags(productId),
    enabled: Boolean(productId),
  });
}

export function useSaveProductTags(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tagIds: string[]) =>
      adminCatalogApi.saveProductTags(productId, tagIds),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: queryKeys.admin.productTags(productId),
      }),
  });
}
