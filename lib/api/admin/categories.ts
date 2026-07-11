// lib/api/admin/categories.ts
import { apiClient } from "@/lib/api-client";
import type {
  Category,
  CategoryFormInput,
  AttributeDefinition,
  AttributeDefinitionFormInput,
  AttributeOption,
} from "@/lib/types";

export const adminCategoriesApi = {
  list: (includeInactive = false) =>
    apiClient.get<Category[]>(
      `/categories${includeInactive ? "?includeInactive=true" : ""}`,
    ),

  byId: (categoryId: string) =>
    apiClient.get<Category>(`/categories/${categoryId}`),

  create: (payload: Omit<CategoryFormInput, "imageUrl" | "iconUrl">) =>
    apiClient.post<Category>("/categories", payload),

  update: (
    categoryId: string,
    payload: Omit<CategoryFormInput, "imageUrl" | "iconUrl">,
  ) => apiClient.put<Category>(`/categories/${categoryId}`, payload),

  remove: (categoryId: string) => apiClient.delete(`/categories/${categoryId}`),

  uploadImage: (categoryId: string, file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return apiClient.post<Category>(
      `/categories/${categoryId}/assets`,
      formData,
      {
        isFormData: true,
      },
    );
  },

  deleteImage: (categoryId: string) =>
    apiClient.delete<Category>(`/categories/${categoryId}/image`),

  uploadIcon: (categoryId: string, file: File) => {
    const formData = new FormData();
    formData.append("icon", file);
    return apiClient.post<Category>(
      `/categories/${categoryId}/assets`,
      formData,
      {
        isFormData: true,
      },
    );
  },

  deleteIcon: (categoryId: string) =>
    apiClient.delete<Category>(`/categories/${categoryId}/icon`),

  // --- Attributs de catégorie ---
  listAttributes: (categoryId: string) =>
    apiClient.get<AttributeDefinition[]>(
      `/categories/${categoryId}/attributes`,
    ),

  createAttribute: (
    categoryId: string,
    payload: AttributeDefinitionFormInput,
  ) =>
    apiClient.post<AttributeDefinition>(
      `/categories/${categoryId}/attributes`,
      payload,
    ),

  updateAttribute: (
    definitionId: string,
    payload: Partial<AttributeDefinitionFormInput>,
  ) =>
    apiClient.patch<AttributeDefinition>(
      `/attributes/${definitionId}`,
      payload,
    ),

  deleteAttribute: (definitionId: string) =>
    apiClient.delete(`/attributes/${definitionId}`),

  createAttributeOption: (
    definitionId: string,
    payload: { value: string; colorHex?: string; position?: number },
  ) =>
    apiClient.post<AttributeOption>(
      `/attributes/${definitionId}/options`,
      payload,
    ),

  updateAttributeOption: (
    optionId: string,
    payload: { value?: string; colorHex?: string; position?: number },
  ) =>
    apiClient.patch<AttributeOption>(
      `/attributes/options/${optionId}`,
      payload,
    ),

  deleteAttributeOption: (optionId: string) =>
    apiClient.delete(`/attributes/options/${optionId}`),
};
