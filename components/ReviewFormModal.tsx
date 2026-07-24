// components/ReviewFormModal.tsx
"use client";

import { useState } from "react";
import { Star, X, Loader2 } from "lucide-react";
import { ApiError } from "@/lib/api-client";
import { useCreateReview } from "@/lib/queries/shop/useOrders";

interface ReviewFormModalProps {
  open: boolean;
  orderItemId: string;
  productId: string;
  productName: string;
  onClose: () => void;
}

export function ReviewFormModal({
  open,
  orderItemId,
  productId,
  productName,
  onClose,
}: ReviewFormModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { mutate: createReview, isPending } = useCreateReview();

  if (!open) return null;

  function handleSubmit() {
    setError(null);
    createReview(
      {
        order_item_id: orderItemId,
        product_id: productId,
        rating,
        comment: comment.trim() || undefined,
      },
      {
        onSuccess: onClose,
        onError: (err) =>
          setError(
            err instanceof ApiError
              ? err.message
              : "Erreur lors de l'envoi de l'avis",
          ),
      },
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Laisser un avis</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>
        <p className="mb-3 text-sm text-gray-500">{productName}</p>

        {error && (
          <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </p>
        )}

        <div className="mb-3 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)}>
              <Star
                size={22}
                className={
                  n <= rating
                    ? "fill-amber-400 text-amber-400"
                    : "text-gray-300"
                }
              />
            </button>
          ))}
        </div>

        <textarea
          rows={3}
          placeholder="Votre commentaire (optionnel)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isPending}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}
