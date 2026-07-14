// app/(public)/_components/HomeDynamicSections.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { ProductGrid } from "@/components/ProductGrid";
import {
  useCategories,
  useProducts,
  useNewestProducts,
} from "@/lib/queries/shop/useCatalog";
import { useActivePromotions } from "@/lib/queries/shop/usePromotions";
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
  const { data, isLoading, isError } = useActivePromotions();
  const safePromotions = data?.items ?? [];

  if (isError) {
    return (
      <section>
        <h2 className="mb-4 text-xl font-semibold">Promotions en cours</h2>
        <SectionError message="Impossible de charger les promotions pour le moment." />
      </section>
    );
  }

  if (isLoading || safePromotions.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Promotions en cours</h2>
        {safePromotions.length > 2 && (
          <Link
            href="/promotions"
            className="text-sm font-medium text-gray-900 hover:underline"
          >
            Voir tout →
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
          className="text-sm font-medium text-gray-900 hover:underline"
        >
          Tout voir →
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

// Anciennement "Produits en vedette" — renommé car ce n'est pas une
// sélection curatée (pas de critère de mise en avant côté backend), juste
// la première page du catalogue. Le libellé précédent laissait croire à
// une curation qui n'existe pas.
export function CatalogPreviewSection() {
  const { data, isLoading, isError } = useProducts({ page: 1, limit: 8 });
  const products = Array.isArray(data?.items) ? data!.items : [];

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Aperçu du catalogue</h2>
        <Link
          href="/products"
          className="text-sm font-medium text-gray-900 hover:underline"
        >
          Voir tout →
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

  if (isError) return null; // section discrète, pas de bandeau d'erreur agressif
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
          className="text-sm font-medium text-gray-900 hover:underline"
        >
          Voir tout →
        </Link>
      </div>
      <ProductGrid products={products} isLoading={isLoading} />
    </section>
  );
}
