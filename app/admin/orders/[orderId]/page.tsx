// app/admin/orders/[orderId]/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Package,
  Truck,
  CreditCard,
  History,
  Save,
} from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { formatXAF, formatDate } from "@/lib/format";
import type { Order, OrderStatus, OrderStatusUpdateInput } from "@/lib/types";

const STATUS_OPTIONS: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-gray-100 text-gray-600",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-amber-100 text-amber-700",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  PROCESSING: "En traitement",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
};

function StatusUpdateForm({
  order,
  onSuccess,
}: {
  order: Order;
  onSuccess: (order: Order) => void;
}) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [reason, setReason] = useState("");
  const [shippingCarrier, setShippingCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const payload: OrderStatusUpdateInput = {
        status,
        reason: reason || undefined,
        shippingCarrier: shippingCarrier || undefined,
        trackingNumber: trackingNumber || undefined,
        estimatedDeliveryDate: estimatedDeliveryDate || undefined,
      };
      const updated = await apiClient.put<Order>(
        `/orders/${order.id}/status`,
        payload,
      );
      onSuccess(updated);
      setReason("");
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
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-lg border border-gray-200 bg-white p-4"
    >
      <h2 className="text-sm font-medium">Changer le statut</h2>
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Nouveau statut
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          className={inputClass}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Raison (optionnel)
        </label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className={inputClass}
        />
      </div>

      {status === "SHIPPED" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Transporteur
            </label>
            <input
              type="text"
              value={shippingCarrier}
              onChange={(e) => setShippingCarrier(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              N° de suivi
            </label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Livraison estimée
            </label>
            <input
              type="date"
              value={estimatedDeliveryDate}
              onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || status === order.status}
        className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {isSubmitting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Save size={16} />
        )}
        Mettre à jour
      </button>
    </form>
  );
}

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<Order>(`/orders/${orderId}`)
      .then(setOrder)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Erreur de chargement",
        ),
      )
      .finally(() => setIsLoading(false));
  }, [orderId]);

  if (isLoading)
    return <Loader2 size={20} className="animate-spin text-gray-400" />;
  if (error || !order) {
    return (
      <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
        {error ?? "Commande introuvable."}
      </div>
    );
  }

  const shipping = order.shippingAddressSnapshot as {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin/orders"
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft size={14} /> Retour aux commandes
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            Commande #{order.id.slice(0, 8)}
          </h1>
          <p className="text-sm text-gray-500">
            Passée le {formatDate(order.createdAt)}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_STYLES[order.status]}`}
        >
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Articles */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Package size={16} /> Articles ({order.items.length})
            </h2>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{item.product.name}</p>
                    <p className="text-xs text-gray-500">
                      SKU {item.product.sku} · Qté {item.quantity}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p>{formatXAF(item.price * item.quantity)}</p>
                    {item.discountAmount > 0 && (
                      <p className="text-xs text-green-600">
                        -{formatXAF(item.discountAmount)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-end border-t border-gray-100 pt-3 text-sm">
              <div className="text-right">
                <p className="text-gray-500">
                  Sous-total : {formatXAF(order.totalAmount)}
                </p>
                {order.discountedAmount !== null && (
                  <p className="font-semibold">
                    Total : {formatXAF(order.discountedAmount)}
                  </p>
                )}
              </div>
            </div>
            {order.appliedCoupon && (
              <p className="mt-2 text-xs text-gray-500">
                Coupon appliqué :{" "}
                <span className="font-medium">{order.appliedCoupon.code}</span>{" "}
                ({order.appliedCoupon.promotion.name})
              </p>
            )}
          </div>

          {/* Paiements */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
              <CreditCard size={16} /> Paiements
            </h2>
            {order.payments.length === 0 ? (
              <p className="text-sm text-gray-400">
                Aucun paiement enregistré.
              </p>
            ) : (
              <div className="space-y-2">
                {order.payments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>
                      {p.method} · {formatDate(p.createdAt)}
                    </span>
                    <span className="font-medium">
                      {formatXAF(p.amount)} — {p.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historique des statuts */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
              <History size={16} /> Historique
            </h2>
            <div className="space-y-2">
              {order.statusHistory
                .slice()
                .reverse()
                .map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>
                      {h.fromStatus ? `${STATUS_LABELS[h.fromStatus]} → ` : ""}
                      {STATUS_LABELS[h.toStatus]}
                      {h.reason && (
                        <span className="text-gray-400"> · {h.reason}</span>
                      )}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(h.createdAt)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Livraison */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Truck size={16} /> Livraison
            </h2>
            <p className="text-sm text-gray-600">
              {shipping.street}
              <br />
              {shipping.postalCode} {shipping.city}
              {shipping.state ? `, ${shipping.state}` : ""}
              <br />
              {shipping.country}
            </p>
            {order.shippingMethod && (
              <p className="mt-2 text-xs text-gray-500">
                {order.shippingMethod.name} ·{" "}
                {order.shippingMethod.estimatedDays} jours
              </p>
            )}
            <Link
              href={`/admin/shipments/new?orderId=${order.id}`}
              className="mt-3 inline-block text-xs font-medium text-gray-900 hover:underline"
            >
              Créer une expédition pour cette commande →
            </Link>
          </div>

          <StatusUpdateForm order={order} onSuccess={setOrder} />
        </div>
      </div>
    </div>
  );
}
