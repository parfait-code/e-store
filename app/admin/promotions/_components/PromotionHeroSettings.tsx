// app/admin/promotions/_components/PromotionHeroSettings.tsx
"use client";

import { useState } from "react";
import { Sparkles, Save, Loader2, Check } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import type { Promotion, PromotionHeroUpdateInput } from "@/lib/types";

export function PromotionHeroSettings({
  promotion,
  onUpdated,
}: {
  promotion: Promotion;
  onUpdated: (p: Promotion) => void;
}) {
  const [isFeatured, setIsFeatured] = useState(promotion.isFeaturedInHero);
  const [position, setPosition] = useState(promotion.heroPosition ?? 0);
  const [selectedImages, setSelectedImages] = useState<string[]>(
    promotion.heroImages ?? [],
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggleImage(url: string) {
    setSelectedImages((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url],
    );
    setSaved(false);
  }

  async function handleSave() {
    setError(null);
    setSaved(false);

    if (isFeatured && selectedImages.length === 0) {
      setError(
        "Sélectionnez au moins une image pour le carrousel avant d'activer la mise en avant.",
      );
      return;
    }

    setIsSaving(true);
    try {
      const payload: PromotionHeroUpdateInput = {
        isFeaturedInHero: isFeatured,
        heroPosition: isFeatured ? position : undefined,
        heroImages: selectedImages,
      };

      const updated = await apiClient.put<Promotion>(
        `/promotions/${promotion.id}`,
        payload,
      );
      onUpdated(updated);
      setSaved(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Erreur lors de l'enregistrement",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const images = Array.isArray(promotion.images) ? promotion.images : [];

  return (
    <div className="max-w-2xl">
      <h2 className="mb-1 flex items-center gap-2 text-sm font-medium">
        <Sparkles size={16} className="text-amber-500" />
        Carrousel de la page d'accueil
      </h2>
      <p className="mb-4 text-xs text-gray-400">
        Contrôle l'apparition de cette promotion dans le grand carrousel en haut
        de la page d'accueil. Les images du carrousel sont indépendantes des
        images de la fiche promotion — sélectionnez celles adaptées à un format
        large (bannière).
      </p>
      <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
        Format recommandé : <strong>1920 × 800 px</strong> (ratio 12:5). Le
        titre, la description et l'appel à l'action doivent être intégrés
        directement dans l'image — une image qui ne respecte pas ce ratio sera
        automatiquement recadrée à l'affichage.
      </p>

      {error && (
        <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}

      <label className="mb-4 flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={isFeatured}
          onChange={(e) => {
            setIsFeatured(e.target.checked);
            setSaved(false);
          }}
          className="h-4 w-4 rounded border-gray-300"
        />
        Mettre en avant dans le carrousel d'accueil
      </label>

      {isFeatured && (
        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Position d'affichage (les positions les plus basses passent en
            premier)
          </label>
          <input
            type="number"
            min={0}
            value={position}
            onChange={(e) => {
              setPosition(Number(e.target.value));
              setSaved(false);
            }}
            className="w-32 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
          />
        </div>
      )}

      <div className="mb-4">
        <p className="mb-2 text-xs font-medium text-gray-600">
          Images du carrousel ({selectedImages.length} sélectionnée(s))
        </p>
        {images.length === 0 ? (
          <p className="rounded-md border border-dashed border-gray-200 px-3 py-2 text-xs text-gray-400">
            Aucune image disponible — ajoutez d'abord des images à l'étape «
            Images » de cette promotion.
          </p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {images.map((url) => {
              const isSelected = selectedImages.includes(url);
              return (
                <button
                  key={url}
                  type="button"
                  onClick={() => toggleImage(url)}
                  className={`group relative h-20 w-32 overflow-hidden rounded-md border-2 ${
                    isSelected ? "border-gray-900" : "border-gray-200"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  {isSelected && (
                    <span className="absolute right-1 top-1 rounded-full bg-gray-900 p-1 text-white">
                      <Check size={10} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Enregistrer
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-xs text-green-600">
            <Check size={14} /> Enregistré
          </span>
        )}
      </div>
    </div>
  );
}
