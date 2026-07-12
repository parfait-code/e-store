// app/(public)/promotions/[slug]/page.tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Loader2,
  Ticket,
  Copy,
  Percent,
  DollarSign,
  ShoppingBag,
} from "lucide-react";
import { formatDate } from "@/lib/format";
import {
  usePromotionBySlug,
  usePromotionProductsBySlug,
} from "@/lib/queries/shop/usePromotions";

export default function PromotionPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: promotion, isLoading, isError } = usePromotionBySlug(slug);
  const { data: productsInfo } = usePromotionProductsBySlug(slug);

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  }

  // count===0 (ex: coupon pur, sans ciblage produit) → pas de redirection possible
  // count===1 → direct vers la fiche produit
  // count>1 → page de listing
  function handleViewProducts() {
    if (!productsInfo || productsInfo.count === 0) return;
    if (productsInfo.count === 1) {
      router.push(`/products/${productsInfo.products[0].id}`);
    } else {
      router.push(`/promotions/${slug}/products`);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (isError || !promotion) {
    return (
      <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
        Promotion introuvable.
      </div>
    );
  }

  const canViewProducts = Boolean(productsInfo && productsInfo.count > 0);

  return (
    <div className="max-w-3xl">
      {promotion.images[0] && (
        <button
          type="button"
          onClick={canViewProducts ? handleViewProducts : undefined}
          disabled={!canViewProducts}
          className={`relative mb-6 aspect-3/1 w-full overflow-hidden rounded-lg bg-gray-100 ${
            canViewProducts ? "cursor-pointer" : "cursor-default"
          }`}
        >
          <Image
            src={promotion.images[0]}
            alt={promotion.name}
            fill
            className="object-cover"
          />
        </button>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{promotion.name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Valable du {formatDate(promotion.startDate)} au{" "}
            {formatDate(promotion.endDate)}
          </p>
        </div>
        {canViewProducts && (
          <button
            onClick={handleViewProducts}
            className="flex shrink-0 items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            <ShoppingBag size={16} />
            Voir les produits ({productsInfo!.count})
          </button>
        )}
      </div>

      {promotion.description && (
        <p className="mt-4 text-sm leading-relaxed text-gray-600">
          {promotion.description}
        </p>
      )}

      {promotion.coupons.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-medium">Codes promo</h2>
          <div className="space-y-2">
            {promotion.coupons
              .filter((c) => c.isActive)
              .map((c) => (
                <button
                  key={c.id}
                  onClick={() => copyCode(c.code)}
                  className="flex w-full items-center justify-between rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-left hover:bg-gray-100"
                >
                  <span className="flex items-center gap-2 font-mono text-sm font-semibold">
                    <Ticket size={16} className="text-gray-400" />
                    {c.code}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Copy size={12} />
                    {copiedCode === c.code ? "Copié !" : "Copier"}
                  </span>
                </button>
              ))}
          </div>
        </div>
      )}

      {promotion.discounts.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-medium">Remises applicables</h2>
          <div className="space-y-2">
            {promotion.discounts.map((d) => (
              <div
                key={d.id}
                className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-3 text-sm"
              >
                {d.type === "PERCENTAGE" ? (
                  <Percent size={14} className="text-gray-400" />
                ) : (
                  <DollarSign size={14} className="text-gray-400" />
                )}
                <span className="font-medium">
                  {d.type === "PERCENTAGE" ? `${d.value}%` : `${d.value} XAF`}
                </span>
                <span className="text-gray-500">
                  {d.category
                    ? `sur ${d.category.name}`
                    : `sur ${d.products.length} produit(s)`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
