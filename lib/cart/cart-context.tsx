// lib/cart/cart-context.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { apiClient } from "@/lib/api-client";
import type { Basket, CartLocalItem, CartContextValue } from "@/lib/types";

// NOTE ARCHITECTURE : ce contexte reste volontairement HORS de React Query.
// Le panier est un état client pur (localStorage), jamais lu depuis le
// serveur en usage normal — il n'y a donc rien à "cacher" côté serveur ici.
// Seule exception : syncToServer(), un effet de bord fire-and-forget appelé
// une fois après login/signup, qui ne bénéficie pas d'un cache de requête.

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "cart_items";

function sameLine(
  a: CartLocalItem,
  productId: string,
  combinationId: string | null,
) {
  return a.productId === productId && a.combinationId === combinationId;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLocalItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // localStorage corrompu ou indisponible : on repart d'un panier vide
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // quota localStorage dépassé ou navigateur en mode privé strict
    }
  }, [items, isLoaded]);

  const addItem = useCallback((item: CartLocalItem) => {
    setItems((prev) => {
      const existing = prev.find((i) =>
        sameLine(i, item.productId, item.combinationId),
      );
      if (existing) {
        const nextQuantity = existing.quantity + item.quantity;
        const capped = item.maxQuantity
          ? Math.min(nextQuantity, item.maxQuantity)
          : nextQuantity;
        return prev.map((i) =>
          sameLine(i, item.productId, item.combinationId)
            ? { ...i, quantity: capped }
            : i,
        );
      }
      const initialQuantity = item.maxQuantity
        ? Math.min(item.quantity, item.maxQuantity)
        : item.quantity;
      return [...prev, { ...item, quantity: initialQuantity }];
    });
  }, []);

  const removeItem = useCallback(
    (productId: string, combinationId: string | null) => {
      setItems((prev) =>
        prev.filter((i) => !sameLine(i, productId, combinationId)),
      );
    },
    [],
  );

  const updateQuantity = useCallback(
    (productId: string, combinationId: string | null, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId, combinationId);
        return;
      }
      setItems((prev) =>
        prev.map((i) => {
          if (!sameLine(i, productId, combinationId)) return i;
          const capped = i.maxQuantity
            ? Math.min(quantity, i.maxQuantity)
            : quantity;
          return { ...i, quantity: capped };
        }),
      );
    },
    [removeItem],
  );

  const clearCart = useCallback(() => setItems([]), []);

  const syncToServer = useCallback(async () => {
    if (items.length === 0) return;
    try {
      const basket = await apiClient.get<Basket>("/user/basket");
      for (const item of items) {
        await apiClient.post(`/basket/${basket.id}/product`, {
          product_id: item.productId,
          combination_id: item.combinationId ?? undefined,
          quantity: item.quantity,
        });
      }
    } catch {
      // On retentera à la prochaine connexion.
    }
  }, [items]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items.reduce((sum, i) => {
    const unitPrice = i.pricing?.hasDiscount ? i.pricing.finalPrice : i.price;
    return sum + unitPrice * i.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalAmount,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        syncToServer,
        isLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans un CartProvider");
  return ctx;
}
