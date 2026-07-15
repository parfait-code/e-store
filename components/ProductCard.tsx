// components/ProductCard.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ImageOff, ShoppingCart, Heart, Check, Loader2 } from "lucide-react";
import { PriceDisplay } from "./PriceDisplay";
import { WishlistLoginPromptModal } from "./WishlistLoginPromptModal";
import { useCart } from "@/lib/cart/cart-context";
import { useAuth } from "@/lib/auth/auth-context";
import { apiClient, ApiError } from "@/lib/api-client";
import {
  isInGuestWishlist,
  toggleGuestWishlist,
} from "@/lib/wishlist/guest-storage";
import type { Product } from "@/lib/types";

const NEW_PRODUCT_WINDOW_DAYS = 14;

function isNewProduct(createdAt: string) {
  const diffDays = (Date.now() - new Date(createdAt).getTime()) / 86_400_000;
  return diffDays <= NEW_PRODUCT_WINDOW_DAYS;
}

export function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const images = Array.isArray(product.images) ? product.images : [];
  const primaryImage = images.find((img) => img.isPrimary) ?? images[0];
  const isNew = isNewProduct(product.createdAt);

  const [justAddedToCart, setJustAddedToCart] = useState(false);

  const [inWishlist, setInWishlist] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    if (!user) setInWishlist(isInGuestWishlist(product.id));
  }, [user, product.id]);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (justAddedToCart) return;

    addItem({
      productId: product.id,
      combinationId: null,
      quantity: 1,
      name: product.name,
      price: product.price,
      pricing: product.pricing,
      image: primaryImage?.url ?? null,
      sku: product.sku,
      weight: product.weight ?? undefined,
    });

    setJustAddedToCart(true);
    setTimeout(() => setJustAddedToCart(false), 1500);
  }

  async function handleToggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isTogglingWishlist) return;

    if (!user) {
      const nowIn = toggleGuestWishlist(product.id);
      setInWishlist(nowIn);
      if (nowIn) setShowLoginPrompt(true);
      return;
    }

    setIsTogglingWishlist(true);
    try {
      if (inWishlist) {
        await apiClient.delete("/wishlist/items", { product_id: product.id });
        setInWishlist(false);
      } else {
        await apiClient.post("/wishlist/items", { product_id: product.id });
        setInWishlist(true);
      }
    } catch (err) {
      alert(
        err instanceof ApiError
          ? err.message
          : "Une erreur est survenue lors de la mise à jour des favoris.",
      );
    } finally {
      setIsTogglingWishlist(false);
    }
  }

  return (
    <>
      <div className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:shadow-md">
        <Link
          href={`/products/${product.id}`}
          className="relative block aspect-square w-full overflow-hidden bg-gray-100"
        >
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText ?? product.name}
              fill
              className="object-cover transition group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ImageOff size={32} className="text-gray-300" />
            </div>
          )}

          <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
            {product.pricing?.hasDiscount && (
              <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-medium text-white">
                -{product.pricing.discountPercentage}%
              </span>
            )}
            {isNew && (
              <span className="rounded-full bg-gray-900 px-2 py-0.5 text-xs font-medium text-white">
                Nouveau
              </span>
            )}
          </div>

          <button
            onClick={handleToggleWishlist}
            disabled={isTogglingWishlist}
            aria-label={
              inWishlist ? "Retirer des favoris" : "Ajouter aux favoris"
            }
            className="absolute right-2 top-2 flex items-center justify-center rounded-full bg-white/95 p-2 text-gray-600 shadow-sm transition hover:bg-white hover:text-red-600 disabled:opacity-50"
          >
            {isTogglingWishlist ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Heart
                size={16}
                className={inWishlist ? "fill-red-500 text-red-500" : ""}
              />
            )}
          </button>
        </Link>

        <div className="flex flex-1 flex-col gap-1 p-3">
          {product.category?.name && (
            <span className="text-xs text-gray-400">
              {product.category.name}
            </span>
          )}
          <Link href={`/products/${product.id}`}>
            <h3 className="line-clamp-2 text-sm font-medium text-gray-900">
              {product.name}
            </h3>
          </Link>

          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            <PriceDisplay
              price={product.price}
              pricing={product.pricing}
              size="sm"
            />
            <button
              onClick={handleAddToCart}
              aria-label="Ajouter au panier"
              className={`flex shrink-0 items-center justify-center rounded-md p-2 text-white transition ${
                justAddedToCart
                  ? "bg-green-600"
                  : "bg-gray-900 hover:bg-gray-800"
              }`}
            >
              {justAddedToCart ? (
                <Check size={16} />
              ) : (
                <ShoppingCart size={16} />
              )}
            </button>
          </div>
        </div>
      </div>

      <WishlistLoginPromptModal
        open={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
      />
    </>
  );
}
