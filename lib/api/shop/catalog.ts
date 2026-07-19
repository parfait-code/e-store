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
  ProductSortOption,
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

function extractUrl(raw: Record<string, unknown>): string {
  return (
    (raw.url as string) ??
    (raw.imageUrl as string) ??
    (raw.image_url as string) ??
    ""
  );
}

function normalizeImages(
  images: unknown,
  fallbackUrl?: string | null,
): ProductImage[] {
  if (Array.isArray(images) && images.length > 0) {
    const normalized = images.map((img, i) => {
      if (typeof img === "string") {
        return {
          id: `img-${i}`,
          url: img,
          altText: null,
          position: i,
          isPrimary: i === 0,
        };
      }
      const raw = (img ?? {}) as Record<string, unknown>;
      return {
        id: (raw.id as string) ?? `img-${i}`,
        url: extractUrl(raw),
        altText: (raw.altText as string) ?? null,
        position: (raw.position as number) ?? i,
        isPrimary: (raw.isPrimary as boolean) ?? i === 0,
      };
    });
    const withUrl = normalized.filter((img) => img.url);
    if (withUrl.length > 0) return withUrl;
  }
  if (fallbackUrl) {
    return [
      {
        id: "img-0",
        url: fallbackUrl,
        altText: null,
        position: 0,
        isPrimary: true,
      },
    ];
  }
  return [];
}

function normalizeProductImages(
  product: Product & {
    image?: string;
    imageUrl?: string;
    mainImage?: string;
    thumbnail?: string;
  },
): Product {
  const fallback =
    product.image ??
    product.imageUrl ??
    product.mainImage ??
    product.thumbnail ??
    null;
  return { ...product, images: normalizeImages(product.images, fallback) };
}

export const shopCatalogApi = {
  listCategories: () =>
    apiClient
      .get<Category[]>("/categories")
      .then((res) => (Array.isArray(res) ? res : [])),

  categoryBySlug: (slug: string) =>
    apiClient.get<Category>(`/categories/slug/${slug}`),

  productsByCategorySlug: (
    slug: string,
    page = 1,
    limit = 24,
    filters: {
      search?: string;
      minPrice?: number;
      maxPrice?: number;
      tags?: string[];
      sort?: ProductSortOption;
    } = {},
  ) => {
    const qs = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (filters.search) qs.set("search", filters.search);
    if (filters.minPrice !== undefined)
      qs.set("minPrice", String(filters.minPrice));
    if (filters.maxPrice !== undefined)
      qs.set("maxPrice", String(filters.maxPrice));
    if (filters.tags && filters.tags.length > 0)
      qs.set("tags", filters.tags.join(","));
    if (filters.sort) qs.set("sort", filters.sort);
    return apiClient
      .get<CategoryProductsResponse>(
        `/categories/slug/${slug}/products?${qs.toString()}`,
      )
      .then((res) => ({
        ...res,
        items: (Array.isArray(res?.items) ? res.items : []).map(
          normalizeProductImages,
        ),
      }));
  },

  listProducts: (
    params: {
      page?: number;
      limit?: number;
      categoryId?: string;
      search?: string;
      minPrice?: number;
      maxPrice?: number;
      tags?: string[];
      sort?: ProductSortOption;
    } = {},
  ) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.categoryId) qs.set("categoryId", params.categoryId);
    if (params.search) qs.set("search", params.search);
    if (params.minPrice !== undefined)
      qs.set("minPrice", String(params.minPrice));
    if (params.maxPrice !== undefined)
      qs.set("maxPrice", String(params.maxPrice));
    if (params.tags && params.tags.length > 0)
      qs.set("tags", params.tags.join(","));
    if (params.sort) qs.set("sort", params.sort);
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
