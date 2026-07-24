// components/ProductFilters.tsx
"use client";

import { useState } from "react"; // useEffect retiré
import { SlidersHorizontal, X } from "lucide-react";
import { useShopTags } from "@/lib/queries/shop/useTags";
import type { ProductSortOption } from "@/lib/types";

export interface ProductFiltersValue {
  minPrice?: number;
  maxPrice?: number;
  tags: string[];
  sort: ProductSortOption;
}

const SORT_OPTIONS: { value: ProductSortOption; label: string }[] = [
  { value: "newest", label: "Plus récents" },
  { value: "oldest", label: "Plus anciens" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "name_asc", label: "Nom A→Z" },
  { value: "name_desc", label: "Nom Z→A" },
];

function TagsSkeleton() {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-7 w-16 animate-pulse rounded-full bg-gray-100"
        />
      ))}
    </div>
  );
}

export function ProductFilters({
  value,
  onChange,
}: {
  value: ProductFiltersValue;
  onChange: (next: ProductFiltersValue) => void;
}) {
  const { data: tags = [], isLoading: isLoadingTags } = useShopTags();
  const [minInput, setMinInput] = useState(value.minPrice?.toString() ?? "");
  const [maxInput, setMaxInput] = useState(value.maxPrice?.toString() ?? "");

  // Resynchronise les champs texte quand `value` change depuis l'extérieur
  // (ex: réinitialisation), ajusté pendant le rendu plutôt que via un effet.
  const [prevMin, setPrevMin] = useState(value.minPrice);
  const [prevMax, setPrevMax] = useState(value.maxPrice);
  if (value.minPrice !== prevMin || value.maxPrice !== prevMax) {
    setPrevMin(value.minPrice);
    setPrevMax(value.maxPrice);
    setMinInput(value.minPrice?.toString() ?? "");
    setMaxInput(value.maxPrice?.toString() ?? "");
  }

  function toggleTag(slug: string) {
    const next = value.tags.includes(slug)
      ? value.tags.filter((t) => t !== slug)
      : [...value.tags, slug];
    onChange({ ...value, tags: next });
  }

  function applyPriceRange() {
    onChange({
      ...value,
      minPrice: minInput ? Number(minInput) : undefined,
      maxPrice: maxInput ? Number(maxInput) : undefined,
    });
  }

  const hasActiveFilters =
    value.minPrice !== undefined ||
    value.maxPrice !== undefined ||
    value.tags.length > 0;

  function resetAll() {
    setMinInput("");
    setMaxInput("");
    onChange({ tags: [], sort: value.sort });
  }

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-medium">
          <SlidersHorizontal size={14} /> Filtres
        </h2>
        {hasActiveFilters && (
          <button
            onClick={resetAll}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900"
          >
            <X size={12} /> Réinitialiser
          </button>
        )}
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Trier par
        </label>
        <select
          value={value.sort}
          onChange={(e) =>
            onChange({ ...value, sort: e.target.value as ProductSortOption })
          }
          className={inputClass}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Prix (XAF)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={minInput}
            onChange={(e) => setMinInput(e.target.value)}
            onBlur={applyPriceRange}
            className={inputClass}
          />
          <span className="text-gray-400">–</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={maxInput}
            onChange={(e) => setMaxInput(e.target.value)}
            onBlur={applyPriceRange}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Tags
        </label>
        {isLoadingTags ? (
          <TagsSkeleton />
        ) : tags.length === 0 ? (
          <p className="text-xs text-gray-400">Aucun tag disponible.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const active = value.tags.includes(tag.slug);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.slug)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    active
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
