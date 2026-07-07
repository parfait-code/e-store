// app/(public)/products/page.tsx
"use client";

import { useState } from "react";
import { useCategories } from "@/lib/queries/shop/useCatalog";
import { useProducts } from "@/lib/queries/shop/useCatalog";
import { ProductGrid } from "@/components/ProductGrid";
import { Pagination } from "@/components/Pagination";
import { Breadcrumb } from "@/components/Breadcrumb";

export default function ProductsPage() {
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);

  const { data: categories = [] } = useCategories();
  const { data, isLoading } = useProducts({
    page,
    categoryId: categoryId || undefined,
  });

  const products = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

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
          {categories
            .filter((c) => c.parentId === null)
            .map((c) => (
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
