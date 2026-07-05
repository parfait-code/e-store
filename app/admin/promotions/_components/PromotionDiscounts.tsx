// app/admin/promotions/_components/PromotionDiscounts.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { Plus, Trash2, Percent, DollarSign, Loader2 } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import type {
  Promotion,
  Discount,
  DiscountFormInput,
  CategoryRef,
} from "@/lib/types";

function DiscountForm({
  promotionId,
  onCreated,
  onCancel,
}: {
  promotionId: string;
  onCreated: (d: Discount) => void;
  onCancel: () => void;
}) {
  const [categories, setCategories] = useState<CategoryRef[]>([]);
  const [form, setForm] = useState<DiscountFormInput>({
    type: "PERCENTAGE",
    value: 10,
  });
  const [targetMode, setTargetMode] = useState<"category" | "products">(
    "category",
  );
  const [productIdsInput, setProductIdsInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    apiClient
      .get<CategoryRef[]>("/categories")
      .then(setCategories)
      .catch(() => {});
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const payload: DiscountFormInput = {
        type: form.type,
        value: Number(form.value),
        categoryId: targetMode === "category" ? form.categoryId : undefined,
        productIds:
          targetMode === "products"
            ? productIdsInput
                .split(",")
                .map((s) => Number(s.trim()))
                .filter((n) => !isNaN(n))
            : undefined,
      };
      const created = await apiClient.post<Discount>(
        `/promotions/${promotionId}/discounts`,
        payload,
      );
      onCreated(created);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Erreur lors de la création",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 space-y-3 rounded-md border border-gray-200 bg-gray-50 p-4"
    >
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <select
          value={form.type}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              type: e.target.value as DiscountFormInput["type"],
            }))
          }
          className={inputClass}
        >
          <option value="PERCENTAGE">Pourcentage</option>
          <option value="FIXED_AMOUNT">Montant fixe (XAF)</option>
        </select>
        <input
          type="number"
          required
          min={0}
          max={form.type === "PERCENTAGE" ? 100 : undefined}
          value={form.value}
          onChange={(e) =>
            setForm((f) => ({ ...f, value: Number(e.target.value) }))
          }
          className={inputClass}
          placeholder="Valeur"
        />
      </div>

      <div className="flex gap-4 text-xs">
        <label className="flex items-center gap-1.5">
          <input
            type="radio"
            checked={targetMode === "category"}
            onChange={() => setTargetMode("category")}
          />
          Cibler une catégorie
        </label>
        <label className="flex items-center gap-1.5">
          <input
            type="radio"
            checked={targetMode === "products"}
            onChange={() => setTargetMode("products")}
          />
          Cibler des produits (IDs)
        </label>
      </div>

      {targetMode === "category" ? (
        <select
          value={form.categoryId ?? ""}
          onChange={(e) =>
            setForm((f) => ({ ...f, categoryId: e.target.value }))
          }
          className={inputClass}
        >
          <option value="">Sélectionner une catégorie...</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          placeholder="IDs produits séparés par des virgules (ex: 12, 15, 20)"
          value={productIdsInput}
          onChange={(e) => setProductIdsInput(e.target.value)}
          className={`${inputClass} w-full`}
        />
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
        >
          {isSubmitting ? "Création..." : "Créer la remise"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

export function PromotionDiscounts({
  promotion,
  onUpdated,
}: {
  promotion: Promotion;
  onUpdated: (p: Promotion) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(discountId: string) {
    if (!confirm("Supprimer cette remise ?")) return;
    setDeletingId(discountId);
    try {
      await apiClient.delete(
        `/promotions/${promotion.id}/discounts/${discountId}`,
      );
      onUpdated({
        ...promotion,
        discounts: promotion.discounts.filter((d) => d.id !== discountId),
      });
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Suppression impossible");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium">
          Remises ({promotion.discounts.length})
        </h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
          >
            <Plus size={14} /> Ajouter une remise
          </button>
        )}
      </div>

      {showForm && (
        <DiscountForm
          promotionId={promotion.id}
          onCreated={(d) => {
            onUpdated({ ...promotion, discounts: [...promotion.discounts, d] });
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {promotion.discounts.length === 0 ? (
        <p className="text-sm text-gray-400">Aucune remise définie.</p>
      ) : (
        <div className="space-y-2">
          {promotion.discounts.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-3 text-sm"
            >
              <div className="flex items-center gap-2">
                {d.type === "PERCENTAGE" ? (
                  <Percent size={14} className="text-gray-400" />
                ) : (
                  <DollarSign size={14} className="text-gray-400" />
                )}
                <span className="font-medium">
                  {d.type === "PERCENTAGE" ? `${d.value}%` : `${d.value} XAF`}
                </span>
                <span className="text-gray-500">
                  {d.category
                    ? `sur ${d.category.name}`
                    : `sur ${d.products.length} produit(s)`}
                </span>
              </div>
              <button
                onClick={() => handleDelete(d.id)}
                disabled={deletingId === d.id}
                className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              >
                {deletingId === d.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
