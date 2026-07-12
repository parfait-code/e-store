// lib/api/admin/catalog.ts
import { apiClient } from "@/lib/api-client";
import type {
  Product,
  Paginated,
  CategoryRef,
  ProductStatus,
  Tag,
} from "@/lib/types";

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

  // Corrigé — sans includeInactive, un produit DRAFT/ARCHIVED n'était pas
  // renvoyé pour l'admin, bloquant la vue/l'édition de sa fiche.
  productById: (id: string | number) =>
    apiClient.get<Product>(`/product/${id}?includeInactive=true`),

  createProduct: (payload: Record<string, unknown>) =>
    apiClient.post<Product>("/product", payload),

  // FIX : le backend applique le même filtre de visibilité (DRAFT/ARCHIVED
  // masqués) sur la résolution du produit pour PATCH que pour GET. Sans
  // `includeInactive=true`, modifier un produit DRAFT (ex: le passer en
  // ACTIVE) renvoyait 404 "produit introuvable" alors qu'il existe bien.
  updateProduct: (id: string | number, payload: Record<string, unknown>) =>
    apiClient.patch<Product>(`/product/${id}?includeInactive=true`, payload),

  // Même cause potentielle sur DELETE — corrigé par précaution.
  deleteProduct: (id: string | number) =>
    apiClient.delete(`/product/${id}?includeInactive=true`),

  listCategories: () => apiClient.get<CategoryRef[]>("/categories"),

  // --- Images ---
  uploadImage: (productId: string | number, file: File) => {
    const fd = new FormData();
    fd.append("images", file);
    return apiClient.post<Product>(
      `/product/${productId}/images?includeInactive=true`,
      fd,
      { isFormData: true },
    );
  },
  deleteImage: (productId: string | number, imageId: string) =>
    apiClient.delete<Product>(
      `/product/${productId}/images?includeInactive=true`,
      { imageId },
    ),

  // --- Attributs non-variante (§7.4 du guide) ---
  saveAttributes: (
    productId: string | number,
    attributes: { attributeDefinitionId: string; value: string }[],
  ) =>
    apiClient.put<Product>(
      `/product/${productId}/attributes?includeInactive=true`,
      { attributes },
    ),

  // --- Tags ---
  productTags: (productId: string | number) =>
    apiClient
      .get<{ tag: Tag }[]>(`/product/${productId}/tags`)
      .catch(() => [] as { tag: Tag }[]),
  saveProductTags: (productId: string | number, tagIds: string[]) =>
    apiClient.put(`/product/${productId}/tags`, { tagIds }),
};
