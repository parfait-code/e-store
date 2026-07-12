// app/(public)/promotions/[slug]/PromotionPageClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Loader2,
  Ticket,
  Copy,
  Check,
  Percent,
  DollarSign,
  ShoppingBag,
} from "lucide-react";
import { ApiError } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  usePromotionBySlug,
  usePromotionProductsBySlug,
} from "@/lib/queries/shop/usePromotions";

export function PromotionPageClient({ slug }: { slug: string }) {
  const router = useRouter();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copyError, setCopyError] = useState(false);

  const {
    data: promotion,
    isLoading,
    isError,
    error,
  } = usePromotionBySlug(slug);
  const { data: productsInfo } = usePromotionProductsBySlug(slug);

  async function copyCode(code: string) {
    setCopyError(false);
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 1500);
    } catch {
      // FIX #6 : échoue silencieusement en http non sécurisé / navigateurs
      // restrictifs — on informe l'utilisateur plutôt que de ne rien dire.
      setCopyError(true);
      setTimeout(() => setCopyError(false), 2000);
    }
  }

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
    // FIX #2 : distinguer un vrai message backend d'un fallback générique
    const message =
      error instanceof ApiError ? error.message : "Promotion introuvable.";
    return (
      <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
        {message}
      </div>
    );
  }

  const canViewProducts = Boolean(productsInfo && productsInfo.count > 0);

  // FIX #3/#4 : un coupon n'est proposable que s'il est isActive ET
  // effectivement actif (dates, plafond d'utilisation — §6.17 du guide).
  // effectiveIsActive peut être absent (undefined) sur d'anciennes réponses
  // cache ; dans ce cas on se rabat sur isActive seul.
  const displayableCoupons = promotion.coupons.filter(
    (c) => c.isActive && c.effectiveIsActive !== false,
  );

  return (
    <div className="max-w-3xl">
      <Breadcrumb
        items={[{ label: "Promotions" }, { label: promotion.name }]}
      />

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
            sizes="(max-width: 768px) 100vw, 768px"
            priority
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

      {displayableCoupons.length > 0 && (
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium">Codes promo</h2>
            {copyError && (
              <span className="text-xs text-red-600">
                Impossible de copier — sélectionnez le code manuellement.
              </span>
            )}
          </div>
          <div className="space-y-2">
            {displayableCoupons.map((c) => (
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
