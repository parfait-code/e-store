// app/(account)/account/orders/[orderId]/page.tsx
"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
  MoreVertical,
  MapPin,
  Truck,
  CreditCard,
  Calendar,
  Tag,
  Hash,
  History,
  ImageOff,
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

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-gray-100 text-gray-600",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-amber-100 text-amber-700",
};

const CANCELLABLE_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
];

/* ---------------- Menu "Plus d'actions" ---------------- */

function OrderActionsMenu({
  order,
  onCancel,
  isCancelling,
}: {
  order: Order;
  onCancel: () => void;
  isCancelling: boolean;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const canCancel = CANCELLABLE_STATUSES.includes(order.status);

  if (!canCancel) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Plus d'actions"
        aria-expanded={open}
        className="flex items-center justify-center rounded-md border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
          <button
            onClick={() => {
              setOpen(false);
              onCancel();
            }}
            disabled={isCancelling}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {isCancelling ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <XCircle size={14} />
            )}
            Annuler la commande
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------- Avis produit ---------------- */

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
      className="mt-3 space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3"
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

/* ---------------- Demande de retour ---------------- */

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

/* ---------------- Ligne d'article détaillée ---------------- */
function OrderItemRow({
  item,
  order,
  reviewingItemId,
  editingReviewItemId,
  reviewsByItem,
  onReviewRequested,
  onReviewDone,
  onReviewEditCancelled,
  onDeleteReview,
  isDeletingReview,
  deletingReviewId,
}: {
  item: Order["items"][number];
  order: Order;
  reviewingItemId: string | null;
  editingReviewItemId: string | null;
  reviewsByItem: Record<string, ProductReview>;
  onReviewRequested: (itemId: string) => void;
  onReviewDone: (itemId: string, review: ProductReview) => void;
  onReviewEditCancelled: () => void;
  onDeleteReview: (itemId: string, reviewId: string) => void;
  isDeletingReview: boolean;
  deletingReviewId: string | undefined;
}) {
  const productName =
    item.product?.name ?? item.productName ?? "Produit supprimé";
  const productSku =
    item.combination?.sku ?? item.product?.sku ?? item.productSku ?? "—";
  const image = item.product?.images?.[0]?.url;

  let variantEntries: [string, string][] = [];

  if (item.combinationSnapshot) {
    variantEntries = Object.entries(item.combinationSnapshot);
  } else if (
    item.combination?.values &&
    Array.isArray(item.combination.values)
  ) {
    variantEntries = item.combination.values
      .filter((v) => v?.attributeDefinition?.name && v?.attributeOption?.value)
      .map((v) => [v.attributeDefinition.name, v.attributeOption.value]);
  }

  const hasDiscount = item.discountAmount > 0;

  return (
    <div className="py-4">
      <div className="flex gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100">
          {image ? (
            <Image
              src={image}
              alt={productName}
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ImageOff size={18} className="text-gray-300" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium">{productName}</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                <Hash size={10} /> SKU {productSku}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold">
                {formatXAF(item.price * item.quantity)}
              </p>
              {hasDiscount && (
                <p className="text-xs text-gray-400 line-through">
                  {formatXAF(item.originalPrice * item.quantity)}
                </p>
              )}
            </div>
          </div>

          {variantEntries.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {variantEntries.map(([label, value]) => (
                <span
                  key={label}
                  className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                >
                  {label} : <span className="font-medium">{value}</span>
                </span>
              ))}
            </div>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
            <span>Quantité : {item.quantity}</span>
            <span>
              Prix unitaire : {formatXAF(item.price)}
              {hasDiscount && (
                <span className="ml-1 text-green-600">
                  (-{formatXAF(item.discountAmount)}/unité)
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {order.status === "DELIVERED" &&
        (reviewingItemId === item.id || editingReviewItemId === item.id ? (
          <ReviewForm
            orderItemId={item.id}
            productId={item.productId}
            existingReview={reviewsByItem[item.id]}
            onDone={(review) => onReviewDone(item.id, review)}
            onCancel={onReviewEditCancelled}
          />
        ) : reviewsByItem[item.id] ? (
          <div className="mt-2 flex items-center gap-3 text-xs">
            <span className="text-green-600">
              Avis envoyé ({reviewsByItem[item.id].rating}★)
            </span>
            <button
              onClick={() => onReviewRequested(item.id)}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-900"
            >
              <Pencil size={12} /> Modifier
            </button>
            <button
              onClick={() => onDeleteReview(item.id, reviewsByItem[item.id].id)}
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
            onClick={() => onReviewRequested(item.id)}
            className="mt-2 flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900"
          >
            <Star size={12} /> Laisser un avis
          </button>
        ))}
    </div>
  );
}
/* ---------------- Page principale ---------------- */

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
  const shipping = order.shippingAddressSnapshot as {
    recipientName?: string;
    phone?: string;
    street?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  const itemsCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="max-w-5xl">
      <Link
        href="/account/orders"
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft size={14} /> Retour aux commandes
      </Link>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            Commande #{order.id.slice(0, 8)}
          </h1>
          <p className="text-sm text-gray-500">
            Passée le {formatDate(order.createdAt)} · {itemsCount} article(s)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
            {STATUS_LABELS[order.status]}
          </span>
          {canReturn && (
            <button
              onClick={() => setShowReturnForm(true)}
              className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              <RotateCcw size={14} /> Demander un retour
            </button>
          )}
          <OrderActionsMenu
            order={order}
            onCancel={handleCancelOrder}
            isCancelling={isCancelling}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-1 flex items-center gap-2 text-sm font-medium">
              <Package size={16} /> Articles ({order.items.length})
            </h2>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <OrderItemRow
                  key={item.id}
                  item={item}
                  order={order}
                  reviewingItemId={reviewingItemId}
                  editingReviewItemId={editingReviewItemId}
                  reviewsByItem={reviewsByItem}
                  onReviewRequested={(itemId) => {
                    setReviewingItemId(itemId);
                    setEditingReviewItemId(itemId);
                  }}
                  onReviewDone={(itemId, review) => {
                    setReviewsByItem((prev) => ({ ...prev, [itemId]: review }));
                    setReviewingItemId(null);
                    setEditingReviewItemId(null);
                  }}
                  onReviewEditCancelled={() => setEditingReviewItemId(null)}
                  onDeleteReview={handleDeleteReview}
                  isDeletingReview={isDeletingReview}
                  deletingReviewId={deletingReviewId as string | undefined}
                />
              ))}
            </div>

            <div className="mt-3 space-y-1 border-t border-gray-100 pt-3 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Sous-total</span>
                <span>{formatXAF(order.totalAmount)}</span>
              </div>
              {order.discountedAmount !== null && (
                <div className="flex justify-between text-green-600">
                  <span>Remise appliquée</span>
                  <span>
                    -{formatXAF(order.totalAmount - order.discountedAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-semibold">
                <span>Total</span>
                <span>
                  {formatXAF(order.discountedAmount ?? order.totalAmount)}
                </span>
              </div>
            </div>

            {order.appliedCoupon && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                <Tag size={12} />
                Coupon appliqué :{" "}
                <span className="font-medium">
                  {order.appliedCoupon.code}
                </span>{" "}
                ({order.appliedCoupon.promotion.name})
              </p>
            )}
          </div>

          {order.payments.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
                <CreditCard size={16} /> Paiements
              </h2>
              <div className="space-y-2">
                {order.payments.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-2 text-sm"
                  >
                    <span className="text-gray-600">
                      {p.method} · {formatDate(p.createdAt)}
                    </span>
                    <span className="font-medium">
                      {formatXAF(p.amount)} — {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {order.statusHistory.length > 0 && (
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
                      className="flex flex-wrap items-center justify-between gap-2 text-sm"
                    >
                      <span>
                        {h.fromStatus
                          ? `${STATUS_LABELS[h.fromStatus]} → `
                          : ""}
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
          )}

          {returns.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
                <RotateCcw size={16} /> Mes demandes de retour
              </h2>
              <div className="space-y-2">
                {returns.map((r) => (
                  <div
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-gray-100 px-3 py-2 text-sm"
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
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
              <MapPin size={16} /> Adresse de livraison
            </h2>
            {shipping?.recipientName && (
              <p className="font-medium text-gray-900">
                {shipping.recipientName}
              </p>
            )}
            {shipping?.phone && (
              <p className="text-gray-500">{shipping.phone}</p>
            )}
            <p className="mt-1 text-gray-600">
              {shipping?.street}
              {shipping?.addressLine2 ? `, ${shipping.addressLine2}` : ""}
              <br />
              {shipping?.postalCode ? `${shipping.postalCode} ` : ""}
              {shipping?.city}
              {shipping?.state ? `, ${shipping.state}` : ""}
              <br />
              {shipping?.country}
            </p>
          </div>

          {order.shippingMethod && (
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Truck size={16} /> Méthode de livraison
              </h2>
              <p className="text-gray-600">{order.shippingMethod.name}</p>
              <p className="text-xs text-gray-400">
                Délai estimé : {order.shippingMethod.estimatedDays} jour(s)
              </p>
            </div>
          )}

          <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
            <h2 className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Calendar size={16} /> Détails
            </h2>
            <dl className="space-y-1.5 text-gray-600">
              <div className="flex justify-between">
                <dt className="text-gray-400">Numéro</dt>
                <dd className="font-mono text-xs">{order.id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Date</dt>
                <dd>{formatDate(order.createdAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Statut</dt>
                <dd
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[order.status]}`}
                >
                  {STATUS_LABELS[order.status]}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {showReturnForm && (
        <ReturnRequestForm
          order={order}
          onClose={() => setShowReturnForm(false)}
        />
      )}
    </div>
  );
}
