// lib/api/admin/catalog.ts
import { apiClient } from "@/lib/api-client";
import type { Product, Paginated, CategoryRef, ProductStatus } from "@/lib/types";

export const adminCatalogApi = {
  listProducts: (
    params: {
      page?: number;
      limit?: number;
      categoryId?: string;
      search?: string;
      status?: ProductStatus | "";
    } = {},
  ) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.categoryId) qs.set("categoryId", params.categoryId);
    if (params.search) qs.set("search", params.search);
    if (params.status) qs.set("status", params.status);
    qs.set("includeInactive", "true");
    return apiClient.get<Paginated<Product>>(`/product?${qs.toString()}`);
  },

  productById: (id: string | number) =>
    apiClient.get<Product>(`/product/${id}`),

  createProduct: (payload: Record<string, unknown>) =>
    apiClient.post<Product>("/product", payload),

  updateProduct: (id: string | number, payload: Record<string, unknown>) =>
    apiClient.patch<Product>(`/product/${id}`, payload),

  deleteProduct: (id: string | number) => apiClient.delete(`/product/${id}`),

  listCategories: () => apiClient.get<CategoryRef[]>("/categories"),
};