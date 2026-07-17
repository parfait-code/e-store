// lib/api/admin/inventory.ts
import { apiClient } from "@/lib/api-client";
import type {
  InventoryItem,
  Warehouse,
  Paginated,
  InventoryFormInput,
  InventoryTransferInput,
  ProductCombination,
  InventoryGroupedProduct,
} from "@/lib/types";

export const adminInventoryApi = {
  list: (
    params: {
      page?: number;
      limit?: number;
      category?: string;
      location?: string;
      warehouseId?: string;
    } = {},
  ) => {
    const qs = new URLSearchParams();
    qs.set("page", String(params.page ?? 1));
    qs.set("limit", String(params.limit ?? 20));
    if (params.category) qs.set("category", params.category);
    if (params.location) qs.set("location", params.location);
    if (params.warehouseId) qs.set("warehouse_id", params.warehouseId);
    return apiClient.get<Paginated<InventoryItem>>(
      `/inventory?${qs.toString()}`,
    );
  },

  grouped: (
    params: {
      page?: number;
      limit?: number;
      lowStock?: boolean;
      outOfStock?: boolean;
      warehouseId?: string;
    } = {},
  ) => {
    const qs = new URLSearchParams();
    qs.set("page", String(params.page ?? 1));
    qs.set("limit", String(params.limit ?? 20));
    if (params.lowStock) qs.set("low_stock", "true");
    if (params.outOfStock) qs.set("out_of_stock", "true");
    if (params.warehouseId) qs.set("warehouse_id", params.warehouseId);
    return apiClient.get<Paginated<InventoryGroupedProduct>>(
      `/inventory/grouped?${qs.toString()}`,
    );
  },

  groupedDetail: (
    productId: string,
    page = 1,
    limit = 50,
    warehouseId?: string,
  ) => {
    const qs = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (warehouseId) qs.set("warehouse_id", warehouseId);
    return apiClient.get<Paginated<InventoryItem>>(
      `/inventory/grouped/${productId}?${qs.toString()}`,
    );
  },

  byId: (itemId: string) =>
    apiClient.get<InventoryItem>(`/inventory/${itemId}`),

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

  combinationsForProduct: (productId: string) =>
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
