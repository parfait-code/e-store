// app/admin/products/[productId]/variants/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
} from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { formatXAF } from "@/lib/format";
import type {
  Product,
  Variant,
  AttributeDefinition,
  VariantFormInput,
} from "@/lib/types";

function AttributeValueInput({
  definition,
  value,
  onChange,
}: {
  definition: AttributeDefinition;
  value: string;
  onChange: (value: string) => void;
}) {
  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

  if (definition.type === "SELECT" || definition.type === "COLOR") {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      >
        <option value="">Sélectionner...</option>
        {definition.options.map((opt) => (
          <option key={opt.id} value={opt.value}>
            {opt.value}
          </option>
        ))}
      </select>
    );
  }

  if (definition.type === "BOOLEAN") {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      >
        <option value="">Sélectionner...</option>
        <option value="true">Oui</option>
        <option value="false">Non</option>
      </select>
    );
  }

  return (
    <input
      type={definition.type === "NUMBER" ? "number" : "text"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputClass}
      placeholder={definition.unit ?? undefined}
    />
  );
}

function VariantForm({
  productId,
  attributeDefinitions,
  editingVariant,
  onSuccess,
  onCancel,
}: {
  productId: string;
  attributeDefinitions: AttributeDefinition[];
  editingVariant?: Variant;
  onSuccess: (variant: Variant) => void;
  onCancel: () => void;
}) {
  const isEditing = Boolean(editingVariant);
  const [sku, setSku] = useState(editingVariant?.sku ?? "");
  const [price, setPrice] = useState<string>(
    editingVariant?.price?.toString() ?? "",
  );
  const [isActive, setIsActive] = useState(editingVariant?.isActive ?? true);
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    editingVariant?.attributeValues.forEach((av) => {
      initial[av.attributeDefinition.id] = av.value;
    });
    return initial;
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const attributes = attributeDefinitions
      .filter((def) => values[def.id]?.trim())
      .map((def) => ({ attributeDefinitionId: def.id, value: values[def.id] }));

    if (attributes.length === 0) {
      setError("Renseignez au moins un attribut.");
      return;
    }

    const payload: VariantFormInput = {
      sku,
      price: price ? Number(price) : undefined,
      isActive,
      attributes,
    };

    setIsSubmitting(true);
    try {
      const result = isEditing
        ? await apiClient.patch<Variant>(
            `/product/${productId}/variants/${editingVariant!.id}`,
            payload,
          )
        : await apiClient.post<Variant>(
            `/product/${productId}/variants`,
            payload,
          );
      onSuccess(result);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Une erreur est survenue.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">
          {isEditing ? "Modifier la variante" : "Nouvelle variante"}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            SKU
          </label>
          <input
            type="text"
            required
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Prix (XAF, optionnel — hérite du produit sinon)
          </label>
          <input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {attributeDefinitions.length === 0 ? (
        <p className="text-xs text-amber-600">
          Aucun attribut « variante » défini pour la catégorie de ce produit.
          Ajoutez-en dans la fiche catégorie avant de créer des variantes.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {attributeDefinitions.map((def) => (
            <div key={def.id}>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                {def.name}{" "}
                {def.isRequired && <span className="text-red-500">*</span>}
              </label>
              <AttributeValueInput
                definition={def}
                value={values[def.id] ?? ""}
                onChange={(v) =>
                  setValues((prev) => ({ ...prev, [def.id]: v }))
                }
              />
            </div>
          ))}
        </div>
      )}

      <label className="flex items-center gap-2 text-xs font-medium text-gray-600">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        Variante active
      </label>

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
        {isEditing ? "Enregistrer" : "Créer la variante"}
      </button>
    </form>
  );
}

export default function ProductVariantsPage() {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [attributeDefinitions, setAttributeDefinitions] = useState<
    AttributeDefinition[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [productRes, variantsRes] = await Promise.all([
          apiClient.get<Product>(`/product/${productId}`),
          apiClient.get<Variant[]>(`/product/${productId}/variants`),
        ]);
        setProduct(productRes);
        setVariants(variantsRes);

        const attrsRes = await apiClient.get<AttributeDefinition[]>(
          `/categories/${productRes.categoryId}/attributes`,
        );
        setAttributeDefinitions(attrsRes.filter((a) => a.isVariant));
      } catch (err) {
        setError(
          err instanceof ApiError ? err.message : "Erreur de chargement",
        );
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [productId]);

  async function handleDelete(variantId: string) {
    if (!confirm("Supprimer cette variante ?")) return;
    setDeletingId(variantId);
    try {
      await apiClient.delete(`/product/${productId}/variants/${variantId}`);
      setVariants((prev) => prev.filter((v) => v.id !== variantId));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Suppression impossible");
    } finally {
      setDeletingId(null);
    }
  }

  function handleFormSuccess(variant: Variant) {
    setVariants((prev) => {
      const exists = prev.some((v) => v.id === variant.id);
      return exists
        ? prev.map((v) => (v.id === variant.id ? variant : v))
        : [...prev, variant];
    });
    setShowForm(false);
    setEditingVariant(undefined);
  }

  if (isLoading)
    return <Loader2 size={20} className="animate-spin text-gray-400" />;
  if (error || !product) {
    return (
      <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
        {error ?? "Produit introuvable."}
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <Link
        href={`/admin/products/${productId}`}
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft size={14} /> Retour au produit
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Variantes — {product.name}</h1>
          <p className="text-sm text-gray-500">{variants.length} variante(s)</p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              setEditingVariant(undefined);
              setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            <Plus size={16} />
            Nouvelle variante
          </button>
        )}
      </div>

      {showForm && (
        <VariantForm
          productId={productId}
          attributeDefinitions={attributeDefinitions}
          editingVariant={editingVariant}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingVariant(undefined);
          }}
        />
      )}

      {variants.length === 0 ? (
        <p className="text-sm text-gray-400">
          Aucune variante pour ce produit.
        </p>
      ) : (
        <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
          {variants.map((variant) => (
            <div
              key={variant.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{variant.sku}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      variant.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {variant.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-gray-500">
                  {variant.attributeValues
                    .map((av) => `${av.attributeDefinition.name}: ${av.value}`)
                    .join(" · ")}
                  {variant.price !== null && ` · ${formatXAF(variant.price)}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingVariant(variant);
                    setShowForm(true);
                  }}
                  className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(variant.id)}
                  disabled={deletingId === variant.id}
                  className="rounded-md p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                >
                  {deletingId === variant.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
