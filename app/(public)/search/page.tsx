// app/(public)/search/page.tsx
"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { ProductGrid } from "@/components/ProductGrid";
import { Pagination } from "@/components/Pagination";
import type { Product, Paginated } from "@/lib/types";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";

  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchResults = useCallback(() => {
    if (!query) {
      setProducts([]);
      setTotal(0);
      return;
    }
    setIsLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: "24",
      search: query,
    });
    apiClient
      .get<Paginated<Product>>(`/product?${params.toString()}`)
      .then((res) => {
        setProducts(res.items ?? []);
        setTotalPages(res.totalPages);
        setTotal(res.total);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [query, page]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return (
    <div>
      {query ? (
        <>
          <p className="mb-4 text-sm text-gray-500">
            {total} résultat(s) pour «{" "}
            <span className="font-medium text-gray-900">{query}</span> »
          </p>
          <ProductGrid
            products={products}
            isLoading={isLoading}
            emptyMessage={`Aucun produit ne correspond à "${query}".`}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
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
