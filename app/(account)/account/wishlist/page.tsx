// app/(account)/account/wishlist/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Heart, Trash2, ImageOff, ShoppingCart } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { useCart } from "@/lib/cart/cart-context";
import { formatXAF } from "@/lib/format";
import type { Wishlist } from "@/lib/types";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    apiClient
      .get<Wishlist>("/wishlist")
      .then(setWishlist)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Erreur de chargement",
        ),
      )
      .finally(() => setIsLoading(false));
  }, []);

  async function handleRemove(productId: number, combinationId: string | null) {
    setRemovingId(productId);
    try {
      const updated = await apiClient.delete<Wishlist>("/wishlist/items", {
        product_id: productId,
        combination_id: combinationId ?? undefined,
      });
      setWishlist(updated);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Suppression impossible");
    } finally {
      setRemovingId(null);
    }
  }

  if (isLoading)
    return <Loader2 size={20} className="animate-spin text-gray-400" />;
  if (error)
    return (
      <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );

  const items = wishlist?.items ?? [];

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Ma liste de souhaits</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-gray-400">
          <Heart size={32} />
          <p className="text-sm">Aucun produit enregistré pour l'instant.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const price = item.combination?.price ?? item.product.price;
            const image = item.product.images[0]?.url;
            return (
              <div
                key={item.id}
                className="flex gap-3 rounded-lg border border-gray-200 bg-white p-3"
              >
                {/* ... image inchangée ... */}
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link
                      href={`/products/${item.productId}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-gray-500">{formatXAF(price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (item.combinationId && !item.combination) {
                          alert(
                            "Cette variante n'est plus disponible et ne peut plus être ajoutée au panier.",
                          );
                          return;
                        }
                        addItem({
                          productId: item.productId,
                          combinationId: item.combinationId,
                          quantity: 1,
                          name: item.product.name,
                          price,
                          image: image ?? null,
                          sku: item.combination?.sku ?? "",
                        });
                      }}
                      className="flex items-center gap-1 rounded-md bg-gray-900 px-2 py-1 text-xs text-white hover:bg-gray-800"
                    >
                      <ShoppingCart size={12} /> Ajouter
                    </button>
                    <button
                      onClick={() =>
                        handleRemove(item.productId, item.combinationId)
                      }
                      disabled={removingId === item.productId}
                      className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    >
                      {removingId === item.productId ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
