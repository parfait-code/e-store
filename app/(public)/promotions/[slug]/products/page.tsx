// app/(public)/promotions/[slug]/products/page.tsx
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ProductGrid } from "@/components/ProductGrid";
import { usePromotionProductsBySlug } from "@/lib/queries/shop/usePromotions";

export default function PromotionProductsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError } = usePromotionProductsBySlug(slug);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
        Promotion introuvable.
      </div>
    );
  }

  return (
    <div>
      <Link
        href={`/promotions/${slug}`}
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft size={14} /> Retour à la promotion
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-semibold">{data.promotionName}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {data.count} produit(s) concerné(s)
        </p>
      </div>

      <ProductGrid
        products={data.products ?? []}
        emptyMessage="Aucun produit n'est actuellement rattaché à cette promotion."
      />
    </div>
  );
}
