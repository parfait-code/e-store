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

// Défense à la source : `?? []` ne protège que contre null/undefined, pas
// contre une forme inattendue mais non-nulle (ex: un objet d'erreur renvoyé
// à la place d'un tableau) — cause du crash précédent sur la home.
function normalizePaginated<T>(
  res: Paginated<T> | null | undefined,
): Paginated<T> {
  return {
    items: Array.isArray(res?.items) ? res!.items : [],
    total: res?.total ?? 0,
    page: res?.page ?? 1,
    limit: res?.limit ?? 20,
    totalPages: res?.totalPages ?? 1,
  };
}

export const shopCatalogApi = {
  listCategories: () =>
    apiClient
      .get<Category[]>("/categories")
      .then((res) => (Array.isArray(res) ? res : [])),

  categoryBySlug: (slug: string) =>
    apiClient.get<Category>(`/categories/slug/${slug}`),

  productsByCategorySlug: (slug: string, page = 1, limit = 24) =>
    apiClient
      .get<CategoryProductsResponse>(
        `/categories/slug/${slug}/products?page=${page}&limit=${limit}`,
      )
      .then((res) => ({
        ...res,
        items: Array.isArray(res?.items) ? res.items : [],
      })),

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
    return apiClient
      .get<Paginated<Product>>(`/product?${qs.toString()}`)
      .then(normalizePaginated);
  },

  productById: (id: string) => apiClient.get<Product>(`/product/${id}`),

  combinations: (productId: string) =>
    apiClient
      .get<ProductCombination[]>(`/product/${productId}/combinations`)
      .then((res) => (Array.isArray(res) ? res : []))
      .catch(() => [] as ProductCombination[]),

  categoriesRef: () =>
    apiClient
      .get<CategoryRef[]>("/categories")
      .then((res) => (Array.isArray(res) ? res : [])),
};
