// lib/queries/admin/useInventory.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminInventoryApi,
  adminWarehousesApi,
} from "@/lib/api/admin/inventory";
import { queryKeys } from "@/lib/queries/keys";
import type { InventoryFormInput, InventoryTransferInput } from "@/lib/types";

// Invalide toutes les vues d'inventaire d'un coup (liste, low-stock,
// out-of-stock, recherche) — elles pointent vers la même donnée sous-jacente
// mais avec des query keys différentes, donc pas de clé unique à cibler.
function invalidateAllInventoryViews(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({
    predicate: (q) =>
      q.queryKey[0] === "admin" && q.queryKey[1] === "inventory",
  });
}

export function useAdminInventoryList(page: number) {
  return useQuery({
    queryKey: queryKeys.admin.inventoryList(page),
    queryFn: () => adminInventoryApi.list({ page }),
    placeholderData: (prev) => prev,
  });
}

export function useAdminInventoryGrouped(params: {
  page: number;
  lowStock?: boolean;
  outOfStock?: boolean;
}) {
  return useQuery({
    queryKey: queryKeys.admin.inventoryGrouped(params),
    queryFn: () => adminInventoryApi.grouped(params),
    placeholderData: (prev) => prev,
  });
}

// productId est désormais un string (Product.id: string) — le fallback
// utilisait "0" (number) auparavant ; on bascule sur "" pour rester cohérent
// avec le typage string partout, `enabled` empêche de toute façon l'appel
// tant que productId est null.
export function useAdminInventoryGroupedDetail(
  productId: string | null,
  page: number,
) {
  return useQuery({
    queryKey: queryKeys.admin.inventoryGroupedDetail(productId ?? "", page),
    queryFn: () => adminInventoryApi.groupedDetail(productId!, page),
    enabled: productId !== null,
  });
}

export function useAdminInventorySearch(keyword: string) {
  return useQuery({
    queryKey: queryKeys.admin.inventorySearch(keyword),
    queryFn: () => adminInventoryApi.search(keyword),
    enabled: Boolean(keyword),
  });
}

export function useProductCombinationsForInventory(productId: string | null) {
  return useQuery({
    queryKey: queryKeys.admin.productCombinations(productId ?? ""),
    queryFn: () => adminInventoryApi.combinationsForProduct(productId!),
    enabled: productId !== null,
  });
}

export function useCreateInventoryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: InventoryFormInput) =>
      adminInventoryApi.create(payload),
    onSuccess: () => invalidateAllInventoryViews(qc),
  });
}

export function useUpdateInventoryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      adminInventoryApi.update(itemId, { quantity }),
    onSuccess: () => invalidateAllInventoryViews(qc),
  });
}

export function useDeleteInventoryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => adminInventoryApi.remove(itemId),
    onSuccess: () => invalidateAllInventoryViews(qc),
  });
}

export function useTransferInventory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: InventoryTransferInput) =>
      adminInventoryApi.transfer(payload),
    onSuccess: () => invalidateAllInventoryViews(qc),
  });
}

export function useAdminWarehouses() {
  return useQuery({
    queryKey: queryKeys.admin.warehouses,
    queryFn: adminWarehousesApi.list,
  });
}

export function useCreateWarehouse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminWarehousesApi.create,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.admin.warehouses }),
  });
}

export function useDeleteWarehouse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (warehouseId: string) => adminWarehousesApi.remove(warehouseId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.admin.warehouses }),
  });
}

export function useWarehouseInventory(warehouseId: string) {
  return useQuery({
    queryKey: queryKeys.admin.warehouseInventory(warehouseId),
    queryFn: () => adminWarehousesApi.inventory(warehouseId),
    enabled: Boolean(warehouseId),
  });
}
