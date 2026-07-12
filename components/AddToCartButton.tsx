// components/AddToCartButton.tsx
"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { QuantitySelector } from "./QuantitySelector";
import type { Product, ProductCombination } from "@/lib/types";

interface AddToCartButtonProps {
  product: Product;
  selectedCombination: ProductCombination | null;
  requiresCombination: boolean;
}

export function AddToCartButton({
  product,
  selectedCombination,
  requiresCombination,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  // `inventory` peut être absent si le backend omet le champ pour cette
  // combinaison — on ne suppose jamais sa présence.
  const stock = selectedCombination
    ? (Array.isArray(selectedCombination.inventory)
        ? selectedCombination.inventory
        : []
      ).reduce((sum, inv) => sum + inv.quantity, 0)
    : undefined;

  const isOutOfStock = selectedCombination !== null && stock === 0;
  const missingSelection = requiresCombination && !selectedCombination;

  function handleAdd() {
    if (missingSelection || isOutOfStock) return;

    const images = Array.isArray(product.images) ? product.images : [];
    const primaryImage = images.find((i) => i.isPrimary) ?? images[0];

    addItem({
      productId: product.id,
      combinationId: selectedCombination?.id ?? null,
      quantity,
      name: product.name,
      price: selectedCombination?.price ?? product.price,
      pricing: selectedCombination ? undefined : product.pricing,
      image: primaryImage?.url ?? null,
      sku: selectedCombination?.sku ?? product.sku,
      maxQuantity: stock,
      weight: product.weight ?? undefined,
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
              ? "Choisissez une option"
              : isOutOfStock
                ? "Rupture de stock"
                : "Ajouter au panier"}
          </>
        )}
      </button>
    </div>
  );
}
