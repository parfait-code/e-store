// lib/queries/admin/useInventory.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminInventoryApi,
  adminWarehousesApi,
} from "@/lib/api/admin/inventory";
import { queryKeys } from "@/lib/queries/keys";
import type { InventoryFormInput, InventoryTransferInput } from "@/lib/types";

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
  warehouseId?: string;
}) {
  return useQuery({
    queryKey: queryKeys.admin.inventoryGrouped(params),
    queryFn: () => adminInventoryApi.grouped(params),
    placeholderData: (prev) => prev,
  });
}

export function useAdminInventoryGroupedDetail(
  productId: string | null,
  page: number,
  warehouseId?: string,
) {
  return useQuery({
    queryKey: queryKeys.admin.inventoryGroupedDetail(
      productId ?? "",
      page,
      warehouseId,
    ),
    queryFn: () =>
      adminInventoryApi.groupedDetail(productId!, page, 50, warehouseId),
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

export function useUpdateWarehouse(warehouseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      name?: string;
      location?: string;
      capacity?: number;
    }) => adminWarehousesApi.update(warehouseId, payload),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.admin.warehouses }),
  });
}
