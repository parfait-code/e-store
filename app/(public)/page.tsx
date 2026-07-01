// app/(public)/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { ProductGrid } from "@/components/ProductGrid";
import type { Product, Category, Paginated } from "@/lib/types";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    apiClient
      .get<Paginated<Product>>("/product?limit=8")
      .then((res) => setFeaturedProducts(res.items))
      .catch(() => {})
      .finally(() => setIsLoadingProducts(false));

    apiClient
      .get<Category[]>("/categories")
      .then((all) =>
        setCategories(all.filter((c) => c.parentId === null && c.isActive)),
      )
      .catch(() => {});
  }, []);

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
