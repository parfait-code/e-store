// app/(account)/account/orders/[orderId]/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Package,
  Star,
  RotateCcw,
  X,
  Send,
  XCircle,
} from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { formatXAF, formatDate } from "@/lib/format";
import type {
  Order,
  OrderStatus,
  ReviewCreateInput,
  ReturnCreateInput,
} from "@/lib/types";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  PROCESSING: "En traitement",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
};

function ReviewForm({
  orderItemId,
  productId,
  onDone,
}: {
  orderItemId: string;
  productId: number;
  onDone: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const payload: ReviewCreateInput = {
        order_item_id: orderItemId,
        product_id: productId,
        rating,
        comment: comment || undefined,
      };
      await apiClient.post("/reviews", payload);
      onDone();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Erreur lors de l'envoi de l'avis",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-2 space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3"
    >
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)}>
            <Star
              size={18}
              className={
                n <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
              }
            />
          </button>
        ))}
      </div>
      <textarea
        rows={2}
        placeholder="Votre avis (optionnel)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-gray-900"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
      >
        {isSubmitting ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <Send size={12} />
        )}
        Envoyer l'avis
      </button>
    </form>
  );
}

function ReturnRequestForm({
  order,
  onClose,
  onCreated,
}: {
  order: Order;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [reason, setReason] = useState("");
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggleItem(itemId: string, maxQty: number) {
    setSelected((prev) => {
      const next = { ...prev };
      if (itemId in next) delete next[itemId];
      else next[itemId] = maxQty;
      return next;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const items = Object.entries(selected).map(([order_item_id, quantity]) => ({
      order_item_id,
      quantity,
    }));
    if (items.length === 0) {
      setError("Sélectionnez au moins un article à retourner.");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: ReturnCreateInput = { order_id: order.id, reason, items };
      await apiClient.post("/returns", payload);
      onCreated();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Erreur lors de la demande de retour",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Demander un retour</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}
          <div className="space-y-2">
            {order.items.map((item) => (
              <label key={item.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={item.id in selected}
                  onChange={() => toggleItem(item.id, item.quantity)}
                />
                {item.product.name} (qté {item.quantity})
              </label>
            ))}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Raison
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RotateCcw size={16} />
            )}
            Envoyer la demande
          </button>
        </form>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewingItemId, setReviewingItemId] = useState<string | null>(null);
  const [reviewedItemIds, setReviewedItemIds] = useState<string[]>([]);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

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

  const canReturn = order.status === "DELIVERED";

  async function handleCancelOrder() {
    if (!confirm("Annuler cette commande ? Cette action est irréversible."))
      return;
    setIsCancelling(true);
    try {
      await apiClient.delete(`/orders/${order!.id}`);
      setOrder((prev) => (prev ? { ...prev, status: "CANCELLED" } : prev));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Annulation impossible");
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <div>
      <Link
        href="/account/orders"
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

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
            {STATUS_LABELS[order.status]}
          </span>
          {["PENDING", "CONFIRMED"].includes(order.status) && (
            <button
              onClick={handleCancelOrder}
              disabled={isCancelling}
              className="flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {isCancelling ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <XCircle size={14} />
              )}
              Annuler la commande
            </button>
          )}
          {canReturn && (
            <button
              onClick={() => setShowReturnForm(true)}
              className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              <RotateCcw size={14} /> Demander un retour
            </button>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
          <Package size={16} /> Articles
        </h2>
        <div className="divide-y divide-gray-100">
          {order.items.map((item) => (
            <div key={item.id} className="py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{item.product.name}</p>
                  <p className="text-xs text-gray-500">Qté {item.quantity}</p>
                </div>
                <span className="text-sm">
                  {formatXAF(item.price * item.quantity)}
                </span>
              </div>

              {order.status === "DELIVERED" &&
                !reviewedItemIds.includes(item.id) &&
                (reviewingItemId === item.id ? (
                  <ReviewForm
                    orderItemId={item.id}
                    productId={item.productId}
                    onDone={() => {
                      setReviewedItemIds((prev) => [...prev, item.id]);
                      setReviewingItemId(null);
                    }}
                  />
                ) : (
                  <button
                    onClick={() => setReviewingItemId(item.id)}
                    className="mt-1 flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900"
                  >
                    <Star size={12} /> Laisser un avis
                  </button>
                ))}
              {reviewedItemIds.includes(item.id) && (
                <p className="mt-1 text-xs text-green-600">
                  Merci pour votre avis !
                </p>
              )}
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
      </div>

      {showReturnForm && (
        <ReturnRequestForm
          order={order}
          onClose={() => setShowReturnForm(false)}
          onCreated={() => {
            setShowReturnForm(false);
            alert("Votre demande de retour a été envoyée.");
          }}
        />
      )}
    </div>
  );
}
