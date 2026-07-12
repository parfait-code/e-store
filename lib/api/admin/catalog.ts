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

  // Confirmé nécessaire : GET /product/:id est Public et applique le même
  // filtre de visibilité que le listing (masque DRAFT/ARCHIVED) sauf avec
  // ce flag — c'est ce qui permet à la page d'édition de charger le produit.
  productById: (id: string | number) =>
    apiClient.get<Product>(`/product/${id}?includeInactive=true`),

  createProduct: (payload: Record<string, unknown>) =>
    apiClient.post<Product>("/product", payload),

  // Revert : PATCH est une route Admin (voir §6.2 du guide), donc en
  // principe non soumise au filtre de visibilité catalogue qui ne concerne
  // que les routes Public. Ajouter includeInactive ici n'a probablement
  // aucun effet — le vrai 404 vient d'ailleurs (voir diagnostic ci-dessous).
  updateProduct: (id: string | number, payload: Record<string, unknown>) =>
    apiClient.patch<Product>(`/product/${id}`, payload),

  deleteProduct: (id: string | number) => apiClient.delete(`/product/${id}`),

  listCategories: () => apiClient.get<CategoryRef[]>("/categories"),

  // --- Images ---
  uploadImage: (productId: string | number, file: File) => {
    const fd = new FormData();
    fd.append("images", file);
    return apiClient.post<Product>(`/product/${productId}/images`, fd, {
      isFormData: true,
    });
  },
  deleteImage: (productId: string | number, imageId: string) =>
    apiClient.delete<Product>(`/product/${productId}/images`, { imageId }),

  // --- Attributs non-variante (§7.4 du guide) ---
  saveAttributes: (
    productId: string | number,
    attributes: { attributeDefinitionId: string; value: string }[],
  ) =>
    apiClient.put<Product>(`/product/${productId}/attributes`, {
      attributes,
    }),

  // --- Tags ---
  productTags: (productId: string | number) =>
    apiClient
      .get<{ tag: Tag }[]>(`/product/${productId}/tags`)
      .catch(() => [] as { tag: Tag }[]),
  saveProductTags: (productId: string | number, tagIds: string[]) =>
    apiClient.put(`/product/${productId}/tags`, { tagIds }),
};
