// app/(public)/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { ProductGrid } from "@/components/ProductGrid";
import { formatDate } from "@/lib/format";
import { useCategories, useProducts } from "@/lib/queries/shop/useCatalog";
import { useActivePromotions } from "@/lib/queries/shop/usePromotions";

function PromotionsSection() {
  const { data: promotions = [], isLoading } = useActivePromotions();

  if (isLoading || promotions.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">Promotions en cours</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {promotions.map((promo) => (
          <Link
            key={promo.id}
            href={`/promotions/${promo.slug}`}
            className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:shadow-md"
          >
            <div className="relative aspect-3/1 w-full overflow-hidden bg-gray-100">
              {promo.images[0] ? (
                <Image
                  src={promo.images[0]}
                  alt={promo.name}
                  fill
                  className="object-cover transition group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gray-900">
                  <span className="text-lg font-semibold text-white">
                    {promo.name}
                  </span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-900">{promo.name}</h3>
              <p className="mt-1 text-xs text-gray-400">
                Jusqu'au {formatDate(promo.endDate)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({
    page: 1,
    limit: 8,
  });
  const { data: allCategories = [] } = useCategories();

  const featuredProducts = productsData?.items ?? [];
  const categories = allCategories.filter(
    (c) => c.parentId === null && c.isActive,
  );

  return (
    <div className="space-y-12">
      {/* Bannière */}
      <section className="rounded-2xl bg-gray-900 px-8 py-16 text-center text-white">
        <h1 className="text-3xl font-semibold sm:text-4xl">
          Bienvenue sur E-Store
        </h1>
        <p className="mt-3 text-gray-300">
          Découvrez notre sélection de produits au meilleur prix.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100"
        >
          Voir le catalogue <ArrowRight size={16} />
        </Link>
      </section>

      {/* Promotions */}
      <PromotionsSection />

      {/* Catégories */}
      {categories.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">Catégories</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.slice(0, 6).map((c) => (
              <Link
                key={c.id}
                href={`/categories/${c.slug}`}
                className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-white p-4 text-center transition hover:shadow-md"
              >
                <span className="text-sm font-medium text-gray-800">
                  {c.name}
                </span>
                <span className="text-xs text-gray-400">
                  {c._count.products} produit(s)
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Produits en avant */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Produits en vedette</h2>
          <Link
            href="/products"
            className="text-sm font-medium text-gray-900 hover:underline"
          >
            Voir tout →
          </Link>
        </div>
        <ProductGrid
          products={featuredProducts}
          isLoading={isLoadingProducts}
        />
      </section>
    </div>
  );
}
