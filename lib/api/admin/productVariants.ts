// lib/api/admin/productVariants.ts
import { apiClient } from "@/lib/api-client";
import type { ProductCombination, CombinationFormInput } from "@/lib/types";

export const adminProductVariantsApi = {
  selections: (productId: string) =>
    apiClient
      .get<
        { attributeDefinitionId: string; optionIds: string[] }[]
      >(`/product/${productId}/combinations/selections`)
      .catch(() => []),

  updateSelection: (
    productId: string,
    attributeDefinitionId: string,
    optionIds: string[],
  ) =>
    apiClient.put(
      `/product/${productId}/combinations/selections/${attributeDefinitionId}`,
      { optionIds },
    ),

  generate: (productId: string) =>
    apiClient.post<ProductCombination[]>(
      `/product/${productId}/combinations/generate`,
    ),

  list: (productId: string) =>
    apiClient
      .get<ProductCombination[]>(`/product/${productId}/combinations`)
      .catch(() => []),

  update: (
    productId: string,
    combinationId: string,
    payload: CombinationFormInput,
  ) =>
    apiClient.patch<ProductCombination>(
      `/product/${productId}/combinations/${combinationId}`,
      payload,
    ),

  remove: (productId: string, combinationId: string) =>
    apiClient.delete(`/product/${productId}/combinations/${combinationId}`),
};
