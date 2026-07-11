// app/(public)/search/page.tsx
"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { ProductGrid } from "@/components/ProductGrid";
import { Pagination } from "@/components/Pagination";
import type { Product, Paginated } from "@/lib/types";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") ?? "";

  const [searchInput, setSearchInput] = useState(query);
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
    setSearchInput(query);
  }, [query]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = searchInput.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="relative mb-6 max-w-lg">
        <SearchIcon
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Rechercher un produit..."
          className="w-full rounded-md border border-gray-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
        />
      </form>

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
