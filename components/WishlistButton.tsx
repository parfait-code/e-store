// components/WishlistButton.tsx
"use client";

import { useEffect, useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth/auth-context";
import { WishlistLoginPromptModal } from "./WishlistLoginPromptModal";
import {
  isInGuestWishlist,
  toggleGuestWishlist,
} from "@/lib/wishlist/guest-storage";

interface WishlistButtonProps {
  productId: string;
  combinationId?: string | null;
}

export function WishlistButton({
  productId,
  combinationId = null,
}: WishlistButtonProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [added, setAdded] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    if (!user) setAdded(isInGuestWishlist(productId));
  }, [user, productId]);

  async function handleClick() {
    if (isSubmitting) return;

    if (!user) {
      const nowIn = toggleGuestWishlist(productId);
      setAdded(nowIn);
      if (nowIn) setShowLoginPrompt(true);
      return;
    }

    setIsSubmitting(true);
    try {
      if (added) {
        await apiClient.delete("/wishlist/items", {
          product_id: productId,
          combination_id: combinationId ?? undefined,
        });
        setAdded(false);
      } else {
        await apiClient.post("/wishlist/items", {
          product_id: productId,
          combination_id: combinationId ?? undefined,
        });
        setAdded(true);
      }
    } catch (err) {
      alert(
        err instanceof ApiError
          ? err.message
          : "Impossible de mettre à jour vos favoris",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isSubmitting}
        className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
      >
        {isSubmitting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Heart
            size={16}
            className={added ? "fill-red-500 text-red-500" : ""}
          />
        )}
        {added ? "Ajouté aux favoris" : "Ajouter aux favoris"}
      </button>

      <WishlistLoginPromptModal
        open={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
      />
    </>
  );
}
