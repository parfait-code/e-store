// app/admin/products/_components/ProductForm.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { Loader2, Save } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import type {
  CategoryRef,
  ProductFormInput,
  ProductStatus,
  Product,
} from "@/lib/types";

interface ProductFormProps {
  initialProduct?: Product; // présent en mode édition
  onSuccess: (product: Product) => void;
}

const STATUS_OPTIONS: ProductStatus[] = ["DRAFT", "ACTIVE", "ARCHIVED"];

export function ProductForm({ initialProduct, onSuccess }: ProductFormProps) {
  const isEditing = Boolean(initialProduct);
  const [categories, setCategories] = useState<CategoryRef[]>([]);
  const [form, setForm] = useState<ProductFormInput>({
    sku: initialProduct?.sku ?? "",
    name: initialProduct?.name ?? "",
    description: initialProduct?.description ?? "",
    price: initialProduct?.price ?? 0,
    categoryId: initialProduct?.categoryId ?? "",
    status: initialProduct?.status ?? "DRAFT",
    weight: initialProduct?.weight ?? undefined,
    brand: initialProduct?.brand ?? "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    apiClient
      .get<CategoryRef[]>("/categories")
      .then(setCategories)
      .catch(() => {});
  }, []);

  function update<K extends keyof ProductFormInput>(
    key: K,
    value: ProductFormInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        weight: form.weight ? Number(form.weight) : undefined,
      };
      const result = isEditing
        ? await apiClient.patch<Product>(
            `/product/${initialProduct!.id}`,
            payload,
          )
        : await apiClient.post<Product>("/product", payload);
      onSuccess(result);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        const details = err.details as
          | { fieldErrors?: Record<string, string[]> }
          | undefined;
        if (details?.fieldErrors) setFieldErrors(details.fieldErrors);
      } else {
        setError("Une erreur est survenue.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

  function fieldError(name: string) {
    return fieldErrors[name]?.[0];
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">SKU</label>
          <input
            type="text"
            required
            value={form.sku}
            onChange={(e) => update("sku", e.target.value)}
            className={inputClass}
          />
          {fieldError("sku") && (
            <p className="mt-1 text-xs text-red-600">{fieldError("sku")}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Marque</label>
          <input
            type="text"
            value={form.brand}
            onChange={(e) => update("brand", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Nom</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          className={inputClass}
        />
        {fieldError("name") && (
          <p className="mt-1 text-xs text-red-600">{fieldError("name")}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Prix (XAF)</label>
          <input
            type="number"
            required
            min={0}
            value={form.price}
            onChange={(e) => update("price", Number(e.target.value))}
            className={inputClass}
          />
          {fieldError("price") && (
            <p className="mt-1 text-xs text-red-600">{fieldError("price")}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Poids (kg)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.weight ?? ""}
            onChange={(e) =>
              update(
                "weight",
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Statut</label>
          <select
            value={form.status}
            onChange={(e) => update("status", e.target.value as ProductStatus)}
            className={inputClass}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Catégorie</label>
        <select
          required
          value={form.categoryId}
          onChange={(e) => update("categoryId", e.target.value)}
          className={inputClass}
        >
          <option value="">Sélectionner...</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {fieldError("categoryId") && (
          <p className="mt-1 text-xs text-red-600">
            {fieldError("categoryId")}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
      >
        {isSubmitting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Save size={16} />
        )}
        {isEditing ? "Enregistrer les modifications" : "Créer le produit"}
      </button>
    </form>
  );
}
