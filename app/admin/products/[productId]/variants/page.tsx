// app/admin/products/[productId]/variants/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  Save,
  Check,
} from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { formatXAF } from "@/lib/format";
import type {
  Product,
  AttributeDefinition,
  ProductCombination,
  CombinationFormInput,
} from "@/lib/types";

// Sélecteur des options disponibles pour UN attribut de variante donné.
// PUT /product/:productId/combinations/selections/:attributeDefinitionId
function AttributeSelectionEditor({
  productId,
  definition,
  selectedOptionIds,
  onSaved,
}: {
  productId: string;
  definition: AttributeDefinition;
  selectedOptionIds: string[];
  onSaved: (optionIds: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>(selectedOptionIds);
  const [isSaving, setIsSaving] = useState(false);

  function toggle(optionId: string) {
    setSelected((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId],
    );
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      await apiClient.put(
        `/product/${productId}/combinations/selections/${definition.id}`,
        { optionIds: selected },
      );
      onSaved(selected);
    } catch (err) {
      alert(
        err instanceof ApiError
          ? err.message
          : "Erreur lors de l'enregistrement des options",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="rounded-md border border-gray-200 bg-white p-3">
      <p className="mb-2 text-sm font-medium">{definition.name}</p>
      <div className="mb-3 flex flex-wrap gap-2">
        {definition.options.map((opt) => {
          const isSelected = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggle(opt.id)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
                isSelected
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {opt.colorHex && (
                <span
                  className="h-3 w-3 rounded-full border border-white/40"
                  style={{ backgroundColor: opt.colorHex }}
                />
              )}
              {opt.value}
            </button>
          );
        })}
        {definition.options.length === 0 && (
          <p className="text-xs text-gray-400">
            Aucune option définie pour cet attribut — ajoutez-en dans la fiche
            catégorie.
          </p>
        )}
      </div>
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
      >
        {isSaving ? "Enregistrement..." : "Enregistrer la sélection"}
      </button>
    </div>
  );
}
function CombinationEditRow({
  productId,
  combination,
  onUpdated,
  onDeleted,
}: {
  productId: string;
  combination: ProductCombination;
  onUpdated: (updated: ProductCombination) => void;
  onDeleted: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<CombinationFormInput>({
    sku: combination.sku ?? undefined,
    price: combination.price ?? undefined,
    isActive: combination.isActive,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await apiClient.patch<ProductCombination>(
        `/product/${productId}/combinations/${combination.id}`,
        form,
      );
      onUpdated(updated);
      setIsEditing(false);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Erreur lors de la mise à jour",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        "Supprimer cette combinaison ? Impossible si du stock existe encore dessus.",
      )
    )
      return;
    setIsDeleting(true);
    try {
      await apiClient.delete(
        `/product/${productId}/combinations/${combination.id}`,
      );
      onDeleted();
    } catch (err) {
      alert(
        err instanceof ApiError
          ? err.message
          : "Suppression impossible (stock encore présent ?)",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  const inputClass =
    "rounded-md border border-gray-300 px-2 py-1 text-sm outline-none focus:border-gray-900";

  const totalStock = combination.inventory.reduce(
    (sum, inv) => sum + inv.quantity,
    0,
  );

  if (isEditing) {
    return (
      <div className="flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 p-3">
        {error && <p className="text-xs text-red-600">{error}</p>}
        <input
          value={form.sku ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
          className={inputClass}
          placeholder="SKU"
        />
        <input
          type="number"
          value={form.price ?? ""}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              price: e.target.value ? Number(e.target.value) : undefined,
            }))
          }
          className={`${inputClass} w-28`}
          placeholder="Prix (hérite sinon)"
        />
        <label className="flex items-center gap-1.5 text-xs">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) =>
              setForm((f) => ({ ...f, isActive: e.target.checked }))
            }
          />
          Active
        </label>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-md p-1.5 text-green-600 hover:bg-green-50"
        >
          {isSaving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Check size={14} />
          )}
        </button>
        <button
          onClick={() => setIsEditing(false)}
          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-3">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{combination.sku ?? "—"}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${
              combination.isActive
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {combination.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-gray-500">
          {combination.values
            .map(
              (v) =>
                `${v.attributeDefinition.name}: ${v.attributeOption.value}`,
            )
            .join(" · ")}
          {combination.price !== null && ` · ${formatXAF(combination.price)}`}
        </p>
        <p className="mt-0.5 text-xs text-gray-400">
          Stock total : {totalStock} unité(s) sur {combination.inventory.length}{" "}
          entrepôt(s)
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsEditing(true)}
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded-md p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
        >
          {isDeleting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Trash2 size={16} />
          )}
        </button>
      </div>
    </div>
  );
}

