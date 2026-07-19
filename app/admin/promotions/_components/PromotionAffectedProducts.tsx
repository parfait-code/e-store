// app/admin/promotions/_components/PromotionAffectedProducts.tsx
"use client";

import { Loader2, Package2 } from "lucide-react";
import { formatXAF } from "@/lib/format";
import { useAdminPromotionAffectedProducts } from "@/lib/queries/admin/usePromotions";

export function PromotionAffectedProducts({
  promotionId,
}: {
  promotionId: string;
}) {
  const { data, isLoading, isError } =
    useAdminPromotionAffectedProducts(promotionId);

  return (
    <div className="max-w-2xl">
      <h2 className="mb-1 flex items-center gap-2 text-sm font-medium">
        <Package2 size={16} /> Produits affectés
      </h2>
      <p className="mb-3 text-xs text-gray-400">
        Produits concernés par au moins une remise de cette promotion (§16 du
        guide admin) — vue en lecture seule.
      </p>

      {isLoading ? (
        <Loader2 size={16} className="animate-spin text-gray-400" />
      ) : isError ? (
        <p className="text-sm text-red-600">Erreur de chargement</p>
      ) : !data || data.count === 0 ? (
        <p className="text-sm text-gray-400">
          Aucun produit affecté — promotion "coupon pur" sans remise ciblée, ou
          remises non encore créées.
        </p>
      ) : (
        <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
          {data.products.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between px-4 py-2.5 text-sm"
            >
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-gray-400">SKU {p.sku}</p>
              </div>
              <div className="text-right">
                {p.pricing?.hasDiscount ? (
                  <>
                    <span className="font-medium text-green-600">
                      {formatXAF(p.pricing.finalPrice)}
                    </span>
                    <span className="ml-1 text-xs text-gray-400 line-through">
                      {formatXAF(p.pricing.originalPrice)}
                    </span>
                  </>
                ) : (
                  formatXAF(p.price)
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
