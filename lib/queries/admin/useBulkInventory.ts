// lib/queries/admin/useBulkInventory.ts
"use client";

import { useQueryClient } from "@tanstack/react-query";
import { adminInventoryApi } from "@/lib/api/admin/inventory";

// Pas un hook "useMutation" classique : la boucle a besoin de contrôler
// chaque étape individuellement (progress bar), donc on expose juste les
// fonctions brutes + une fonction d'invalidation à appeler à la fin du lot.
export function useBulkInventoryHelpers() {
  const qc = useQueryClient();

  async function upsertOne(params: {
    existingItemId?: string;
    productId: number;
    warehouseId: string;
    combinationId: string;
    quantity: number;
  }) {
    if (params.existingItemId) {
      return adminInventoryApi.update(params.existingItemId, {
        quantity: params.quantity,
      });
    }
    return adminInventoryApi.create({
      product_id: params.productId,
      warehouse_id: params.warehouseId,
      combination_id: params.combinationId,
      quantity: params.quantity,
    });
  }

  function invalidateAfterBulk() {
    qc.invalidateQueries({
      predicate: (q) =>
        q.queryKey[0] === "admin" && q.queryKey[1] === "inventory",
    });
  }

  return { upsertOne, invalidateAfterBulk };
}
