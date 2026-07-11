// lib/queries/admin/useCategories.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminCategoriesApi } from "@/lib/api/admin/categories";
import { queryKeys } from "@/lib/queries/keys";
import type {
  Category,
  CategoryFormInput,
  AttributeDefinition,
  AttributeDefinitionFormInput,
  AttributeOption,
} from "@/lib/types";

export function useAdminCategoriesList(includeInactive = false) {
  return useQuery({
    queryKey: [...queryKeys.admin.categories, { includeInactive }],
    queryFn: () => adminCategoriesApi.list(includeInactive),
  });
}

export function useAdminCategory(categoryId: string) {
  return useQuery({
    queryKey: queryKeys.admin.category(categoryId),
    queryFn: () => adminCategoriesApi.byId(categoryId),
    enabled: Boolean(categoryId),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<CategoryFormInput, "imageUrl" | "iconUrl">) =>
      adminCategoriesApi.create(payload),
    onSuccess: () =>
      qc.invalidateQueries({
        predicate: (q) =>
          q.queryKey[0] === "admin" && q.queryKey[1] === "categories",
      }),
  });
}

export function useUpdateCategory(categoryId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<CategoryFormInput, "imageUrl" | "iconUrl">) =>
      adminCategoriesApi.update(categoryId, payload),
    onSuccess: (updated: Category) => {
      qc.setQueryData(queryKeys.admin.category(categoryId), updated);
      qc.invalidateQueries({
        predicate: (q) =>
          q.queryKey[0] === "admin" && q.queryKey[1] === "categories",
      });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: string) => adminCategoriesApi.remove(categoryId),
    onSuccess: () =>
      qc.invalidateQueries({
        predicate: (q) =>
          q.queryKey[0] === "admin" && q.queryKey[1] === "categories",
      }),
  });
}

// --- Assets (image/icône) ---

export function useUploadCategoryImage(categoryId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) =>
      adminCategoriesApi.uploadImage(categoryId, file),
    onSuccess: (updated: Category) => {
      qc.setQueryData(queryKeys.admin.category(categoryId), updated);
    },
  });
}

export function useDeleteCategoryImage(categoryId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminCategoriesApi.deleteImage(categoryId),
    onSuccess: (updated: Category) => {
      qc.setQueryData(queryKeys.admin.category(categoryId), updated);
    },
  });
}

export function useUploadCategoryIcon(categoryId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => adminCategoriesApi.uploadIcon(categoryId, file),
    onSuccess: (updated: Category) => {
      qc.setQueryData(queryKeys.admin.category(categoryId), updated);
    },
  });
}

export function useDeleteCategoryIcon(categoryId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminCategoriesApi.deleteIcon(categoryId),
    onSuccess: (updated: Category) => {
      qc.setQueryData(queryKeys.admin.category(categoryId), updated);
    },
  });
}

// --- Attributs ---

export function useAdminCategoryAttributes(categoryId: string) {
  return useQuery({
    queryKey: queryKeys.admin.categoryAttributes(categoryId),
    queryFn: () => adminCategoriesApi.listAttributes(categoryId),
    enabled: Boolean(categoryId),
  });
}

export function useCreateAttribute(categoryId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AttributeDefinitionFormInput) =>
      adminCategoriesApi.createAttribute(categoryId, payload),
    onSuccess: (created: AttributeDefinition) => {
      qc.setQueryData(
        queryKeys.admin.categoryAttributes(categoryId),
        (prev: AttributeDefinition[] | undefined) => [...(prev ?? []), created],
      );
    },
  });
}

export function useUpdateAttribute(categoryId: string, definitionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<AttributeDefinitionFormInput>) =>
      adminCategoriesApi.updateAttribute(definitionId, payload),
    onSuccess: (updated: AttributeDefinition) => {
      // PATCH ne renvoie pas forcément `options` à jour — on les préserve
      // depuis le cache existant plutôt que de les écraser.
      qc.setQueryData(
        queryKeys.admin.categoryAttributes(categoryId),
        (prev: AttributeDefinition[] | undefined) =>
          prev?.map((a) =>
            a.id === updated.id ? { ...updated, options: a.options } : a,
          ),
      );
    },
  });
}

export function useDeleteAttribute(categoryId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (definitionId: string) =>
      adminCategoriesApi.deleteAttribute(definitionId),
    onSuccess: (_data, definitionId) => {
      qc.setQueryData(
        queryKeys.admin.categoryAttributes(categoryId),
        (prev: AttributeDefinition[] | undefined) =>
          prev?.filter((a) => a.id !== definitionId),
      );
    },
  });
}

export function useCreateAttributeOption(
  categoryId: string,
  definitionId: string,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      value: string;
      colorHex?: string;
      position?: number;
    }) => adminCategoriesApi.createAttributeOption(definitionId, payload),
    onSuccess: (created: AttributeOption) => {
      qc.setQueryData(
        queryKeys.admin.categoryAttributes(categoryId),
        (prev: AttributeDefinition[] | undefined) =>
          prev?.map((a) =>
            a.id === definitionId
              ? { ...a, options: [...a.options, created] }
              : a,
          ),
      );
    },
  });
}

export function useUpdateAttributeOption(
  categoryId: string,
  definitionId: string,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      optionId,
      payload,
    }: {
      optionId: string;
      payload: { value?: string; colorHex?: string; position?: number };
    }) => adminCategoriesApi.updateAttributeOption(optionId, payload),
    onSuccess: (updated: AttributeOption) => {
      qc.setQueryData(
        queryKeys.admin.categoryAttributes(categoryId),
        (prev: AttributeDefinition[] | undefined) =>
          prev?.map((a) =>
            a.id === definitionId
              ? {
                  ...a,
                  options: a.options.map((o) =>
                    o.id === updated.id ? updated : o,
                  ),
                }
              : a,
          ),
      );
    },
  });
}

export function useDeleteAttributeOption(
  categoryId: string,
  definitionId: string,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (optionId: string) =>
      adminCategoriesApi.deleteAttributeOption(optionId),
    onSuccess: (_data, optionId) => {
      qc.setQueryData(
        queryKeys.admin.categoryAttributes(categoryId),
        (prev: AttributeDefinition[] | undefined) =>
          prev?.map((a) =>
            a.id === definitionId
              ? { ...a, options: a.options.filter((o) => o.id !== optionId) }
              : a,
          ),
      );
    },
  });
}
