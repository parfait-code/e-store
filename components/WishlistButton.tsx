// components/WishlistButton.tsx
"use client";

import { useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { ApiError } from "@/lib/api-client";
import { useWishlist } from "@/lib/wishlist/wishlist-context";
import { WishlistLoginPromptModal } from "./WishlistLoginPromptModal";

interface WishlistButtonProps {
  productId: string;
  combinationId?: string | null;
}

export function WishlistButton({
  productId,
  combinationId = null,
}: WishlistButtonProps) {
  const { isInWishlist, toggle } = useWishlist();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const added = isInWishlist(productId);

  async function handleClick() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { added: nowAdded, requiresLogin } = await toggle(
        productId,
        combinationId,
      );
      if (nowAdded && requiresLogin) setShowLoginPrompt(true);
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
