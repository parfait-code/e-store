// app/(public)/categories/[slug]/CategoryPageClient.tsx
"use client";

import { useState } from "react"; // useEffect retiré, plus utilisé
import Link from "next/link";
import Image from "next/image";
import { SlidersHorizontal } from "lucide-react";
import { ApiError } from "@/lib/api-client";
import { ProductGrid } from "@/components/ProductGrid";
import { Pagination } from "@/components/Pagination";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  ProductFilters,
  type ProductFiltersValue,
} from "@/components/ProductFilters";
import {
  useCategoryBySlug,
  useCategoryProducts,
} from "@/lib/queries/shop/useCatalog";

export function CategoryPageClient({ slug }: { slug: string }) {
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ProductFiltersValue>({
    tags: [],
    sort: "newest",
  });

  // Réinitialise la pagination quand on change de catégorie, sans passer par
  // un effet : on compare le slug courant à celui du dernier rendu et on
  // ajuste l'état directement (pattern recommandé par React pour ce cas).
  const [prevSlug, setPrevSlug] = useState(slug);
  if (slug !== prevSlug) {
    setPrevSlug(slug);
    setPage(1);
  }

  const { data: category } = useCategoryBySlug(slug);
  const {
    data: productsData,
    isLoading,
    isError,
    error,
  } = useCategoryProducts(slug, page, 24, {
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    tags: filters.tags.length > 0 ? filters.tags : undefined,
    sort: filters.sort,
  });

  function updateFilters(next: ProductFiltersValue) {
    setFilters(next);
    setPage(1);
  }

  if (isError) {
    const message =
      error instanceof ApiError ? error.message : "Catégorie introuvable.";
    return (
      <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
        {message}
      </div>
    );
  }

  const categoryName = productsData?.category.name ?? category?.name ?? "";

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
    { label: categoryName || "…" },
  ];

  const hasImage = Boolean(category?.imageUrl);

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />

      {hasImage ? (
        <div className="relative mb-6 aspect-4/1 w-full overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={category!.imageUrl!}
            alt={categoryName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1200px"
          />
        </div>
      ) : (
        <div className="mb-6">
          {categoryName ? (
            <h1 className="text-xl font-semibold">{categoryName}</h1>
          ) : (
            <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
          )}
          {category?.description && (
            <p className="mt-1 text-sm text-gray-500">{category.description}</p>
          )}
        </div>
      )}

      {category?.children && category.children.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {category.children.map((child) => (
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

      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          aria-expanded={showFilters}
          className="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <SlidersHorizontal size={16} /> Filtrer
        </button>
      </div>

      <div
        className={showFilters ? "grid grid-cols-1 gap-6 md:grid-cols-4" : ""}
      >
        {showFilters && (
          <div className="md:col-span-1">
            <ProductFilters value={filters} onChange={updateFilters} />
          </div>
        )}
        <div className={showFilters ? "md:col-span-3" : ""}>
          <ProductGrid
            products={productsData?.items ?? []}
            isLoading={isLoading}
            emptyMessage={
              categoryName
                ? `Aucun produit dans "${categoryName}" pour le moment.`
                : "Aucun produit pour le moment."
            }
          />
          <Pagination
            page={page}
            totalPages={productsData?.totalPages ?? 1}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
