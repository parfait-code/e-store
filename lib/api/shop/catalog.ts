// lib/api/shop/catalog.ts
import { apiClient } from "@/lib/api-client";
import type {
  Category,
  Product,
  Paginated,
  ProductCombination,
  CategoryProductsResponse,
  CategoryRef,
} from "@/lib/types";

export const shopCatalogApi = {
  listCategories: () => apiClient.get<Category[]>("/categories"),

  categoryBySlug: (slug: string) =>
    apiClient.get<Category>(`/categories/slug/${slug}`),

  productsByCategorySlug: (slug: string, page = 1, limit = 24) =>
    apiClient.get<CategoryProductsResponse>(
      `/categories/slug/${slug}/products?page=${page}&limit=${limit}`,
    ),

  listProducts: (
    params: {
      page?: number;
      limit?: number;
      categoryId?: string;
      search?: string;
    } = {},
  ) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.categoryId) qs.set("categoryId", params.categoryId);
    if (params.search) qs.set("search", params.search);
    return apiClient.get<Paginated<Product>>(`/product?${qs.toString()}`);
  },

  productById: (id: string | number) =>
    apiClient.get<Product>(`/product/${id}`),

  combinations: (productId: string | number) =>
    apiClient
      .get<ProductCombination[]>(`/product/${productId}/combinations`)
      .catch(() => [] as ProductCombination[]),

  categoriesRef: () => apiClient.get<CategoryRef[]>("/categories"),
};
