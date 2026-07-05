// app/admin/promotions/[promotionId]/page.tsx
"use client";

import { useEffect, useState, useRef, FormEvent, ChangeEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Loader2,
  Save,
  Upload,
  X,
  Plus,
  Trash2,
  Percent,
  DollarSign,
  Ticket,
  Copy,
} from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import type {
  Promotion,
  PromotionFormInput,
  Discount,
  DiscountFormInput,
  CouponCode,
  CouponFormInput,
  CategoryRef,
} from "@/lib/types";

// ---------- Infos générales ----------
function PromotionInfoForm({
  promotion,
  onUpdated,
}: {
  promotion: Promotion;
  onUpdated: (p: Promotion) => void;
}) {
  const [form, setForm] = useState<PromotionFormInput>({
    name: promotion.name,
    slug: promotion.slug,
    description: promotion.description ?? "",
    startDate: promotion.startDate.slice(0, 16),
    endDate: promotion.endDate.slice(0, 16),
    isActive: promotion.isActive,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof PromotionFormInput>(
    key: K,
    value: PromotionFormInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
      };
      const updated = await apiClient.put<Promotion>(
        `/promotions/${promotion.id}`,
        payload,
      );
      onUpdated(updated);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Erreur lors de la mise à jour",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Nom</label>
          <input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Slug</label>
          <input
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Date de début
          </label>
          <input
            type="datetime-local"
            value={form.startDate}
            onChange={(e) => update("startDate", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Date de fin</label>
          <input
            type="datetime-local"
            value={form.endDate}
            onChange={(e) => update("endDate", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => update("isActive", e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        Promotion active
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
        Enregistrer
      </button>
    </form>
  );
}

// ---------- Images ----------
function PromotionImages({
  promotion,
  onUpdated,
}: {
  promotion: Promotion;
  onUpdated: (p: Promotion) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("images", file));

    setIsUploading(true);
    try {
      const updated = await apiClient.post<Promotion>(
        `/promotions/${promotion.id}/images`,
        formData,
        { isFormData: true },
      );
      onUpdated(updated);
    } catch (err) {
      alert(
        err instanceof ApiError ? err.message : "Échec de l'envoi des images",
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(imageUrl: string) {
    if (!confirm("Supprimer cette image ?")) return;
    setDeletingUrl(imageUrl);
    try {
      const updated = await apiClient.delete<Promotion>(
        `/promotions/${promotion.id}/images`,
        {
          imageUrl,
        },
      );
      onUpdated(updated);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Échec de la suppression");
    } finally {
      setDeletingUrl(null);
    }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="mb-3 text-sm font-medium">Images</h2>
      <div className="flex flex-wrap gap-3">
        {promotion.images.map((url) => (
          <div
            key={url}
            className="group relative h-24 w-24 overflow-hidden rounded-md border border-gray-200"
          >
            <Image src={url} alt="" fill className="object-cover" />
            <button
              onClick={() => handleDelete(url)}
              disabled={deletingUrl === url}
              className="absolute right-1 top-1 rounded-full bg-white/90 p-1 opacity-0 transition group-hover:opacity-100 hover:bg-red-50"
            >
              {deletingUrl === url ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <X size={12} className="text-red-600" />
              )}
            </button>
          </div>
        ))}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600 disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Upload size={18} />
          )}
          <span className="text-xs">Ajouter</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          hidden
          onChange={handleUpload}
        />
      </div>
    </div>
  );
}

// ---------- Remises ----------
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

function PromotionDiscounts({
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

// ---------- Coupons ----------
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
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const created = await apiClient.post<CouponCode>(
        `/promotions/${promotionId}/coupons`,
        form,
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
          placeholder="Code (ex: SUMMER25)"
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

function PromotionCoupons({
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

// ---------- Page principale ----------
export default function EditPromotionPage() {
  const { promotionId } = useParams<{ promotionId: string }>();
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<Promotion>(`/promotions/${promotionId}`)
      .then(setPromotion)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Erreur de chargement",
        ),
      )
      .finally(() => setIsLoading(false));
  }, [promotionId]);

  if (isLoading)
    return <Loader2 size={20} className="animate-spin text-gray-400" />;
  if (error || !promotion) {
    return (
      <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
        {error ?? "Promotion introuvable."}
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/promotions"
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft size={14} /> Retour aux promotions
      </Link>
      <h1 className="mb-6 text-xl font-semibold">
        Modifier « {promotion.name} »
      </h1>

      <div className="space-y-10">
        <PromotionInfoForm promotion={promotion} onUpdated={setPromotion} />
        <PromotionImages promotion={promotion} onUpdated={setPromotion} />
        <PromotionDiscounts promotion={promotion} onUpdated={setPromotion} />
        <PromotionCoupons promotion={promotion} onUpdated={setPromotion} />
      </div>
    </div>
  );
}
