// app/(account)/account/wishlist/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Trash2, ImageOff, ShoppingCart, Loader2 } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { useCart } from "@/lib/cart/cart-context";
import { useWishlist } from "@/lib/wishlist/wishlist-context";
import { shopCatalogApi } from "@/lib/api/shop/catalog";
import { formatXAF } from "@/lib/format";
import { CombinationRequiredModal } from "@/components/CombinationRequiredModal";
import type { Wishlist } from "@/lib/types";

function WishlistCardSkeleton() {
  return (
    <div className="flex animate-pulse gap-4 rounded-xl border border-gray-200 bg-white p-4">
      <div className="h-24 w-24 shrink-0 rounded-lg bg-gray-100" />
      <div className="flex flex-1 flex-col justify-between">
        <div className="space-y-2">
          <div className="h-4 w-3/5 rounded bg-gray-200" />
          <div className="h-3 w-2/5 rounded bg-gray-100" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-24 rounded-md bg-gray-100" />
          <div className="h-8 w-8 rounded-md bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [checkingProductId, setCheckingProductId] = useState<string | null>(
    null,
  );
  const [combinationModalProductId, setCombinationModalProductId] = useState<
    string | null
  >(null);
  const { addItem } = useCart();
  const { toggle } = useWishlist();

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

  async function handleRemove(productId: string, combinationId: string | null) {
    setRemovingId(productId);
    try {
      await toggle(productId, combinationId);
      setWishlist((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.filter(
                (i) =>
                  !(
                    i.productId === productId &&
                    i.combinationId === combinationId
                  ),
              ),
            }
          : prev,
      );
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Suppression impossible");
    } finally {
      setRemovingId(null);
    }
  }

  async function handleAddToCart(item: Wishlist["items"][number]) {
    const price = item.combination?.price ?? item.product.price;
    const image = item.product.images[0]?.url;

    if (item.combinationId) {
      if (!item.combination) {
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
        sku: item.combination.sku ?? "",
      });
      return;
    }

    setCheckingProductId(item.productId);
    try {
      const combinations = await shopCatalogApi.combinations(item.productId);
      const requiresChoice = combinations.some((c) => c.isActive);
      if (requiresChoice) {
        setCombinationModalProductId(item.productId);
        return;
      }
      addItem({
        productId: item.productId,
        combinationId: null,
        quantity: 1,
        name: item.product.name,
        price,
        image: image ?? null,
        sku: "",
      });
    } catch {
      setCombinationModalProductId(item.productId);
    } finally {
      setCheckingProductId(null);
    }
  }

  if (isLoading) {
    return (
      <div>
        <h1 className="mb-6 text-xl font-semibold">Ma liste de souhaits</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <WishlistCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map((item) => {
            const price = item.combination?.price ?? item.product.price;
            const image = item.product.images[0]?.url;
            const isChecking = checkingProductId === item.productId;
            const isRemoving = removingId === item.productId;

            return (
              <div
                key={item.id}
                className="group flex gap-4 rounded-xl border border-gray-200 bg-white p-4 transition hover:shadow-md"
              >
                <Link
                  href={`/products/${item.productId}`}
                  className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100"
                >
                  {image ? (
                    <Image
                      src={image}
                      alt={item.product.name}
                      fill
                      className="object-cover transition group-hover:scale-105"
                      sizes="96px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageOff size={22} className="text-gray-300" />
                    </div>
                  )}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <Link
                      href={`/products/${item.productId}`}
                      className="line-clamp-2 text-sm font-medium text-gray-900 hover:underline"
                    >
                      {item.product.name}
                    </Link>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {formatXAF(price)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={isChecking}
                      className="flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-60"
                    >
                      {isChecking ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <ShoppingCart size={12} />
                      )}
                      Ajouter
                    </button>
                    <button
                      onClick={() =>
                        handleRemove(item.productId, item.combinationId)
                      }
                      disabled={isRemoving}
                      className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      aria-label="Retirer des favoris"
                    >
                      {isRemoving ? (
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

      <CombinationRequiredModal
        open={combinationModalProductId !== null}
        productId={combinationModalProductId}
        onClose={() => setCombinationModalProductId(null)}
      />
    </div>
  );
}
