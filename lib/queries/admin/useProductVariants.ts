// lib/queries/admin/useProductVariants.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminProductVariantsApi } from "@/lib/api/admin/productVariants";
import { queryKeys } from "@/lib/queries/keys";
import type { CombinationFormInput, ProductCombination } from "@/lib/types";

export function useProductVariantSelections(productId: string) {
  return useQuery({
    queryKey: queryKeys.admin.productVariantSelections(productId),
    queryFn: () => adminProductVariantsApi.selections(productId),
    enabled: Boolean(productId),
  });
}

export function useUpdateVariantSelection(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      attributeDefinitionId,
      optionIds,
    }: {
      attributeDefinitionId: string;
      optionIds: string[];
    }) =>
      adminProductVariantsApi.updateSelection(
        productId,
        attributeDefinitionId,
        optionIds,
      ),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: queryKeys.admin.productVariantSelections(productId),
      }),
  });
}

export function useProductCombinationsList(productId: string) {
  return useQuery({
    queryKey: queryKeys.admin.productCombinations(productId),
    queryFn: () => adminProductVariantsApi.list(productId),
    enabled: Boolean(productId),
  });
}

export function useGenerateCombinations(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminProductVariantsApi.generate(productId),
    onSuccess: (combos: ProductCombination[]) => {
      qc.setQueryData(queryKeys.admin.productCombinations(productId), combos);
    },
  });
}

export function useUpdateCombination(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      combinationId,
      payload,
    }: {
      combinationId: string;
      payload: CombinationFormInput;
    }) => adminProductVariantsApi.update(productId, combinationId, payload),
    onSuccess: (updated: ProductCombination) => {
      qc.setQueryData(
        queryKeys.admin.productCombinations(productId),
        (prev: ProductCombination[] | undefined) =>
          prev?.map((c) => (c.id === updated.id ? updated : c)),
      );
    },
  });
}

export function useDeleteCombination(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (combinationId: string) =>
      adminProductVariantsApi.remove(productId, combinationId),
    onSuccess: (_data, combinationId) => {
      qc.setQueryData(
        queryKeys.admin.productCombinations(productId),
        (prev: ProductCombination[] | undefined) =>
          prev?.filter((c) => c.id !== combinationId),
      );
    },
  });
}
