// app/(public)/search/page.tsx
"use client";

import { useState, Suspense } from "react"; // useEffect retiré
import { useSearchParams } from "next/navigation";
import { useProducts } from "@/lib/queries/shop/useCatalog";
import { ProductGrid } from "@/components/ProductGrid";
import { Pagination } from "@/components/Pagination";
import {
  ProductFilters,
  type ProductFiltersValue,
} from "@/components/ProductFilters";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const tagFromUrl = searchParams.get("tag");

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ProductFiltersValue>({
    tags: tagFromUrl ? [tagFromUrl] : [],
    sort: "newest",
  });

  // Réinitialise la pagination quand la recherche (q ou tag) change, ajusté
  // pendant le rendu plutôt que via un effet.
  const criteriaKey = `${query}|${tagFromUrl ?? ""}`;
  const [prevCriteriaKey, setPrevCriteriaKey] = useState(criteriaKey);
  if (criteriaKey !== prevCriteriaKey) {
    setPrevCriteriaKey(criteriaKey);
    setPage(1);
  }

  const hasCriteria = Boolean(query) || filters.tags.length > 0;

  const { data, isLoading } = useProducts({
    page,
    search: query || undefined,
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
      {hasCriteria ? (
        <>
          <p className="mb-4 text-sm text-gray-500">
            {total} résultat(s)
            {query && (
              <>
                {" "}
                pour «{" "}
                <span className="font-medium text-gray-900">{query}</span> »
              </>
            )}
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="md:col-span-1">
              <ProductFilters value={filters} onChange={updateFilters} />
            </div>
            <div className="md:col-span-3">
              <ProductGrid
                products={products}
                isLoading={isLoading}
                emptyMessage={
                  query
                    ? `Aucun produit ne correspond à "${query}".`
                    : "Aucun produit ne correspond à ces critères."
                }
              />
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-400">
          Entrez un terme de recherche pour commencer.
        </p>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageContent />
    </Suspense>
  );
}
