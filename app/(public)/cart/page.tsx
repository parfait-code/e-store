// app/(public)/cart/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, ShoppingBag, ImageOff, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { useAuth } from "@/lib/auth/auth-context";
import { QuantitySelector } from "@/components/QuantitySelector";
import { formatXAF } from "@/lib/format";

export default function CartPage() {
  const { items, totalAmount, updateQuantity, removeItem, isLoaded } =
    useCart();
  const { user } = useAuth();

  if (!isLoaded) return null; // évite un flash de "panier vide" avant lecture du localStorage

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <ShoppingBag size={40} className="text-gray-300" />
        <h1 className="text-lg font-semibold text-gray-900">
          Votre panier est vide
        </h1>
        <p className="text-sm text-gray-500">
          Découvrez notre catalogue pour commencer vos achats.
        </p>
        <Link
          href="/products"
          className="mt-2 rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          Voir le catalogue
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Mon panier</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
            {items.map((item) => {
              const unitPrice = item.pricing?.hasDiscount
                ? item.pricing.finalPrice
                : item.price;
              return (
                <div
                  key={`${item.productId}-${item.variantId ?? "base"}`}
                  className="flex gap-4 p-4"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ImageOff size={20} className="text-gray-300" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <Link
                        href={`/products/${item.productId}`}
                        className="text-sm font-medium text-gray-900 hover:underline"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-gray-400">SKU {item.sku}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <QuantitySelector
                        quantity={item.quantity}
                        max={item.maxQuantity}
                        onChange={(q) =>
                          updateQuantity(item.productId, item.variantId, q)
                        }
                      />
                      <span className="text-sm font-semibold">
                        {formatXAF(unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="self-start rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-medium">Résumé</h2>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Sous-total</span>
            <span>{formatXAF(totalAmount)}</span>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Frais de livraison et coupons calculés à l'étape suivante.
          </p>
          <div className="mt-4 flex justify-between border-t border-gray-100 pt-4 text-base font-semibold">
            <span>Total</span>
            <span>{formatXAF(totalAmount)}</span>
          </div>

          <Link
            href={user ? "/checkout" : "/login?redirect=/checkout"}
            className="mt-5 flex items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            {user ? "Passer commande" : "Se connecter pour commander"}
            <ArrowRight size={16} />
          </Link>
          {!user && (
            <p className="mt-2 text-center text-xs text-gray-400">
              Un compte est nécessaire pour finaliser votre commande.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
