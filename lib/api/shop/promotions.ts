// lib/api/shop/promotions.ts
import { apiClient } from "@/lib/api-client";
import type {
  PromotionPublic,
  PromotionProductsResponse,
  Product,
  ProductImage,
  Paginated,
} from "@/lib/types";

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

function normalizeProduct(product: Product): Product {
  return { ...product, images: normalizeImages(product.images) };
}

export const shopPromotionsApi = {
  active: (params: { page?: number; limit?: number; slot?: "hero" } = {}) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.slot) qs.set("slot", params.slot);
    return apiClient
      .get<Paginated<PromotionPublic>>(`/promotions/active?${qs.toString()}`)
      .then((res) => ({
        items: Array.isArray(res?.items) ? res.items : [],
        total: res?.total ?? 0,
        page: res?.page ?? 1,
        limit: res?.limit ?? 20,
        totalPages: res?.totalPages ?? 1,
      }));
  },

  bySlug: (slug: string) =>
    apiClient.get<PromotionPublic>(`/promotions/slug/${slug}`),

  productsBySlug: (slug: string) =>
    apiClient
      .get<
        | PromotionProductsResponse
        | (Omit<PromotionProductsResponse, "products"> & {
            items?: Product[];
          })
        | Product[]
      >(`/promotions/slug/${slug}/products`)
      .then((res) => {
        const rawProducts: Product[] = Array.isArray(res)
          ? res
          : Array.isArray((res as PromotionProductsResponse)?.products)
            ? (res as PromotionProductsResponse).products
            : Array.isArray((res as { items?: Product[] })?.items)
              ? (res as { items?: Product[] }).items!
              : [];

        const products = rawProducts.map(normalizeProduct);

        return {
          promotionId: Array.isArray(res)
            ? ""
            : ((res as PromotionProductsResponse)?.promotionId ?? ""),
          promotionName: Array.isArray(res)
            ? ""
            : ((res as PromotionProductsResponse)?.promotionName ?? ""),
          count: Array.isArray(res)
            ? products.length
            : ((res as PromotionProductsResponse)?.count ?? products.length),
          products,
        };
      }),
};
