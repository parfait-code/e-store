// app/(public)/promotions/[slug]/PromotionPageClient.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Loader2,
  Ticket,
  Copy,
  Percent,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ApiError } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ProductGrid } from "@/components/ProductGrid";
import {
  usePromotionBySlug,
  usePromotionProductsBySlug,
} from "@/lib/queries/shop/usePromotions";

// --- Countdown ---

interface CountdownValue {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function computeRemaining(endDate: string): CountdownValue | null {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function useCountdown(endDate: string | undefined) {
  const [remaining, setRemaining] = useState<CountdownValue | null>(() =>
    endDate ? computeRemaining(endDate) : null,
  );

  useEffect(() => {
    if (!endDate) return;
    const timer = setInterval(() => {
      setRemaining(computeRemaining(endDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  return remaining;
}

function CountdownBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-md bg-gray-900 px-3 py-1.5 text-white">
      <span className="text-base font-semibold tabular-nums leading-none">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-0.5 text-[10px] uppercase tracking-wide text-gray-300">
        {label}
      </span>
    </div>
  );
}

// --- Carousel d'images de la promotion ---

function PromotionImagesCarousel({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [index, setIndex] = useState(0);

  if (images.length === 1) {
    return (
      <div className="relative mb-8 aspect-3/1 w-full overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={images[0]}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 768px"
          priority
        />
      </div>
    );
  }

  function goPrev() {
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  }
  function goNext() {
    setIndex((prev) => (prev + 1) % images.length);
  }

  return (
    <div className="relative mb-8 overflow-hidden rounded-lg bg-gray-100">
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((url, i) => (
          <div key={url + i} className="relative aspect-3/1 w-full shrink-0">
            <Image
              src={url}
              alt={alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      <button
        onClick={goPrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg backdrop-blur-sm transition hover:bg-white"
        aria-label="Image précédente"
      >
        <ChevronLeft className="h-5 w-5 text-gray-900" />
      </button>
      <button
        onClick={goNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg backdrop-blur-sm transition hover:bg-white"
        aria-label="Image suivante"
      >
        <ChevronRight className="h-5 w-5 text-gray-900" />
      </button>
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
        {images.map((url, i) => (
          <button
            key={url + i}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index ? "w-8 bg-white" : "w-2 bg-white/50"
            }`}
            aria-label={`Aller à l'image ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export function PromotionPageClient({ slug }: { slug: string }) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copyError, setCopyError] = useState(false);

  const {
    data: promotion,
    isLoading,
    isError,
    error,
  } = usePromotionBySlug(slug);
  const { data: productsInfo, isLoading: isLoadingProducts } =
    usePromotionProductsBySlug(slug);

  async function copyCode(code: string) {
    setCopyError(false);
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 1500);
    } catch {
      setCopyError(true);
      setTimeout(() => setCopyError(false), 2000);
    }
  }

  const countdown = useCountdown(promotion?.endDate);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (isError || !promotion) {
    const message =
      error instanceof ApiError ? error.message : "Promotion introuvable.";
    return (
      <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
        {message}
      </div>
    );
  }

  const images = Array.isArray(promotion.images) ? promotion.images : [];
  const hasImages = images.length > 0;
  const products = productsInfo?.products ?? [];
  const hasProducts = !isLoadingProducts && products.length > 0;

  const displayableCoupons = promotion.coupons.filter(
    (c) => c.isActive && c.effectiveIsActive !== false,
  );

  return (
    <div className="max-w-3xl">
      <Breadcrumb
        items={[{ label: "Promotions" }, { label: promotion.name }]}
      />

      {hasImages ? (
        // --- Cas 1 : image(s) présente(s) — pas de texte, produits affectés seulement ---
        <>
          <PromotionImagesCarousel images={images} alt={promotion.name} />
          {isLoadingProducts ? (
            <div className="flex justify-center py-10">
              <Loader2 size={20} className="animate-spin text-gray-400" />
            </div>
          ) : hasProducts ? (
            <ProductGrid products={products} />
          ) : null}
        </>
      ) : hasProducts ? (
        // --- Cas 2 : pas d'image, produits affectés — titre + countdown + produits ---
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold">{promotion.name}</h1>
            {countdown && (
              <div className="flex items-center gap-2">
                <CountdownBlock value={countdown.days} label="jours" />
                <CountdownBlock value={countdown.hours} label="heures" />
                <CountdownBlock value={countdown.minutes} label="min" />
                <CountdownBlock value={countdown.seconds} label="sec" />
              </div>
            )}
          </div>
          <ProductGrid products={products} />
        </>
      ) : isLoadingProducts ? (
        <div className="flex justify-center py-20">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : (
        // --- Cas 3 : pas d'image, pas de produit affecté — tout le texte ---
        <>
          <div>
            <h1 className="text-2xl font-semibold">{promotion.name}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Valable du {formatDate(promotion.startDate)} au{" "}
              {formatDate(promotion.endDate)}
            </p>
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
                      {d.type === "PERCENTAGE"
                        ? `${d.value}%`
                        : `${d.value} XAF`}
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
        </>
      )}
    </div>
  );
}
