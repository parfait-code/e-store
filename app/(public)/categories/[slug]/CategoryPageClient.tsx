// app/(public)/categories/[slug]/CategoryPageClient.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { ApiError } from "@/lib/api-client";
import { ProductGrid } from "@/components/ProductGrid";
import { Pagination } from "@/components/Pagination";
import { Breadcrumb } from "@/components/Breadcrumb";
import Image from "next/image";
import {
  useCategoryBySlug,
  useCategoryProducts,
} from "@/lib/queries/shop/useCatalog";

export function CategoryPageClient({ slug }: { slug: string }) {
  const [page, setPage] = useState(1);

  // FIX #1 : Next.js réutilise la même instance de composant quand seul le
  // slug change (même route). Sans ce reset, on peut rester bloqué sur une
  // page > 1 en changeant de catégorie (ex: page 3 → sous-catégorie à 1 page).
  useEffect(() => {
    setPage(1);
  }, [slug]);

  const { data: category } = useCategoryBySlug(slug);
  const {
    data: productsData,
    isLoading,
    isError,
    error,
  } = useCategoryProducts(slug, page);

  if (isLoading && !productsData) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (isError || !productsData) {
    // FIX #4 : distinguer un vrai message d'erreur backend d'une erreur
    // réseau générique, plutôt que toujours afficher "Catégorie introuvable"
    // même sur un timeout ou une erreur serveur.
    const message =
      error instanceof ApiError ? error.message : "Catégorie introuvable.";
    return (
      <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
        {message}
      </div>
    );
  }

  // FIX #3 : exploite category.parent pour un fil d'Ariane fidèle à la
  // hiérarchie réelle (max 2 niveaux disponibles côté type CategoryRef).
  const breadcrumbItems = [
    { label: "Produits", href: "/products" },
    ...(category?.parent
      ? [
          {
            label: category.parent.name,
            href: `/categories/${category.parent.slug}`,
          },
        ]
      : []),
    { label: productsData.category.name },
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />

      {category?.imageUrl && (
        <div className="relative mb-6 aspect-[4/1] w-full overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={category.imageUrl}
            alt={productsData.category.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1200px"
          />
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-xl font-semibold">{productsData.category.name}</h1>
        {category?.description && (
          <p className="mt-1 text-sm text-gray-500">{category.description}</p>
        )}
        <p className="mt-1 text-sm text-gray-400">
          {productsData.total} produit(s)
        </p>
      </div>

      {category?.children && category.children.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {category.children.map((child) => (
            // FIX #2 : Link au lieu de <a> — navigation client, pas de
            // rechargement complet de page.
            <Link
              key={child.id}
              href={`/categories/${child.slug}`}
              className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}

      <ProductGrid
        products={productsData.items}
        isLoading={isLoading}
        emptyMessage={`Aucun produit dans "${productsData.category.name}" pour le moment.`}
      />
      <Pagination
        page={page}
        totalPages={productsData.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
