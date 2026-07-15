// lib/wishlist/wishlist-context.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import Cookies from "js-cookie";
import { apiClient, ApiError } from "@/lib/api-client";
import type { Wishlist } from "@/lib/types";

const STORAGE_KEY = "guest_wishlist_ids";

function readGuestIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function writeGuestIds(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // quota dépassé / navigation privée stricte — échec silencieux
  }
}

interface ToggleResult {
  added: boolean;
  requiresLogin: boolean;
}

interface WishlistContextValue {
  isLoaded: boolean;
  isInWishlist: (productId: string) => boolean;
  toggle: (
    productId: string,
    combinationId?: string | null,
  ) => Promise<ToggleResult>;
  syncToServer: () => Promise<void>;
  resetToGuest: () => void;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(
  undefined,
);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [productIds, setProductIds] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const rawUser = Cookies.get("user");
    if (rawUser) {
      setIsAuthenticated(true);
      apiClient
        .get<Wishlist>("/wishlist")
        .then((wl) => setProductIds(new Set(wl.items.map((i) => i.productId))))
        .catch(() => {})
        .finally(() => setIsLoaded(true));
    } else {
      setProductIds(readGuestIds());
      setIsLoaded(true);
    }
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => productIds.has(productId),
    [productIds],
  );

  const toggle = useCallback(
    async (
      productId: string,
      combinationId: string | null = null,
    ): Promise<ToggleResult> => {
      const currentlyIn = productIds.has(productId);
      const willBeIn = !currentlyIn;

      if (!isAuthenticated) {
        setProductIds((prev) => {
          const next = new Set(prev);
          if (currentlyIn) next.delete(productId);
          else next.add(productId);
          writeGuestIds(next);
          return next;
        });
        return { added: willBeIn, requiresLogin: willBeIn };
      }

      setProductIds((prev) => {
        const next = new Set(prev);
        if (currentlyIn) next.delete(productId);
        else next.add(productId);
        return next;
      });

      try {
        if (currentlyIn) {
          await apiClient.delete("/wishlist/items", {
            product_id: productId,
            combination_id: combinationId ?? undefined,
          });
        } else {
          await apiClient.post("/wishlist/items", {
            product_id: productId,
            combination_id: combinationId ?? undefined,
          });
        }
        return { added: willBeIn, requiresLogin: false };
      } catch (err) {
        setProductIds((prev) => {
          const next = new Set(prev);
          if (currentlyIn) next.add(productId);
          else next.delete(productId);
          return next;
        });
        throw err instanceof ApiError
          ? err
          : new Error("Erreur lors de la mise à jour des favoris");
      }
    },
    [productIds, isAuthenticated],
  );

  const syncToServer = useCallback(async () => {
    const guestIds = readGuestIds();
    setIsAuthenticated(true);

    if (guestIds.size > 0) {
      for (const productId of guestIds) {
        try {
          await apiClient.post("/wishlist/items", { product_id: productId });
        } catch {
          // déjà présent, produit supprimé entre-temps, etc. — non bloquant
        }
      }
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }

    try {
      const wl = await apiClient.get<Wishlist>("/wishlist");
      setProductIds(new Set(wl.items.map((i) => i.productId)));
    } catch {
      // on garde l'état optimiste existant si le refetch échoue
    }
  }, []);

  const resetToGuest = useCallback(() => {
    setIsAuthenticated(false);
    setProductIds(readGuestIds());
  }, []);

  return (
    <WishlistContext.Provider
      value={{ isLoaded, isInWishlist, toggle, syncToServer, resetToGuest }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx)
    throw new Error("useWishlist doit être utilisé dans un WishlistProvider");
  return ctx;
}
