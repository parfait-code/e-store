// app/admin/promotions/_components/PromotionCoupons.tsx
"use client";

import { useState, FormEvent } from "react";
import { Plus, Trash2, Ticket, Copy, Loader2 } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import type { Promotion, CouponCode, CouponFormInput } from "@/lib/types";

function CouponForm({
  promotionId,
  onCreated,
  onCancel,
}: {
  promotionId: string;
  onCreated: (c: CouponCode) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<CouponFormInput>({
    code: "",
    perUserLimit: 1,
    isActive: true,
  });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const payload: CouponFormInput = {
        ...form,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
      };
      const created = await apiClient.post<CouponCode>(
        `/promotions/${promotionId}/coupons`,
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
        <input
          type="text"
          required
          placeholder="Code (ex: SUMMER25) *"
          value={form.code}
          onChange={(e) =>
            setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
          }
          className={inputClass}
        />
        <input
          type="number"
          min={1}
          placeholder="Utilisations max (illimité si vide)"
          value={form.maxUses ?? ""}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              maxUses: e.target.value ? Number(e.target.value) : undefined,
            }))
          }
          className={inputClass}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Limite par utilisateur
          </label>
          <input
            type="number"
            min={1}
            value={form.perUserLimit}
            onChange={(e) =>
              setForm((f) => ({ ...f, perUserLimit: Number(e.target.value) }))
            }
            className={`${inputClass} w-full`}
          />
        </div>
        <label className="flex items-end gap-2 pb-2 text-xs font-medium text-gray-600">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) =>
              setForm((f) => ({ ...f, isActive: e.target.checked }))
            }
          />
          Actif
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Date de début (optionnel)
          </label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={`${inputClass} w-full`}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Date de fin (optionnel)
          </label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={`${inputClass} w-full`}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
        >
          {isSubmitting ? "Création..." : "Créer le coupon"}
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

export function PromotionCoupons({
  promotion,
  onUpdated,
}: {
  promotion: Promotion;
  onUpdated: (p: Promotion) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  async function handleDelete(couponId: string) {
    if (!confirm("Supprimer ce coupon ?")) return;
    setDeletingId(couponId);
    try {
      await apiClient.delete(`/promotions/${promotion.id}/coupons/${couponId}`);
      onUpdated({
        ...promotion,
        coupons: promotion.coupons.filter((c) => c.id !== couponId),
      });
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Suppression impossible");
    } finally {
      setDeletingId(null);
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium">
          Coupons ({promotion.coupons.length})
        </h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
          >
            <Plus size={14} /> Ajouter un coupon
          </button>
        )}
      </div>

      {showForm && (
        <CouponForm
          promotionId={promotion.id}
          onCreated={(c) => {
            onUpdated({ ...promotion, coupons: [...promotion.coupons, c] });
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {promotion.coupons.length === 0 ? (
        <p className="text-sm text-gray-400">Aucun coupon défini.</p>
      ) : (
        <div className="space-y-2">
          {promotion.coupons.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-3 text-sm"
            >
              <div className="flex items-center gap-2">
                <Ticket size={14} className="text-gray-400" />
                <button
                  onClick={() => copyCode(c.code)}
                  className="flex items-center gap-1 font-mono font-medium hover:text-gray-600"
                >
                  {c.code}
                  <Copy size={12} className="text-gray-400" />
                  {copiedCode === c.code && (
                    <span className="text-xs text-green-600">Copié</span>
                  )}
                </button>
                <span className="text-gray-500">
                  {c.usedCount}/{c.maxUses ?? "∞"} utilisations · limite{" "}
                  {c.perUserLimit}/utilisateur
                </span>
                {!c.isActive && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                    Inactif
                  </span>
                )}
                {c.isActive && c.effectiveIsActive === false && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                    Épuisé / expiré
                  </span>
                )}
              </div>
              <button
                onClick={() => handleDelete(c.id)}
                disabled={deletingId === c.id}
                className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              >
                {deletingId === c.id ? (
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
