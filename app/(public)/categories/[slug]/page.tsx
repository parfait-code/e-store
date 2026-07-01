// app/(public)/categories/[slug]/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { ProductGrid } from "@/components/ProductGrid";
import { Pagination } from "@/components/Pagination";
import { Breadcrumb } from "@/components/Breadcrumb";
import type { Category, CategoryProductsResponse } from "@/lib/types";

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [productsData, setProductsData] =
    useState<CategoryProductsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(() => {
    setIsLoading(true);
    apiClient
      .get<CategoryProductsResponse>(
        `/categories/slug/${slug}/products?page=${page}&limit=24`,
      )
      .then(setProductsData)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Catégorie introuvable",
        ),
      )
      .finally(() => setIsLoading(false));
  }, [slug, page]);

  useEffect(() => {
    apiClient
      .get<Category>(`/categories/slug/${slug}`)
      .then(setCategory)
      .catch(() => {});
  }, [slug]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (isLoading && !productsData) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !productsData) {
    return (
      <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
        {error ?? "Catégorie introuvable."}
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb
        items={[
          { label: "Produits", href: "/products" },
          { label: productsData.category.name },
        ]}
      />

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
            <a
              key={child.id}
              href={`/categories/${child.slug}`}
              className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
            >
              {child.name}
            </a>
          ))}
        </div>
      )}

      <ProductGrid products={productsData.items} isLoading={isLoading} />
      <Pagination
        page={page}
        totalPages={productsData.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
