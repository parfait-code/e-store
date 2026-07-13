// app/(account)/account/orders/[orderId]/page.tsx
"use client";

import { useState, FormEvent } from "react";
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
  Pencil,
  Trash2,
} from "lucide-react";
import { ApiError } from "@/lib/api-client";
import { formatXAF, formatDate } from "@/lib/format";
import type {
  Order,
  OrderStatus,
  ProductReview,
  ReturnCreateInput,
} from "@/lib/types";
import {
  useMyOrder,
  useOrderReturns,
  useCancelOrder,
  useCreateReturn,
  useCreateReview,
  useUpdateReview,
  useDeleteReview,
} from "@/lib/queries/shop/useOrders";

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
  existingReview,
  onDone,
  onCancel,
}: {
  orderItemId: string;
  productId: string;
  existingReview?: ProductReview;
  onDone: (review: ProductReview) => void;
  onCancel: () => void;
}) {
  const isEditing = Boolean(existingReview);
  const [rating, setRating] = useState(existingReview?.rating ?? 5);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [error, setError] = useState<string | null>(null);
  const { mutate: createReview, isPending: isCreating } = useCreateReview();
  const { mutate: updateReview, isPending: isUpdating } = useUpdateReview();
  const isSubmitting = isCreating || isUpdating;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (isEditing) {
      updateReview(
        {
          reviewId: existingReview!.id,
          payload: { rating, comment: comment || undefined },
        },
        {
          onSuccess: onDone,
          onError: (err) =>
            setError(
              err instanceof ApiError
                ? err.message
                : "Erreur lors de l'envoi de l'avis",
            ),
        },
      );
    } else {
      createReview(
        {
          order_item_id: orderItemId,
          product_id: productId,
          rating,
          comment: comment || undefined,
        },
        {
          onSuccess: onDone,
          onError: (err) =>
            setError(
              err instanceof ApiError
                ? err.message
                : "Erreur lors de l'envoi de l'avis",
            ),
        },
      );
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
      <div className="flex gap-2">
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
          {isEditing ? "Mettre à jour" : "Envoyer l'avis"}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600"
          >
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}

function ReturnRequestForm({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const { mutate: createReturn, isPending: isSubmitting } = useCreateReturn(
    order.id,
  );

  function toggleItem(itemId: string, maxQty: number) {
    setSelected((prev) => {
      const next = { ...prev };
      if (itemId in next) delete next[itemId];
      else next[itemId] = maxQty;
      return next;
    });
  }

  function handleSubmit(e: FormEvent) {
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
    const payload: ReturnCreateInput = { order_id: order.id, reason, items };
    createReturn(payload, {
      onSuccess: () => {
        onClose();
        alert("Votre demande de retour a été envoyée.");
      },
      onError: (err) =>
        setError(
          err instanceof ApiError
            ? err.message
            : "Erreur lors de la demande de retour",
        ),
    });
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
            {order.items.map((item) => {
              const productName =
                item.product?.name ?? item.productName ?? "Produit supprimé";
              return (
                <label
                  key={item.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={item.id in selected}
                    onChange={() => toggleItem(item.id, item.quantity)}
                  />
                  {productName} (qté {item.quantity})
                </label>
              );
            })}
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
  const { data: order, isLoading, isError } = useMyOrder(orderId);
  const { data: returns = [] } = useOrderReturns(orderId);
  const { mutate: cancelOrder, isPending: isCancelling } =
    useCancelOrder(orderId);
  const {
    mutate: deleteReview,
    isPending: isDeletingReview,
    variables: deletingReviewId,
  } = useDeleteReview();

  const [showReturnForm, setShowReturnForm] = useState(false);
  const [reviewingItemId, setReviewingItemId] = useState<string | null>(null);
  const [editingReviewItemId, setEditingReviewItemId] = useState<string | null>(
    null,
  );
  const [reviewsByItem, setReviewsByItem] = useState<
    Record<string, ProductReview>
  >({});

  function handleDeleteReview(itemId: string, reviewId: string) {
    if (!confirm("Supprimer cet avis ?")) return;
    deleteReview(reviewId, {
      onSuccess: () => {
        setReviewsByItem((prev) => {
          const next = { ...prev };
          delete next[itemId];
          return next;
        });
      },
      onError: (err) =>
        alert(err instanceof ApiError ? err.message : "Suppression impossible"),
    });
  }

  function handleCancelOrder() {
    if (!confirm("Annuler cette commande ? Cette action est irréversible."))
      return;
    cancelOrder(undefined, {
      onError: (err) =>
        alert(err instanceof ApiError ? err.message : "Annulation impossible"),
    });
  }

  if (isLoading)
    return <Loader2 size={20} className="animate-spin text-gray-400" />;
  if (isError || !order) {
    return (
      <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
        Commande introuvable.
      </div>
    );
  }

  const canReturn = order.status === "DELIVERED";

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
          {["PENDING", "CONFIRMED", "PROCESSING"].includes(order.status) && (
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
          {order.items.map((item) => {
            const productName =
              item.product?.name ?? item.productName ?? "Produit supprimé";
            return (
              <div key={item.id} className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{productName}</p>
                    <p className="text-xs text-gray-500">Qté {item.quantity}</p>
                  </div>
                  <span className="text-sm">
                    {formatXAF(item.price * item.quantity)}
                  </span>
                </div>

                {order.status === "DELIVERED" &&
                  (reviewingItemId === item.id ||
                  editingReviewItemId === item.id ? (
                    <ReviewForm
                      orderItemId={item.id}
                      productId={item.productId}
                      existingReview={reviewsByItem[item.id]}
                      onDone={(review) => {
                        setReviewsByItem((prev) => ({
                          ...prev,
                          [item.id]: review,
                        }));
                        setReviewingItemId(null);
                        setEditingReviewItemId(null);
                      }}
                      onCancel={() => setEditingReviewItemId(null)}
                    />
                  ) : reviewsByItem[item.id] ? (
                    <div className="mt-1 flex items-center gap-3 text-xs">
                      <span className="text-green-600">
                        Avis envoyé ({reviewsByItem[item.id].rating}★)
                      </span>
                      <button
                        onClick={() => setEditingReviewItemId(item.id)}
                        className="flex items-center gap-1 text-gray-500 hover:text-gray-900"
                      >
                        <Pencil size={12} /> Modifier
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteReview(item.id, reviewsByItem[item.id].id)
                        }
                        disabled={
                          isDeletingReview &&
                          deletingReviewId === reviewsByItem[item.id].id
                        }
                        className="flex items-center gap-1 text-gray-500 hover:text-red-600 disabled:opacity-50"
                      >
                        <Trash2 size={12} /> Supprimer
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReviewingItemId(item.id)}
                      className="mt-1 flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900"
                    >
                      <Star size={12} /> Laisser un avis
                    </button>
                  ))}
              </div>
            );
          })}
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

      {returns.length > 0 && (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
            <RotateCcw size={16} /> Mes demandes de retour
          </h2>
          <div className="space-y-2">
            {returns.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">Retour #{r.id.slice(0, 8)}</p>
                  <p className="text-xs text-gray-500">{r.reason}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    r.status === "APPROVED"
                      ? "bg-green-100 text-green-700"
                      : r.status === "REJECTED"
                        ? "bg-red-100 text-red-700"
                        : r.status === "COMPLETED"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showReturnForm && (
        <ReturnRequestForm
          order={order}
          onClose={() => setShowReturnForm(false)}
        />
      )}
    </div>
  );
}
