// components/AddToCartButton.tsx
"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { QuantitySelector } from "./QuantitySelector";
import type { Product, Variant } from "@/lib/types";

interface AddToCartButtonProps {
  product: Product;
  selectedVariant: Variant | null;
  requiresVariant: boolean;
}

export function AddToCartButton({
  product,
  selectedVariant,
  requiresVariant,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const stock = selectedVariant
    ? selectedVariant.inventory.reduce((sum, inv) => sum + inv.quantity, 0)
    : undefined; // stock du produit "simple" (sans variantes) non exposé publiquement, voir warning

  const isOutOfStock = selectedVariant !== null && stock === 0;
  const missingSelection = requiresVariant && !selectedVariant;

  function handleAdd() {
    if (missingSelection || isOutOfStock) return;

    const primaryImage =
      selectedVariant?.images[0] ??
      product.images.find((i) => i.isPrimary) ??
      product.images[0];

    addItem({
      productId: product.id,
      variantId: selectedVariant?.id ?? null,
      quantity,
      name: product.name,
      price: selectedVariant?.price ?? product.price,
      pricing: selectedVariant ? undefined : product.pricing, // remise connue seulement au niveau produit pour l'instant
      image: primaryImage?.url ?? null,
      sku: selectedVariant?.sku ?? product.sku,
      maxQuantity: stock,
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <div className="flex items-center gap-3">
      <QuantitySelector
        quantity={quantity}
        onChange={setQuantity}
        max={stock}
      />
      <button
        onClick={handleAdd}
        disabled={missingSelection || isOutOfStock}
        className="flex flex-1 items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {justAdded ? (
          <>
            <Check size={16} /> Ajouté
          </>
        ) : (
          <>
            <ShoppingCart size={16} />
            {missingSelection
              ? "Choisissez une variante"
              : isOutOfStock
                ? "Rupture de stock"
                : "Ajouter au panier"}
          </>
        )}
      </button>
    </div>
  );
}
