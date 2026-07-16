// app/(public)/cart/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, ShoppingBag, ImageOff, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { useAuth } from "@/lib/auth/auth-context";
import { QuantitySelector } from "@/components/QuantitySelector";
import { formatXAF } from "@/lib/format";

function CartRowSkeleton() {
  return (
    <div className="flex animate-pulse gap-4 p-4">
      <div className="h-20 w-20 shrink-0 rounded-md bg-gray-100" />
      <div className="flex flex-1 flex-col justify-between">
        <div className="space-y-2">
          <div className="h-4 w-2/5 rounded bg-gray-200" />
          <div className="h-3 w-1/5 rounded bg-gray-100" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-8 w-24 rounded-md bg-gray-100" />
          <div className="h-4 w-16 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div>
      <div className="mb-6 h-6 w-40 animate-pulse rounded bg-gray-200" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
            {Array.from({ length: 3 }).map((_, i) => (
              <CartRowSkeleton key={i} />
            ))}
          </div>
        </div>
        <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-5">
          <div className="h-4 w-24 rounded bg-gray-200" />
          <div className="mt-4 h-4 w-full rounded bg-gray-100" />
          <div className="mt-6 h-4 w-full rounded bg-gray-100" />
          <div className="mt-6 h-10 w-full rounded-md bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const { items, totalAmount, updateQuantity, removeItem, isLoaded } =
    useCart();
  const { user } = useAuth();

  const mainCtaRef = useRef<HTMLDivElement>(null);
  const [isMainCtaVisible, setIsMainCtaVisible] = useState(true);

  useEffect(() => {
    const el = mainCtaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsMainCtaVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isLoaded, items.length]);

  if (!isLoaded) return <CartSkeleton />;

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

  const showFloatingCta = !isMainCtaVisible;

  return (
    <div className="pb-24 lg:pb-0">
      <h1 className="mb-6 text-xl font-semibold">Mon panier</h1>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
            {items.map((item) => {
              const unitPrice = item.pricing?.hasDiscount
                ? item.pricing.finalPrice
                : item.price;
              return (
                <div
                  key={`${item.productId}-${item.combinationId ?? "base"}`}
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
                      {item.combinationValues &&
                        item.combinationValues.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {item.combinationValues.map((v) => (
                              <span
                                key={v.name}
                                className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600"
                              >
                                {v.name} :{" "}
                                <span className="font-medium">{v.value}</span>
                              </span>
                            ))}
                          </div>
                        )}
                    </div>
                    <div className="flex items-center justify-between">
                      <QuantitySelector
                        quantity={item.quantity}
                        max={item.maxQuantity}
                        onChange={(q) =>
                          updateQuantity(item.productId, item.combinationId, q)
                        }
                      />
                      <div className="text-right">
                        {item.pricing?.hasDiscount && (
                          <p className="text-xs text-gray-400 line-through">
                            {formatXAF(
                              item.pricing.originalPrice * item.quantity,
                            )}
                          </p>
                        )}
                        <span className="text-sm font-semibold">
                          {formatXAF(unitPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      removeItem(item.productId, item.combinationId)
                    }
                    className="self-start rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 lg:sticky lg:top-24">
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

          <div ref={mainCtaRef}>
            <Link
              href={user ? "/checkout" : "/login?redirect=/checkout"}
              className="mt-5 flex items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              {user ? "Passer commande" : "Se connecter pour commander"}
              <ArrowRight size={16} />
            </Link>
          </div>
          {!user && (
            <p className="mt-2 text-center text-xs text-gray-400">
              Un compte est nécessaire pour finaliser votre commande.
            </p>
          )}
        </div>
      </div>

      <div
        className={`fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] transition-transform duration-200 lg:hidden ${
          showFloatingCta
            ? "translate-y-0"
            : "pointer-events-none translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-base font-semibold">{formatXAF(totalAmount)}</p>
          </div>
          <Link
            href={user ? "/checkout" : "/login?redirect=/checkout"}
            className="flex items-center justify-center gap-2 rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            {user ? "Passer commande" : "Se connecter"}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