export default function ProductCombinationsPage() {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [variantAttributes, setVariantAttributes] = useState<
    AttributeDefinition[]
  >([]);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [combinations, setCombinations] = useState<ProductCombination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadAll() {
    setIsLoading(true);
    try {
      const productRes = await apiClient.get<Product>(`/product/${productId}`);
      setProduct(productRes);

      const [attrsRes, selectionsRes, combosRes] = await Promise.all([
        apiClient.get<AttributeDefinition[]>(
          `/categories/${productRes.categoryId}/attributes`,
        ),
        apiClient
          .get<
            { attributeDefinitionId: string; optionIds: string[] }[]
          >(`/product/${productId}/combinations/selections`)
          .catch(() => []),
        apiClient
          .get<ProductCombination[]>(`/product/${productId}/combinations`)
          .catch(() => []),
      ]);

      setVariantAttributes(attrsRes.filter((a) => a.isVariant));
      const selMap: Record<string, string[]> = {};
      selectionsRes.forEach((s) => {
        selMap[s.attributeDefinitionId] = s.optionIds;
      });
      setSelections(selMap);
      setCombinations(combosRes);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur de chargement");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      const generated = await apiClient.post<ProductCombination[]>(
        `/product/${productId}/combinations/generate`,
      );
      setCombinations(generated);
    } catch (err) {
      alert(
        err instanceof ApiError
          ? err.message
          : "Erreur lors de la génération des combinaisons",
      );
    } finally {
      setIsGenerating(false);
    }
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

      <h1 className="mb-1 text-xl font-semibold">
        Combinaisons — {product.name}
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Sélectionnez les valeurs disponibles pour chaque attribut de variante,
        puis générez le produit cartésien.
      </p>

      {variantAttributes.length === 0 ? (
        <p className="mb-6 text-sm text-gray-400">
          Aucun attribut « variante » (isVariant: true) défini pour la catégorie
          de ce produit. Ajoutez-en dans la fiche catégorie.
        </p>
      ) : (
        <div className="mb-6 space-y-3">
          {variantAttributes.map((def) => (
            <AttributeSelectionEditor
              key={def.id}
              productId={productId}
              definition={def}
              selectedOptionIds={selections[def.id] ?? []}
              onSaved={(optionIds) =>
                setSelections((prev) => ({ ...prev, [def.id]: optionIds }))
              }
            />
          ))}
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={isGenerating || variantAttributes.length === 0}
        className="mb-6 flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {isGenerating ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <RefreshCw size={16} />
        )}
        Générer les combinaisons
      </button>
      <p className="-mt-4 mb-6 text-xs text-gray-400">
        Crée les combinaisons manquantes, réactive celles qui correspondent
        encore aux sélections, désactive les autres. Le stock n'est jamais
        supprimé automatiquement.
      </p>

      <h2 className="mb-3 text-sm font-medium">
        Combinaisons ({combinations.length})
      </h2>
      {combinations.length === 0 ? (
        <p className="text-sm text-gray-400">
          Aucune combinaison générée pour l'instant.
        </p>
      ) : (
        <div className="space-y-2">
          {combinations.map((combo) => (
            <CombinationEditRow
              key={combo.id}
              productId={productId}
              combination={combo}
              onUpdated={(updated) =>
                setCombinations((prev) =>
                  prev.map((c) => (c.id === updated.id ? updated : c)),
                )
              }
              onDeleted={() =>
                setCombinations((prev) => prev.filter((c) => c.id !== combo.id))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
