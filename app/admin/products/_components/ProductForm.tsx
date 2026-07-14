// app/admin/products/_components/ProductForm.tsx
"use client";

import { useState, FormEvent } from "react";
import { Loader2, Save, AlertTriangle } from "lucide-react";
import { ApiError } from "@/lib/api-client";
import type { ProductFormInput, ProductStatus, Product } from "@/lib/types";
import {
  useAdminCategories,
  useCreateProduct,
  useUpdateProduct,
} from "@/lib/queries/admin/useCatalog";
import { useAdminCategoryAttributes } from "@/lib/queries/admin/useCategories";

interface ProductFormProps {
  initialProduct?: Product;
  onSuccess: (product: Product) => void;
}

const STATUS_OPTIONS: ProductStatus[] = ["DRAFT", "ACTIVE", "ARCHIVED"];

export function ProductForm({ initialProduct, onSuccess }: ProductFormProps) {
  const isEditing = Boolean(initialProduct);
  const { data: categories = [] } = useAdminCategories();
  const [form, setForm] = useState<ProductFormInput>({
    sku: initialProduct?.sku ?? "",
    name: initialProduct?.name ?? "",
    description: initialProduct?.description ?? "",
    price: initialProduct?.price ?? 0,
    categoryId: initialProduct?.categoryId ?? "",
    status: initialProduct?.status ?? "DRAFT",
    weight: initialProduct?.weight ?? undefined,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);

  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct(
    String(initialProduct?.id ?? ""),
  );
  const isSubmitting = isCreating || isUpdating;

  const { data: categoryAttributes = [], isLoading: isCheckingAttrs } =
    useAdminCategoryAttributes(initialProduct?.categoryId ?? "");

  const missingRequiredAttrs = isEditing
    ? categoryAttributes.filter((d) => {
        if (d.isVariant || !d.isRequired) return false;
        const attributeValues = Array.isArray(initialProduct?.attributeValues)
          ? initialProduct!.attributeValues
          : [];
        const coveredIds = new Set(
          attributeValues.map((av) => av.attributeDefinition.id),
        );
        return !coveredIds.has(d.id);
      })
    : [];

  function update<K extends keyof ProductFormInput>(
    key: K,
    value: ProductFormInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (
      isEditing &&
      form.status === "ACTIVE" &&
      missingRequiredAttrs.length > 0
    ) {
      setError(
        `Impossible d'activer : attributs requis manquants (${missingRequiredAttrs
          .map((a) => a.name)
          .join(
            ", ",
          )}). Renseignez-les dans "Caractéristiques produit" ci-dessous.`,
      );
      return;
    }

    const payload: Record<string, unknown> = {
      sku: form.sku,
      name: form.name,
      description: form.description,
      price: Number(form.price),
      weight: form.weight !== undefined ? Number(form.weight) : undefined,
    };

    if (isEditing) {
      if (form.status !== initialProduct!.status) {
        payload.status = form.status;
      }
    } else {
      payload.categoryId = form.categoryId;
    }

    const onError = (err: unknown) => {
      if (err instanceof ApiError) {
        setError(err.message);
        const details = err.details as
          | { fieldErrors?: Record<string, string[]> }
          | undefined;
        if (details?.fieldErrors) setFieldErrors(details.fieldErrors);
      } else {
        setError("Une erreur est survenue.");
      }
    };

    if (isEditing) {
      updateProduct(payload, { onSuccess, onError });
    } else {
      createProduct(payload, { onSuccess, onError });
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
            min={1}
            value={form.price}
            onChange={(e) => update("price", Number(e.target.value))}
            className={inputClass}
          />
          {fieldError("price") && (
            <p className="mt-1 text-xs text-red-600">{fieldError("price")}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            Poids (kg) {!isEditing && <span className="text-red-500">*</span>}
          </label>
          <input
            type="number"
            required={!isEditing}
            min={0.01}
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
          {fieldError("weight") && (
            <p className="mt-1 text-xs text-red-600">{fieldError("weight")}</p>
          )}
        </div>

        {isEditing ? (
          <div>
            <label className="mb-1 block text-sm font-medium">Statut</label>
            <select
              value={form.status}
              onChange={(e) =>
                update("status", e.target.value as ProductStatus)
              }
              className={inputClass}
            >
              {STATUS_OPTIONS.map((s) => (
                <option
                  key={s}
                  value={s}
                  disabled={s === "ACTIVE" && missingRequiredAttrs.length > 0}
                >
                  {s}
                </option>
              ))}
            </select>
            {isCheckingAttrs ? (
              <p className="mt-1 text-xs text-gray-400">
                Vérification des attributs requis...
              </p>
            ) : (
              missingRequiredAttrs.length > 0 && (
                <p className="mt-1 flex items-start gap-1 text-xs text-amber-600">
                  <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                  Manquant pour activer :{" "}
                  {missingRequiredAttrs.map((a) => a.name).join(", ")}
                </p>
              )
            )}
          </div>
        ) : (
          <div className="flex items-end pb-2 text-xs text-gray-400">
            Créé en brouillon — activable après complétion.
          </div>
        )}
      </div>

      {isEditing ? (
        <div>
          <label className="mb-1 block text-sm font-medium">Catégorie</label>
          <p className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
            {initialProduct!.category.name}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            La catégorie ne peut plus être modifiée après création.
          </p>
        </div>
      ) : (
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
      )}

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
