// app/(public)/products/page.tsx
"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useCategories, useProducts } from "@/lib/queries/shop/useCatalog";
import { ProductGrid } from "@/components/ProductGrid";
import { Pagination } from "@/components/Pagination";
import { Breadcrumb } from "@/components/Breadcrumb";
import {
  ProductFilters,
  type ProductFiltersValue,
} from "@/components/ProductFilters";

export default function ProductsPage() {
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ProductFiltersValue>({
    tags: [],
    sort: "newest",
  });

  const { data: categories = [] } = useCategories();
  const { data, isLoading } = useProducts({
    page,
    categoryId: categoryId || undefined,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    tags: filters.tags.length > 0 ? filters.tags : undefined,
    sort: filters.sort,
  });

  const products = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  function updateFilters(next: ProductFiltersValue) {
    setFilters(next);
    setPage(1);
  }

  return (
    <div>
      <Breadcrumb items={[{ label: "Tous les produits" }]} />

      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Tous les produits</h1>
          <p className="text-sm text-gray-500">{total} produit(s)</p>
        </div>
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          aria-expanded={showFilters}
          aria-label="Filtrer les produits"
          className="flex shrink-0 items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:px-4"
        >
          <SlidersHorizontal size={16} />
          <span className="hidden sm:inline">Filtrer</span>
        </button>
      </div>

      {showFilters && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Catégorie
            </label>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            >
              <option value="">Toutes les catégories</option>
              {categories
                .filter((c) => c.parentId === null)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>
          <ProductFilters value={filters} onChange={updateFilters} />
        </div>
      )}

      <ProductGrid products={products} isLoading={isLoading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
