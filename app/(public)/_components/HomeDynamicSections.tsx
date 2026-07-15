// app/(public)/_components/HomeDynamicSections.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight } from "lucide-react";
import { ProductGrid } from "@/components/ProductGrid";
import {
  useCategories,
  useProducts,
  useNewestProducts,
} from "@/lib/queries/shop/useCatalog";
import {
  useActivePromotions,
  usePromotionProductsBySlug,
} from "@/lib/queries/shop/usePromotions";
import { PromotionsCarousel } from "./PromotionsCarousel";

const AVATAR_COLORS = [
  "bg-rose-50 text-rose-600",
  "bg-blue-50 text-blue-600",
  "bg-amber-50 text-amber-600",
  "bg-emerald-50 text-emerald-600",
  "bg-purple-50 text-purple-600",
  "bg-cyan-50 text-cyan-600",
];

function colorForName(name: string) {
  const sum = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function SectionError({ message }: { message: string }) {
  return <p className="text-sm text-red-600">{message}</p>;
}

function SkeletonGrid({
  count,
  className,
}: {
  count: number;
  className: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-32 animate-pulse rounded-lg border border-gray-200 bg-gray-100"
        />
      ))}
    </div>
  );
}

export function PromotionsSection() {
  const { data: heroData, isLoading: isLoadingHero } = useActivePromotions({
    slot: "hero",
    limit: 5,
  });
  const { data, isLoading, isError } = useActivePromotions();

  const heroIds = new Set((heroData?.items ?? []).map((p) => p.id));
  const safePromotions = (data?.items ?? []).filter((p) => !heroIds.has(p.id));
  const isLoadingAny = isLoading || isLoadingHero;

  if (isError) {
    return (
      <section>
        <h2 className="mb-4 text-xl font-semibold">Promotions en cours</h2>
        <SectionError message="Impossible de charger les promotions pour le moment." />
      </section>
    );
  }

  if (isLoadingAny || safePromotions.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Promotions en cours</h2>
        {safePromotions.length > 2 && (
          <Link
            href="/promotions"
            className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:underline"
          >
            Voir tout <ArrowRight size={14} />
          </Link>
        )}
      </div>
      <PromotionsCarousel promotions={safePromotions} />
    </section>
  );
}

export function CategoriesSection() {
  const { data: allCategories = [], isLoading, isError } = useCategories();
  const categories = (Array.isArray(allCategories) ? allCategories : []).filter(
    (c) => c.parentId === null && c.isActive,
  );

  if (isError) {
    return (
      <section>
        <h2 className="mb-4 text-xl font-semibold">Catégories</h2>
        <SectionError message="Impossible de charger les catégories pour le moment." />
      </section>
    );
  }

  if (isLoading) {
    return (
      <section>
        <h2 className="mb-4 text-xl font-semibold">Catégories</h2>
        <SkeletonGrid
          count={6}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
        />
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Catégories</h2>
        <Link
          href="/categories"
          className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:underline"
        >
          Tout voir <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {categories.slice(0, 6).map((c) => (
          <Link
            key={c.id}
            href={`/categories/${c.slug}`}
            className="group flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-center transition hover:-translate-y-0.5 hover:shadow-md"
          >
            {c.imageUrl ? (
              <div className="relative h-10 w-10 overflow-hidden rounded-full">
                <Image
                  src={c.imageUrl}
                  alt={c.name}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
            ) : (
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${colorForName(c.name)}`}
              >
                {c.name.charAt(0).toUpperCase()}
              </span>
            )}
            <div>
              <span className="block text-sm font-medium text-gray-800">
                {c.name}
              </span>
              <span className="text-xs text-gray-400">
                {c._count.products} produit(s)
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// --- Countdown pour la section "produits d'une promotion" ---

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

export function PromotionProductsSection() {
  const { data } = useActivePromotions({ limit: 1 });
  const promotion = data?.items?.[0];

  const { data: productsInfo, isLoading } = usePromotionProductsBySlug(
    promotion?.slug ?? "",
  );
  const countdown = useCountdown(promotion?.endDate);

  if (!promotion) return null;

  const products = productsInfo?.products ?? [];
  if (!isLoading && products.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">{promotion.name}</h2>
          <Link
            href={`/promotions/${promotion.slug}`}
            className="mt-1 flex items-center gap-1 text-sm font-medium text-gray-900 hover:underline"
          >
            Voir la promotion <ArrowRight size={14} />
          </Link>
        </div>
        {countdown && (
          <div className="flex items-center gap-2">
            <CountdownBlock value={countdown.days} label="jours" />
            <CountdownBlock value={countdown.hours} label="heures" />
            <CountdownBlock value={countdown.minutes} label="min" />
            <CountdownBlock value={countdown.seconds} label="sec" />
          </div>
        )}
      </div>
      <ProductGrid products={products} isLoading={isLoading} />
    </section>
  );
}

export function CatalogPreviewSection() {
  const { data, isLoading, isError } = useProducts({ page: 1, limit: 8 });
  const products = Array.isArray(data?.items) ? data!.items : [];

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Aperçu du catalogue</h2>
        <Link
          href="/products"
          className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:underline"
        >
          Voir tout <ArrowRight size={14} />
        </Link>
      </div>
      {isError ? (
        <SectionError message="Impossible de charger les produits pour le moment." />
      ) : (
        <ProductGrid
          products={products}
          isLoading={isLoading}
          emptyMessage="Aucun produit à afficher pour le moment."
        />
      )}
    </section>
  );
}

export function NewArrivalsSection() {
  const { data, isLoading, isError } = useNewestProducts(8);
  const products = Array.isArray(data?.items) ? data!.items : [];

  if (isError) return null;
  if (!isLoading && products.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-amber-500" />
          <h2 className="text-xl font-semibold">Nouveautés</h2>
        </div>
        <Link
          href="/products"
          className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:underline"
        >
          Voir tout <ArrowRight size={14} />
        </Link>
      </div>
      <ProductGrid products={products} isLoading={isLoading} />
    </section>
  );
}
