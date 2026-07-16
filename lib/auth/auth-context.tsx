// lib/auth/auth-context.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { apiClient, ApiError } from "@/lib/api-client";
import type { AuthResponse, User } from "@/lib/types";
import { useCart } from "@/lib/cart/cart-context";
import { useWishlist } from "@/lib/wishlist/wishlist-context";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (
    username: string,
    password: string,
    redirectTo?: string,
  ) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_COOKIE = "token";
const USER_COOKIE = "user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { syncToServer: syncCartToServer } = useCart();
  const { syncToServer: syncWishlistToServer, resetToGuest } = useWishlist();

  useEffect(() => {
    const rawUser = Cookies.get(USER_COOKIE);
    if (rawUser) {
      try {
        setUser(JSON.parse(rawUser));
      } catch {
        Cookies.remove(USER_COOKIE);
        Cookies.remove(TOKEN_COOKIE);
      }
    }
    setIsLoading(false);
  }, []);

  async function login(
    username: string,
    password: string,
    redirectTo?: string,
  ) {
    const data = await apiClient.post<AuthResponse>(
      "/login",
      { username, password },
      { auth: false },
    );
    Cookies.set(TOKEN_COOKIE, data.token, { expires: 7, sameSite: "lax" });
    Cookies.set(USER_COOKIE, JSON.stringify(data.user), {
      expires: 7,
      sameSite: "lax",
    });
    setUser(data.user);
    await syncCartToServer();
    await syncWishlistToServer();

    router.push(redirectTo || "/account");
  }

  function logout() {
    Cookies.remove(TOKEN_COOKIE);
    Cookies.remove(USER_COOKIE);
    setUser(null);
    resetToGuest();
    router.push("/login");
  }

  function updateUser(updated: User) {
    Cookies.set(USER_COOKIE, JSON.stringify(updated), {
      expires: 7,
      sameSite: "lax",
    });
    setUser(updated);
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return ctx;
}

export { ApiError };
