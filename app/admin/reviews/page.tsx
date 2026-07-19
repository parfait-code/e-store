// app/admin/reviews/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { Search, Loader2, Star, Trash2, Pencil, X, Check } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import type { Product, Paginated, Review } from "@/lib/types";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  useAdminProductReviews,
  useAdminUpdateReview,
  useAdminDeleteReview,
} from "@/lib/queries/admin/useReviews";
import { useAlertDialog } from "@/components/admin/ModalProvider";

function ProductSearchPicker({
  selected,
  onSelect,
}: {
  selected: { id: string; name: string; sku: string } | null;
  onSelect: (p: { id: string; name: string; sku: string } | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      setIsSearching(true);
      apiClient
        .get<Paginated<Product>>(
          `/product?search=${encodeURIComponent(query.trim())}&limit=8`,
        )
        .then((res) => setResults(res.items ?? []))
        .catch(() => setResults([]))
        .finally(() => setIsSearching(false));
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  if (selected) {
    return (
      <div className="flex items-center justify-between rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm">
        <div>
          <span className="font-medium">{selected.name}</span>
          <span className="ml-2 text-xs text-gray-400">SKU {selected.sku}</span>
        </div>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative max-w-md">
      <div className="relative">
        <Search
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          placeholder="Rechercher un produit (nom, SKU)..."
          className="w-full rounded-md border border-gray-300 py-2 pl-8 pr-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
        />
      </div>
      {isOpen && query.trim() && (
        <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
          {isSearching ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 size={14} className="animate-spin text-gray-400" />
            </div>
          ) : results.length === 0 ? (
            <p className="px-3 py-2 text-xs text-gray-400">
              Aucun produit trouvé.
            </p>
          ) : (
            results.map((p) => (
              <button
                key={p.id}
                type="button"
                onMouseDown={() => {
                  onSelect({ id: p.id, name: p.name, sku: p.sku });
                  setQuery("");
                  setIsOpen(false);
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                <span>{p.name}</span>
                <span className="text-xs text-gray-400">{p.sku}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function EditReviewRow({
  review,
  productId,
  onDone,
  onCancel,
}: {
  review: Review;
  productId: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [rating, setRating] = useState(review.rating);
  const [comment, setComment] = useState(review.comment ?? "");
  const [error, setError] = useState<string | null>(null);
  const { mutate: updateReview, isPending } = useAdminUpdateReview(productId);

  function handleSave() {
    setError(null);
    updateReview(
      {
        reviewId: review.id,
        payload: { rating, comment: comment || undefined },
      },
      {
        onSuccess: onDone,
        onError: (err) =>
          setError(
            err instanceof ApiError
              ? err.message
              : "Erreur lors de la mise à jour",
          ),
      },
    );
  }

  return (
    <div className="space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3">
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
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-gray-900"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Check size={12} />
          )}
          Enregistrer
        </button>
        <button
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}

export default function AdminReviewsPage() {
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    name: string;
    sku: string;
  } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const alertDialog = useAlertDialog();

  const { data, isLoading, isError } = useAdminProductReviews(
    selectedProduct?.id ?? "",
  );
  const { mutate: deleteReview, isPending: isDeleting } = useAdminDeleteReview(
    selectedProduct?.id ?? "",
  );

  const reviews = data?.reviews ?? [];

  function confirmDelete() {
    if (!confirmDeleteId) return;
    deleteReview(confirmDeleteId, {
      onError: (err) =>
        alertDialog(
          err instanceof ApiError ? err.message : "Suppression impossible",
        ),
      onSettled: () => setConfirmDeleteId(null),
    });
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Avis clients</h1>
        <p className="text-sm text-gray-500">
          L'API n'expose pas de listing global des avis — recherchez un produit
          pour modérer les siens.
        </p>
      </div>

      <div className="mb-6">
        <ProductSearchPicker
          selected={selectedProduct}
          onSelect={setSelectedProduct}
        />
      </div>

      {!selectedProduct ? (
        <p className="text-sm text-gray-400">
          Sélectionnez un produit pour afficher ses avis.
        </p>
      ) : isLoading ? (
        <Loader2 size={20} className="animate-spin text-gray-400" />
      ) : isError ? (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          Erreur de chargement
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-gray-400">
          Aucun avis pour « {selectedProduct.name} ».
        </p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) =>
            editingId === review.id ? (
              <EditReviewRow
                key={review.id}
                review={review}
                productId={selectedProduct.id}
                onDone={() => setEditingId(null)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div
                key={review.id}
                className="rounded-md border border-gray-200 bg-white p-3"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {review.user.firstName} {review.user.lastName?.charAt(0)}.
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                <div className="mb-1 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < review.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-600">{review.comment}</p>
                )}
                <div className="mt-2 flex items-center gap-3 text-xs">
                  <button
                    onClick={() => setEditingId(review.id)}
                    className="flex items-center gap-1 text-gray-500 hover:text-gray-900"
                  >
                    <Pencil size={12} /> Modifier
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(review.id)}
                    disabled={isDeleting}
                    className="flex items-center gap-1 text-gray-500 hover:text-red-600 disabled:opacity-50"
                  >
                    <Trash2 size={12} /> Supprimer
                  </button>
                </div>
              </div>
            ),
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Supprimer l'avis"
        message="Cette action est irréversible (modération). Voulez-vous vraiment continuer ?"
        confirmLabel="Supprimer"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
