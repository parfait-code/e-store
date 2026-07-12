// app/(public)/promotions/[slug]/products/PromotionProductsPageClient.tsx
"use client";

import Image from "next/image";
import { Loader2 } from "lucide-react";
import { ApiError } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import { ProductGrid } from "@/components/ProductGrid";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  usePromotionBySlug,
  usePromotionProductsBySlug,
} from "@/lib/queries/shop/usePromotions";

export function PromotionProductsPageClient({ slug }: { slug: string }) {
  // NOUVEAU : on récupère la promo complète pour sa bannière — jusqu'ici
  // cette page n'affichait que le nom et le compte, aucune image.
  const { data: promotion } = usePromotionBySlug(slug);
  const { data, isLoading, isError, error } = usePromotionProductsBySlug(slug);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (isError || !data) {
    const message =
      error instanceof ApiError ? error.message : "Promotion introuvable.";
    return (
      <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
        {message}
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Promotions" },
          { label: data.promotionName, href: `/promotions/${slug}` },
          { label: "Produits" },
        ]}
      />

      {promotion?.images[0] && (
        <div className="relative mb-6 aspect-[4/1] w-full overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={promotion.images[0]}
            alt={data.promotionName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1200px"
          />
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-xl font-semibold">{data.promotionName}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {data.count} produit(s) concerné(s)
          {promotion && ` · Jusqu'au ${formatDate(promotion.endDate)}`}
        </p>
      </div>

      <ProductGrid
        products={data.products ?? []}
        emptyMessage="Aucun produit n'est actuellement rattaché à cette promotion."
      />
    </div>
  );
}
