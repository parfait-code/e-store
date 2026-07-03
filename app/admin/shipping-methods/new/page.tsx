// app/admin/shipping-methods/new/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import type { ShippingMethod, ShippingMethodFormInput } from "@/lib/types";

export default function NewShippingMethodPage() {
  const router = useRouter();
  const [form, setForm] = useState<ShippingMethodFormInput>({
    name: "",
    description: "",
    estimatedDays: 3,
    basePrice: 0,
    pricePerKg: 0,
    isActive: true,
    zones: [],
  });
  const [zonesInput, setZonesInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof ShippingMethodFormInput>(
    key: K,
    value: ShippingMethodFormInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const zones = zonesInput
      .split(",")
      .map((z) => z.trim().toUpperCase())
      .filter(Boolean);
    if (zones.length === 0) {
      setError("Renseignez au moins une zone (code pays 2 lettres).");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await apiClient.post<ShippingMethod>(
        "/shipping-methods",
        { ...form, zones },
      );
      router.push(`/admin/shipping-methods`);
      // note: pas de route détail dédiée pour les méthodes de livraison,
      // la liste suffit (édition inline déjà supportée sur /admin/shipping-methods)
      void created;
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Erreur lors de la création",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/shipping-methods"
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft size={14} /> Retour aux méthodes de livraison
      </Link>
      <h1 className="mb-6 text-xl font-semibold">
        Nouvelle méthode de livraison
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Nom</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Délai estimé (jours)
            </label>
            <input
              type="number"
              required
              min={0}
              value={form.estimatedDays}
              onChange={(e) => update("estimatedDays", Number(e.target.value))}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Prix de base (XAF)
            </label>
            <input
              type="number"
              required
              min={0}
              value={form.basePrice}
              onChange={(e) => update("basePrice", Number(e.target.value))}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Prix / kg (XAF)
            </label>
            <input
              type="number"
              min={0}
              value={form.pricePerKg}
              onChange={(e) => update("pricePerKg", Number(e.target.value))}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Zones desservies (codes pays 2 lettres, séparés par virgule)
          </label>
          <input
            type="text"
            required
            placeholder="CM, GA, CI"
            value={zonesInput}
            onChange={(e) => setZonesInput(e.target.value)}
            className={inputClass}
          />
        </div>

        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => update("isActive", e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          Méthode active
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
          Créer la méthode
        </button>
      </form>
    </div>
  );
}
