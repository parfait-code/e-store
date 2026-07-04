// app/admin/orders/[orderId]/page.tsx
"use client";

import { useEffect, useState, FormEvent, useCallback } from "react";
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
  ExternalLink,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { formatXAF, formatDate } from "@/lib/format";
import type {
  Order,
  OrderStatus,
  OrderStatusUpdateInput,
  Shipment,
} from "@/lib/types";

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

const SHIPMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  IN_TRANSIT: "En transit",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

// Convertit un ISO datetime en "YYYY-MM-DD" pour <input type="date">
function toDateInputValue(iso: string | null | undefined) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function StatusUpdateForm({
  order,
  linkedShipment,
  isLoadingShipment,
  onSuccess,
}: {
  order: Order;
  linkedShipment: Shipment | null;
  isLoadingShipment: boolean;
  onSuccess: (order: Order) => void;
}) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [reason, setReason] = useState("");
  const [shippingCarrier, setShippingCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pré-remplissage automatique quand on sélectionne "SHIPPED" et qu'une
  // expédition liée existe déjà — évite de ressaisir des infos déjà connues.
  useEffect(() => {
    if (status !== "SHIPPED" || !linkedShipment) return;
    setTrackingNumber((prev) => prev || linkedShipment.trackingNumber || "");
    setEstimatedDeliveryDate(
      (prev) => prev || toDateInputValue(linkedShipment.estimatedDeliveryDate),
    );
  }, [status, linkedShipment]);

  // --- Garde-fous métier ---
  const wantsShipped = status === "SHIPPED";
  const wantsDelivered = status === "DELIVERED";

  const shipmentMissing = !isLoadingShipment && !linkedShipment;
  const shipmentNotDelivered =
    !isLoadingShipment &&
    linkedShipment !== null &&
    linkedShipment.status !== "DELIVERED";

  const blockedForShipped = wantsShipped && shipmentMissing;
  const blockedForDelivered =
    wantsDelivered && (shipmentMissing || shipmentNotDelivered);

  const isBlocked = blockedForShipped || blockedForDelivered;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (isBlocked) return; // sécurité supplémentaire, le bouton est déjà désactivé
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

      {/* --- Bloc SHIPPED --- */}
      {wantsShipped && (
        <>
          {isLoadingShipment ? (
            <p className="flex items-center gap-1.5 text-xs text-gray-400">
              <Loader2 size={12} className="animate-spin" />
              Vérification de l'expédition liée...
            </p>
          ) : shipmentMissing ? (
            <div className="flex items-start gap-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span>
                Aucune expédition n'existe pour cette commande. Créez-en une
                d'abord pour pouvoir renseigner transporteur, n° de suivi et
                livraison estimée.{" "}
                <Link
                  href={`/admin/shipments/new?orderId=${order.id}`}
                  className="font-medium underline"
                >
                  Créer une expédition →
                </Link>
              </span>
            </div>
          ) : (
            <p className="text-xs text-green-600">
              Informations pré-remplies depuis l'expédition liée{" "}
              {linkedShipment?.trackingNumber
                ? `(${linkedShipment.trackingNumber})`
                : ""}
              — vous pouvez les ajuster si besoin.
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Transporteur
              </label>
              <input
                type="text"
                value={shippingCarrier}
                onChange={(e) => setShippingCarrier(e.target.value)}
                disabled={shipmentMissing}
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
                disabled={shipmentMissing}
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
                disabled={shipmentMissing}
                className={inputClass}
              />
            </div>
          </div>
        </>
      )}

      {/* --- Bloc DELIVERED --- */}
      {wantsDelivered && (
        <>
          {isLoadingShipment ? (
            <p className="flex items-center gap-1.5 text-xs text-gray-400">
              <Loader2 size={12} className="animate-spin" />
              Vérification du statut de l'expédition...
            </p>
          ) : shipmentMissing ? (
            <div className="flex items-start gap-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span>
                Aucune expédition trouvée pour cette commande. Créez et livrez
                l'expédition avant de marquer la commande comme livrée.{" "}
                <Link
                  href={`/admin/shipments/new?orderId=${order.id}`}
                  className="font-medium underline"
                >
                  Créer une expédition →
                </Link>
              </span>
            </div>
          ) : shipmentNotDelivered ? (
            <div className="flex items-start gap-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span>
                L'expédition liée est actuellement «{" "}
                {SHIPMENT_STATUS_LABELS[linkedShipment!.status] ??
                  linkedShipment!.status}{" "}
                ». Passez-la d'abord à « Livrée » avant de marquer la commande
                comme livrée.{" "}
                <Link
                  href={`/admin/shipments/${linkedShipment!.id}`}
                  className="font-medium underline"
                >
                  Voir l'expédition →
                </Link>
              </span>
            </div>
          ) : (
            <p className="text-xs text-green-600">
              L'expédition liée est bien marquée « Livrée » — vous pouvez
              confirmer.
            </p>
          )}
        </>
      )}

      <button
        type="submit"
        disabled={isSubmitting || status === order.status || isBlocked}
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

function LinkedShipmentCard({
  shipment,
  isLoading,
  orderId,
  onRefresh,
}: {
  shipment: Shipment | null;
  isLoading: boolean;
  orderId: string;
  onRefresh: () => void;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-medium">
          <Truck size={16} /> Expédition liée
        </h2>
        <button
          onClick={onRefresh}
          className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
          title="Rafraîchir"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {isLoading ? (
        <Loader2 size={16} className="animate-spin text-gray-400" />
      ) : !shipment ? (
        <>
          <p className="mb-3 text-sm text-gray-400">
            Aucune expédition créée pour cette commande.
          </p>
          <Link
            href={`/admin/shipments/new?orderId=${orderId}`}
            className="text-xs font-medium text-gray-900 hover:underline"
          >
            Créer une expédition →
          </Link>
        </>
      ) : (
        <div className="text-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-medium">
              {shipment.trackingNumber ?? `#${shipment.id.slice(0, 8)}`}
            </span>
            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
              {SHIPMENT_STATUS_LABELS[shipment.status] ?? shipment.status}
            </span>
          </div>
          <p className="mb-3 text-xs text-gray-400">
            Rappel : le statut de l'expédition n'est pas synchronisé
            automatiquement avec celui de la commande — c'est pourquoi le
            passage de la commande à « Expédiée »/« Livrée » vérifie cet état
            ci-contre.
          </p>
          <Link
            href={`/admin/shipments/${shipment.id}`}
            className="flex items-center gap-1 text-xs font-medium text-gray-900 hover:underline"
          >
            Voir le détail <ExternalLink size={12} />
          </Link>
        </div>
      )}
    </div>
  );
}

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [linkedShipment, setLinkedShipment] = useState<Shipment | null>(null);
  const [isLoadingShipment, setIsLoadingShipment] = useState(true);

  const fetchShipment = useCallback(() => {
    setIsLoadingShipment(true);
    apiClient
      .get<Shipment | null>(`/orders/${orderId}/shipment`)
      .then(setLinkedShipment)
      .catch(() => setLinkedShipment(null)) // pas d'expédition = non bloquant
      .finally(() => setIsLoadingShipment(false));
  }, [orderId]);

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

  useEffect(() => {
    fetchShipment();
  }, [fetchShipment]);

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
              <Package size={16} /> Articles ({order?.items?.length})
            </h2>
            <div className="divide-y divide-gray-100">
              {order?.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{item.product.name}</p>
                    <p className="text-xs text-gray-500">
                      SKU {item.combination?.sku ?? item.product.sku} · Qté{" "}
                      {item.quantity}
                    </p>
                    {item.combinationSnapshot && (
                      <p className="mt-0.5 text-xs text-gray-400">
                        {Object.entries(item.combinationSnapshot)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(" · ")}
                      </p>
                    )}
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
                  Sous-total : {formatXAF(order?.totalAmount)}
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
            {order?.payments?.length === 0 ? (
              <p className="text-sm text-gray-400">
                Aucun paiement enregistré.
              </p>
            ) : (
              <div className="space-y-2">
                {order?.payments?.map((p) => (
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
              {order?.statusHistory
                ?.slice()
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
              <Truck size={16} /> Adresse de livraison
            </h2>
            <p className="text-sm text-gray-600">
              {shipping?.street}
              <br />
              {shipping?.postalCode} {shipping?.city}
              {shipping?.state ? `, ${shipping?.state}` : ""}
              <br />
              {shipping?.country}
            </p>
            {order.shippingMethod && (
              <p className="mt-2 text-xs text-gray-500">
                {order.shippingMethod.name} ·{" "}
                {order.shippingMethod.estimatedDays} jours
              </p>
            )}
          </div>

          <LinkedShipmentCard
            shipment={linkedShipment}
            isLoading={isLoadingShipment}
            orderId={order.id}
            onRefresh={fetchShipment}
          />

          <StatusUpdateForm
            order={order}
            linkedShipment={linkedShipment}
            isLoadingShipment={isLoadingShipment}
            onSuccess={(updated) => {
              setOrder(updated);
              fetchShipment(); // au cas où le backend synchronise l'expédition
            }}
          />
        </div>
      </div>
    </div>
  );
}
