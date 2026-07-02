// components/WishlistButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth/auth-context";

interface WishlistButtonProps {
  productId: number;
  variantId?: string | null;
}

export function WishlistButton({
  productId,
  variantId = null,
}: WishlistButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  async function handleClick() {
    if (!user) {
      router.push(
        `/login?redirect=${encodeURIComponent(window.location.pathname)}`,
      );
      return;
    }
    setIsAdding(true);
    try {
      await apiClient.post("/wishlist/items", {
        product_id: productId,
        variant_id: variantId ?? undefined,
      });
      setAdded(true);
    } catch (err) {
      alert(
        err instanceof ApiError
          ? err.message
          : "Impossible d'ajouter aux favoris",
      );
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isAdding || added}
      className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
    >
      {isAdding ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Heart size={16} className={added ? "fill-red-500 text-red-500" : ""} />
      )}
      {added ? "Ajouté aux favoris" : "Ajouter aux favoris"}
    </button>
  );
}
