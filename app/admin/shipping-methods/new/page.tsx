// app/admin/shipping-methods/new/page.tsx
"use client";

import { Suspense, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import type { Shipment, ShipmentFormInput } from "@/lib/types";

function NewShipmentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderIdFromQuery = searchParams.get("orderId") ?? "";

  const [form, setForm] = useState<ShipmentFormInput>({
    sender_name: "",
    sender_address: "",
    recipient_name: "",
    recipient_address: "",
    weight: 1,
    order_id: orderIdFromQuery || undefined,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof ShipmentFormInput>(
    key: K,
    value: ShipmentFormInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const created = await apiClient.post<Shipment>("/shipments", form);
      router.push(`/admin/shipments/${created.id}`);
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
        href="/admin/shipments"
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft size={14} /> Retour aux expéditions
      </Link>
      <h1 className="mb-6 text-xl font-semibold">Nouvelle expédition</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {form.order_id && (
          <p className="text-sm text-gray-500">
            Rattachée à la commande{" "}
            <span className="font-medium">#{form.order_id.slice(0, 8)}</span>
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Nom expéditeur
            </label>
            <input
              type="text"
              required
              value={form.sender_name}
              onChange={(e) => update("sender_name", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Nom destinataire
            </label>
            <input
              type="text"
              required
              value={form.recipient_name}
              onChange={(e) => update("recipient_name", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Adresse expéditeur
            </label>
            <textarea
              required
              rows={2}
              value={form.sender_address}
              onChange={(e) => update("sender_address", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Adresse destinataire
            </label>
            <textarea
              required
              rows={2}
              value={form.recipient_address}
              onChange={(e) => update("recipient_address", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Poids (kg)</label>
            <input
              type="number"
              required
              min={0}
              step="0.01"
              value={form.weight}
              onChange={(e) => update("weight", Number(e.target.value))}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Livraison estimée
            </label>
            <input
              type="date"
              value={form.estimated_delivery_at ?? ""}
              onChange={(e) => update("estimated_delivery_at", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

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
          Créer l'expédition
        </button>
      </form>
    </div>
  );
}

export default function NewShipmentPage() {
  return (
    <Suspense
      fallback={<Loader2 size={20} className="animate-spin text-gray-400" />}
    >
      <NewShipmentForm />
    </Suspense>
  );
}
