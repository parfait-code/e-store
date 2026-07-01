// app/(public)/products/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { ProductGrid } from "@/components/ProductGrid";
import { Pagination } from "@/components/Pagination";
import { Breadcrumb } from "@/components/Breadcrumb";
import type { Product, CategoryRef, Paginated } from "@/lib/types";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryRef[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = useCallback(() => {
    setIsLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "24" });
    if (categoryId) params.set("categoryId", categoryId);

    apiClient
      .get<Paginated<Product>>(`/product?${params.toString()}`)
      .then((res) => {
        setProducts(res.items);
        setTotalPages(res.totalPages);
        setTotal(res.total);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [page, categoryId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    apiClient
      .get<CategoryRef[]>("/categories")
      .then(setCategories)
      .catch(() => {});
  }, []);

  return (
    <div>
      <Breadcrumb items={[{ label: "Tous les produits" }]} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Tous les produits</h1>
          <p className="text-sm text-gray-500">{total} produit(s)</p>
        </div>
        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setPage(1);
          }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <ProductGrid products={products} isLoading={isLoading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
