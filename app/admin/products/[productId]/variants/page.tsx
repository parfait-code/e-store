// app/admin/products/[productId]/variants/page.tsx
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  Check,
} from "lucide-react";
import { ApiError } from "@/lib/api-client";
import { formatXAF } from "@/lib/format";
import type {
  AttributeDefinition,
  ProductCombination,
  CombinationFormInput,
} from "@/lib/types";
import { useAdminProduct } from "@/lib/queries/admin/useCatalog";
import { useAdminCategoryAttributes } from "@/lib/queries/admin/useCategories";
import {
  useProductVariantSelections,
  useUpdateVariantSelection,
  useProductCombinationsList,
  useGenerateCombinations,
  useUpdateCombination,
  useDeleteCombination,
} from "@/lib/queries/admin/useProductVariants";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

// Sélecteur des options disponibles pour UN attribut de variante donné.
function AttributeSelectionEditor({
  productId,
  definition,
  selectedOptionIds,
}: {
  productId: string;
  definition: AttributeDefinition;
  selectedOptionIds: string[];
}) {
  const [selected, setSelected] = useState<string[]>(selectedOptionIds);
  const { mutate: updateSelection, isPending: isSaving } =
    useUpdateVariantSelection(productId);

  function toggle(optionId: string) {
    setSelected((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId],
    );
  }

  function handleSave() {
    updateSelection({
      attributeDefinitionId: definition.id,
      optionIds: selected,
    });
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
}: {
  productId: string;
  combination: ProductCombination;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<CombinationFormInput>({
    sku: combination.sku ?? undefined,
    price: combination.price ?? undefined,
    isActive: combination.isActive,
  });
  const [error, setError] = useState<string | null>(null);
  const { mutate: updateCombination, isPending: isSaving } =
    useUpdateCombination(productId);
  const { mutate: deleteCombination, isPending: isDeleting } =
    useDeleteCombination(productId);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleSave() {
    setError(null);
    updateCombination(
      { combinationId: combination.id, payload: form },
      {
        onSuccess: () => setIsEditing(false),
        onError: (err) =>
          setError(
            err instanceof ApiError
              ? err.message
              : "Erreur lors de la mise à jour",
          ),
      },
    );
  }

  function handleConfirmDelete() {
    deleteCombination(combination.id, {
      onSuccess: () => setConfirmDelete(false),
      onError: (err) => {
        alert(
          err instanceof ApiError
            ? err.message
            : "Suppression impossible (stock encore présent ?)",
        );
        setConfirmDelete(false);
      },
    });
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
    <>
      <div className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {combination.sku ?? "—"}
            </span>
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
            Stock total : {totalStock} unité(s) sur{" "}
            {combination.inventory.length} entrepôt(s)
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
            onClick={() => setConfirmDelete(true)}
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
      <ConfirmDialog
        open={confirmDelete}
        title="Supprimer la combinaison"
        message="Impossible si du stock existe encore dessus. Voulez-vous vraiment continuer ?"
        confirmLabel="Supprimer"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}

export default function ProductCombinationsPage() {
  const { productId } = useParams<{ productId: string }>();
  const {
    data: product,
    isLoading: isLoadingProduct,
    isError,
  } = useAdminProduct(productId);
  const { data: categoryAttrs = [] } = useAdminCategoryAttributes(
    product?.categoryId ?? "",
  );
  const variantAttributes = categoryAttrs.filter((a) => a.isVariant);

  const { data: selectionsRaw = [] } = useProductVariantSelections(productId);
  const selections: Record<string, string[]> = {};
  selectionsRaw.forEach((s) => {
    selections[s.attributeDefinitionId] = s.optionIds;
  });

  const { data: combinations = [] } = useProductCombinationsList(productId);
  const { mutate: generate, isPending: isGenerating } =
    useGenerateCombinations(productId);

  function handleGenerate() {
    generate(undefined, {
      onError: (err) =>
        alert(
          err instanceof ApiError
            ? err.message
            : "Erreur lors de la génération des combinaisons",
        ),
    });
  }

  if (isLoadingProduct)
    return <Loader2 size={20} className="animate-spin text-gray-400" />;
  if (isError || !product) {
    return (
      <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
        Produit introuvable.
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
