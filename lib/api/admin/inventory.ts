// lib/api/admin/inventory.ts
import { apiClient } from "@/lib/api-client";
import type {
  InventoryItem,
  Warehouse,
  Paginated,
  InventoryFormInput,
  InventoryTransferInput,
  ProductCombination,
} from "@/lib/types";

export const adminInventoryApi = {
  list: (page: number, limit = 20) =>
    apiClient.get<Paginated<InventoryItem>>(
      `/inventory?page=${page}&limit=${limit}`,
    ),

  lowStock: () => apiClient.get<InventoryItem[]>("/inventory/low-stock"),

  outOfStock: () => apiClient.get<InventoryItem[]>("/inventory/out-of-stock"),

  search: (keyword: string) =>
    apiClient.get<InventoryItem[]>(
      `/inventory/search?keyword=${encodeURIComponent(keyword)}`,
    ),

  create: (payload: InventoryFormInput) =>
    apiClient.post<InventoryItem>("/inventory", payload),

  update: (
    itemId: string,
    payload: { quantity?: number; warehouse_id?: string },
  ) => apiClient.put<InventoryItem>(`/inventory/${itemId}`, payload),

  remove: (itemId: string) => apiClient.delete(`/inventory/${itemId}`),

  transfer: (payload: InventoryTransferInput) =>
    apiClient.post("/inventory/transfer", payload),

  combinationsForProduct: (productId: number) =>
    apiClient.get<ProductCombination[]>(`/product/${productId}/combinations`),
};

export const adminWarehousesApi = {
  list: () => apiClient.get<Warehouse[]>("/warehouses"),

  inventory: (warehouseId: string) =>
    apiClient.get<{
      warehouse: Warehouse & { totalUnits: number };
      items: InventoryItem[];
    }>(`/warehouses/${warehouseId}/inventory`),

  create: (payload: { name: string; location: string; capacity?: number }) =>
    apiClient.post<Warehouse>("/warehouses", payload),

  remove: (warehouseId: string) =>
    apiClient.delete(`/warehouses/${warehouseId}`),
};
