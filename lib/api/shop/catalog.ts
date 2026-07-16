// lib/api/shop/catalog.ts
import { apiClient } from "@/lib/api-client";
import type {
  Category,
  Product,
  ProductImage,
  Paginated,
  ProductCombination,
  CategoryProductsResponse,
  CategoryRef,
} from "@/lib/types";

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

function normalizeImages(images: unknown): ProductImage[] {
  if (!Array.isArray(images)) return [];
  return images.map((img, i) => {
    if (typeof img === "string") {
      return {
        id: `img-${i}`,
        url: img,
        altText: null,
        position: i,
        isPrimary: i === 0,
      };
    }
    const raw = (img ?? {}) as Partial<ProductImage>;
    return {
      id: raw.id ?? `img-${i}`,
      url: raw.url ?? "",
      altText: raw.altText ?? null,
      position: raw.position ?? i,
      isPrimary: raw.isPrimary ?? i === 0,
    };
  });
}

function normalizeProductImages(product: Product): Product {
  return { ...product, images: normalizeImages(product.images) };
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
        items: (Array.isArray(res?.items) ? res.items : []).map(
          normalizeProductImages,
        ),
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
      .then(normalizePaginated)
      .then((res) => ({
        ...res,
        items: res.items.map(normalizeProductImages),
      }));
  },

  newestProducts: (limit = 8, fetchPoolSize = 24) =>
    apiClient
      .get<Paginated<Product>>(`/product?page=1&limit=${fetchPoolSize}`)
      .then(normalizePaginated)
      .then((res) => ({
        ...res,
        items: [...res.items]
          .map(normalizeProductImages)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          .slice(0, limit),
      })),

  productById: (id: string) =>
    apiClient.get<Product>(`/product/${id}`).then(normalizeProductImages),

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
