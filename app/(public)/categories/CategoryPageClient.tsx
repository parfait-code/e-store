// app/(public)/categories/[slug]/CategoryPageClient.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ApiError } from "@/lib/api-client";
import { ProductGrid } from "@/components/ProductGrid";
import { Pagination } from "@/components/Pagination";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  useCategoryBySlug,
  useCategoryProducts,
} from "@/lib/queries/shop/useCatalog";

export function CategoryPageClient({ slug }: { slug: string }) {
  const [page, setPage] = useState(1);

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
  );
}
