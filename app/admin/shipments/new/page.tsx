// app/admin/shipments/new/page.tsx
"use client";

import { Suspense, useEffect, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import type {
  Shipment,
  ShipmentFormInput,
  Order,
  User,
  Product,
} from "@/lib/types";

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
  const [useDimensions, setUseDimensions] = useState(false);
  const [dimensions, setDimensions] = useState({
    length: 0,
    width: 0,
    height: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPrefilling, setIsPrefilling] = useState(Boolean(orderIdFromQuery));

  // Préremplit destinataire + poids à partir de la commande liée.
  useEffect(() => {
    if (!orderIdFromQuery) return;
    setIsPrefilling(true);

    apiClient
      .get<Order>(`/orders/${orderIdFromQuery}`)
      .then(async (order) => {
        const snapshot = order.shippingAddressSnapshot as {
          street?: string;
          city?: string;
          state?: string;
          country?: string;
          postalCode?: string;
        };
        const addressParts = [
          snapshot.street,
          [snapshot.postalCode, snapshot.city].filter(Boolean).join(" "),
          snapshot.state,
          snapshot.country,
        ].filter(Boolean);

        const [user, products] = await Promise.all([
          apiClient.get<User>(`/user/${order.userId}`).catch(() => null),
          Promise.all(
            order.items.map((item) =>
              apiClient
                .get<Product>(`/product/${item.productId}`)
                .then((p) => ({
                  weight: p.weight ?? 0,
                  quantity: item.quantity,
                }))
                .catch(() => ({ weight: 0, quantity: item.quantity })),
            ),
          ),
        ]);

        const totalWeight = products.reduce(
          (sum, p) => sum + p.weight * p.quantity,
          0,
        );

        setForm((prev) => ({
          ...prev,
          recipient_name: user
            ? `${user.firstName} ${user.lastName}`
            : prev.recipient_name,
          recipient_address:
            addressParts.length > 0
              ? addressParts.join(", ")
              : prev.recipient_address,
          weight:
            totalWeight > 0 ? Number(totalWeight.toFixed(2)) : prev.weight,
        }));
      })
      .catch(() => {
        // Non bloquant — l'admin remplit manuellement si la commande est introuvable
      })
      .finally(() => setIsPrefilling(false));
  }, [orderIdFromQuery]);

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
      const payload = {
        ...form,
        dimensions: useDimensions ? dimensions : undefined,
        // <input type="date"> renvoie "YYYY-MM-DD" — le backend attend un ISO
        // datetime complet, sinon 400 "Invalid ISO datetime".
        estimated_delivery_at: form.estimated_delivery_at
          ? new Date(form.estimated_delivery_at).toISOString()
          : undefined,
      };
      const created = await apiClient.post<Shipment>("/shipments", payload);
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
          <p className="flex items-center gap-2 text-sm text-gray-500">
            Rattachée à la commande{" "}
            <span className="font-medium">#{form.order_id.slice(0, 8)}</span>
            {isPrefilling && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Loader2 size={12} className="animate-spin" /> Préremplissage...
              </span>
            )}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Nom expéditeur <span className="text-red-500">*</span>
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
              Nom destinataire <span className="text-red-500">*</span>
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
              Adresse expéditeur <span className="text-red-500">*</span>
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
              Adresse destinataire <span className="text-red-500">*</span>
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
            <label className="mb-1 block text-sm font-medium">
              Poids (kg) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min={0}
              step="0.01"
              value={form.weight}
              onChange={(e) => update("weight", Number(e.target.value))}
              className={inputClass}
            />
            {form.order_id && (
              <p className="mt-1 text-xs text-gray-400">
                Calculé automatiquement à partir des produits de la commande —
                modifiable si besoin.
              </p>
            )}
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

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={useDimensions}
              onChange={(e) => setUseDimensions(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            Renseigner les dimensions du colis (optionnel)
          </label>
          {useDimensions && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Longueur (cm)
                </label>
                <input
                  type="number"
                  min={0}
                  value={dimensions.length}
                  onChange={(e) =>
                    setDimensions((d) => ({
                      ...d,
                      length: Number(e.target.value),
                    }))
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Largeur (cm)
                </label>
                <input
                  type="number"
                  min={0}
                  value={dimensions.width}
                  onChange={(e) =>
                    setDimensions((d) => ({
                      ...d,
                      width: Number(e.target.value),
                    }))
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Hauteur (cm)
                </label>
                <input
                  type="number"
                  min={0}
                  value={dimensions.height}
                  onChange={(e) =>
                    setDimensions((d) => ({
                      ...d,
                      height: Number(e.target.value),
                    }))
                  }
                  className={inputClass}
                />
              </div>
            </div>
          )}
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
