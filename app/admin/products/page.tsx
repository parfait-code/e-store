// app/admin/products/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ImageOff,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { formatXAF } from "@/lib/format";
import type {
  Product,
  CategoryRef,
  Paginated,
  ProductStatus,
} from "@/lib/types";

const STATUS_STYLES: Record<ProductStatus, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  DRAFT: "bg-gray-100 text-gray-600",
  ARCHIVED: "bg-amber-100 text-amber-700",
};

const STATUS_LABELS: Record<ProductStatus, string> = {
  ACTIVE: "Actif",
  DRAFT: "Brouillon",
  ARCHIVED: "Archivé",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryRef[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [categoryId, setCategoryId] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Debounce : évite un appel API à chaque frappe
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const fetchProducts = useCallback(() => {
    setIsLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (categoryId) params.set("categoryId", categoryId);
    if (search) params.set("search", search);

    apiClient
      .get<Paginated<Product>>(`/product?${params.toString()}`)
      .then((res) => {
        setProducts(res.items);
        setTotalPages(res.totalPages);
        setTotal(res.total);
      })
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Erreur de chargement",
        ),
      )
      .finally(() => setIsLoading(false));
  }, [page, categoryId, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    apiClient
      .get<CategoryRef[]>("/categories")
      .then(setCategories)
      .catch(() => {});
  }, []);

  async function handleDelete(productId: number) {
    if (!confirm("Supprimer ce produit ? Cette action est irréversible."))
      return;
    setDeletingId(productId);
    try {
      await apiClient.delete(`/product/${productId}`);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setTotal((t) => t - 1);
    } catch (err) {
      alert(
        err instanceof ApiError ? err.message : "Erreur lors de la suppression",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Produits</h1>
          <p className="text-sm text-gray-500">{total} produit(s) au total</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          <Plus size={16} />
          Nouveau produit
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Rechercher (nom, SKU)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-64 rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
          />
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

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
              <th className="px-4 py-3">Produit</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3">Prix</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Variantes</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  <Loader2 size={20} className="mx-auto animate-spin" />
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  Aucun produit trouvé.
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const primaryImage =
                  product.images.find((img) => img.isPrimary) ??
                  product.images[0];
                return (
                  <tr
                    key={product.id}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-100">
                          {primaryImage ? (
                            <Image
                              src={primaryImage.url}
                              alt={primaryImage.altText ?? product.name}
                              width={40}
                              height={40}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageOff size={16} className="text-gray-400" />
                          )}
                        </div>
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{product.sku}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {product.category?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {product.pricing?.hasDiscount ? (
                        <div>
                          <span className="font-medium text-green-600">
                            {formatXAF(product.pricing.finalPrice)}
                          </span>
                          <span className="ml-1 text-xs text-gray-400 line-through">
                            {formatXAF(product.pricing.originalPrice)}
                          </span>
                          <span className="ml-1 text-xs text-green-600">
                            -{product.pricing.discountPercentage}%
                          </span>
                        </div>
                      ) : (
                        formatXAF(product.price)
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[product.status]}`}
                      >
                        {STATUS_LABELS[product.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {product.variants.length}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingId === product.id}
                          className="rounded-md p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          {deletingId === product.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Page {page} sur {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 disabled:opacity-40"
            >
              <ChevronLeft size={14} /> Précédent
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 disabled:opacity-40"
            >
              Suivant <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
