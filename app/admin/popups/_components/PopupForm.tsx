// app/admin/popups/_components/PopupForm.tsx
"use client";

import { useState, FormEvent, useEffect } from "react";
import { Loader2, Save, X, Search } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import type {
  Popup,
  PopupFormInput,
  PopupTargetType,
  PopupDisplayFrequency,
  PopupAudience,
  Product,
  Paginated,
} from "@/lib/types";
import { useCreatePopup, useUpdatePopup } from "@/lib/queries/admin/usePopups";
import { useAdminPromotions } from "@/lib/queries/admin/usePromotions";
import { useAdminCategoriesList } from "@/lib/queries/admin/useCategories";

import { StagedImagesManager } from "@/components/admin/StagedImagesManager";
import {
  useUploadPopupImage,
  useDeletePopupImage,
} from "@/lib/queries/admin/usePopups";

export function PopupImageUploader({ popup }: { popup: Popup }) {
  const { mutateAsync: uploadImage } = useUploadPopupImage(popup.id);
  const { mutateAsync: deleteImage } = useDeletePopupImage(popup.id);

  return (
    <div className="max-w-2xl">
      <h2 className="mb-3 text-sm font-medium">Image</h2>
      <StagedImagesManager
        existingImages={
          popup.imageUrl ? [{ key: "image", url: popup.imageUrl }] : []
        }
        deleteOne={async () => {
          await deleteImage();
        }}
        uploadOne={async (file) => {
          await uploadImage(file);
        }}
        maxTotal={1}
        addLabel="Ajouter"
        helpText="JPEG, PNG, WEBP ou GIF · 5 Mo max."
      />
    </div>
  );
}

const TARGET_LABELS: Record<PopupTargetType, string> = {
  PROMOTION: "Promotion",
  CATEGORY: "Catégorie",
  PRODUCT: "Produit",
  INFO: "Information (sans lien)",
  EXTERNAL_LINK: "Lien externe",
};

const FREQUENCY_LABELS: Record<PopupDisplayFrequency, string> = {
  ONCE_PER_SESSION: "Une fois par session",
  ONCE_PER_DAY: "Une fois par jour",
  ONCE_EVER: "Une seule fois (à vie)",
  ALWAYS: "À chaque visite",
};

const AUDIENCE_LABELS: Record<PopupAudience, string> = {
  ALL: "Tous les visiteurs",
  GUEST_ONLY: "Visiteurs non connectés uniquement",
  AUTHENTICATED_ONLY: "Utilisateurs connectés uniquement",
};

function toDateTimeLocal(iso: string | null | undefined) {
  return iso ? iso.slice(0, 16) : "";
}

function ProductTargetPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string, label?: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      setIsSearching(true);
      apiClient
        .get<Paginated<Product>>(
          `/product?search=${encodeURIComponent(query.trim())}&limit=8`,
        )
        .then((res) => setResults(res.items ?? []))
        .catch(() => setResults([]))
        .finally(() => setIsSearching(false));
    }, 350);
    return () => clearTimeout(timeout);
  }, [query]);

  if (value) {
    return (
      <div className="flex items-center justify-between rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm">
        <span>{selectedLabel ?? `Produit #${value.slice(0, 8)}`}</span>
        <button
          type="button"
          onClick={() => {
            onChange("");
            setSelectedLabel(null);
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          placeholder="Rechercher un produit (nom, SKU)..."
          className="w-full rounded-md border border-gray-300 py-2 pl-8 pr-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
        />
      </div>
      {isOpen && query.trim() && (
        <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
          {isSearching ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 size={14} className="animate-spin text-gray-400" />
            </div>
          ) : results.length === 0 ? (
            <p className="px-3 py-2 text-xs text-gray-400">
              Aucun produit trouvé.
            </p>
          ) : (
            results.map((p) => (
              <button
                key={p.id}
                type="button"
                onMouseDown={() => {
                  onChange(p.id, p.name);
                  setSelectedLabel(p.name);
                  setQuery("");
                  setIsOpen(false);
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                <span>{p.name}</span>
                <span className="text-xs text-gray-400">{p.sku}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function PopupForm({
  initialPopup,
  onSuccess,
}: {
  initialPopup?: Popup;
  onSuccess: (popup: Popup) => void;
}) {
  const isEditing = Boolean(initialPopup);
  const [form, setForm] = useState<Omit<PopupFormInput, "imageUrl">>({
    title: initialPopup?.title ?? "",
    message: initialPopup?.message ?? "",
    isActive: initialPopup?.isActive ?? true,
    startDate: toDateTimeLocal(initialPopup?.startDate),
    endDate: toDateTimeLocal(initialPopup?.endDate),
    targetType: initialPopup?.targetType ?? "INFO",
    targetId: initialPopup?.targetId ?? "",
    externalUrl: initialPopup?.externalUrl ?? "",
    ctaLabel: initialPopup?.ctaLabel ?? "",
    displayFrequency: initialPopup?.displayFrequency ?? "ONCE_PER_SESSION",
    audience: initialPopup?.audience ?? "ALL",
    priority: initialPopup?.priority ?? 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: promotionsData } = useAdminPromotions({});
  const promotions = promotionsData?.items ?? [];
  const { data: categories = [] } = useAdminCategoriesList(true);

  const { mutate: createPopup } = useCreatePopup();
  const { mutate: updatePopup } = useUpdatePopup(initialPopup?.id ?? "");

  function update<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function changeTargetType(next: PopupTargetType) {
    setForm((prev) => ({
      ...prev,
      targetType: next,
      targetId: "",
      externalUrl: "",
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (
      ["PROMOTION", "CATEGORY", "PRODUCT"].includes(form.targetType) &&
      !form.targetId
    ) {
      setError("Sélectionnez une cible pour ce type de popup.");
      return;
    }
    if (form.targetType === "EXTERNAL_LINK" && !form.externalUrl) {
      setError("Renseignez l'URL externe.");
      return;
    }

    const payload: PopupFormInput = {
      ...form,
      startDate: form.startDate
        ? new Date(form.startDate).toISOString()
        : undefined,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
      message: form.message || undefined,
      ctaLabel: form.ctaLabel || undefined,
      targetId: form.targetId || undefined,
      externalUrl: form.externalUrl || undefined,
    };

    setIsSubmitting(true);
    const onError = (err: unknown) =>
      setError(
        err instanceof ApiError ? err.message : "Une erreur est survenue.",
      );
    const onDone = (popup: Popup) => {
      setIsSubmitting(false);
      onSuccess(popup);
    };

    if (isEditing) {
      updatePopup(payload, {
        onSuccess: onDone,
        onError: (err) => {
          setIsSubmitting(false);
          onError(err);
        },
      });
    } else {
      createPopup(payload, {
        onSuccess: onDone,
        onError: (err) => {
          setIsSubmitting(false);
          onError(err);
        },
      });
    }
  }

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">Titre</label>
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Message (optionnel)
        </label>
        <textarea
          rows={3}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Date de début (optionnel)
          </label>
          <input
            type="datetime-local"
            value={form.startDate}
            onChange={(e) => update("startDate", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            Date de fin (optionnel)
          </label>
          <input
            type="datetime-local"
            value={form.endDate}
            onChange={(e) => update("endDate", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Type de cible</label>
        <select
          value={form.targetType}
          onChange={(e) => changeTargetType(e.target.value as PopupTargetType)}
          className={inputClass}
        >
          {Object.entries(TARGET_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {form.targetType === "PROMOTION" && (
        <div>
          <label className="mb-1 block text-sm font-medium">Promotion</label>
          <select
            value={form.targetId}
            onChange={(e) => update("targetId", e.target.value)}
            className={inputClass}
          >
            <option value="">Sélectionner...</option>
            {promotions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {form.targetType === "CATEGORY" && (
        <div>
          <label className="mb-1 block text-sm font-medium">Catégorie</label>
          <select
            value={form.targetId}
            onChange={(e) => update("targetId", e.target.value)}
            className={inputClass}
          >
            <option value="">Sélectionner...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {form.targetType === "PRODUCT" && (
        <div>
          <label className="mb-1 block text-sm font-medium">Produit</label>
          <ProductTargetPicker
            value={form.targetId ?? ""}
            onChange={(id) => update("targetId", id)}
          />
        </div>
      )}

      {form.targetType === "EXTERNAL_LINK" && (
        <div>
          <label className="mb-1 block text-sm font-medium">URL externe</label>
          <input
            type="text"
            value={form.externalUrl}
            onChange={(e) => update("externalUrl", e.target.value)}
            className={inputClass}
            placeholder="https://..."
          />
        </div>
      )}

      {form.targetType !== "INFO" && (
        <div>
          <label className="mb-1 block text-sm font-medium">
            Libellé du bouton (optionnel)
          </label>
          <input
            type="text"
            value={form.ctaLabel}
            onChange={(e) => update("ctaLabel", e.target.value)}
            className={inputClass}
            placeholder="Ex: Découvrir"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Fréquence</label>
          <select
            value={form.displayFrequency}
            onChange={(e) =>
              update(
                "displayFrequency",
                e.target.value as PopupDisplayFrequency,
              )
            }
            className={inputClass}
          >
            {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Priorité</label>
          <input
            type="number"
            min={0}
            value={form.priority}
            onChange={(e) => update("priority", Number(e.target.value))}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Audience cible</label>
        <select
          value={form.audience}
          onChange={(e) => update("audience", e.target.value as PopupAudience)}
          className={inputClass}
        >
          {Object.entries(AUDIENCE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {form.audience !== "ALL" && (
          <p className="mt-1 text-xs text-gray-400">
            {form.audience === "GUEST_ONLY"
              ? "Ce popup ne sera jamais montré à un utilisateur déjà connecté."
              : "Ce popup ne sera montré qu'aux utilisateurs connectés."}
          </p>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => update("isActive", e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        Popup actif
      </label>

      {!isEditing && (
        <p className="text-xs text-gray-400">
          L'image se gère une fois le popup créé.
        </p>
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
        {isEditing ? "Enregistrer les modifications" : "Créer le popup"}
      </button>
    </form>
  );
}
