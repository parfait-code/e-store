// components/CartIndicator.tsx
"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";

export function CartIndicator() {
  const { totalItems, isLoaded } = useCart();

  return (
    <Link
      href="/cart"
      className="relative flex items-center rounded-md p-2 hover:bg-gray-100"
    >
      <ShoppingCart size={20} className="text-gray-900" />
      {isLoaded && totalItems > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-900 px-1 text-xs font-medium text-white">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </Link>
  );
}
