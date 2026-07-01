// components/PublicHeader.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, User, Menu, X } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth/auth-context";
import { CartIndicator } from "./CartIndicator";
import type { Category } from "@/lib/types";

export function PublicHeader() {
  const router = useRouter();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    apiClient
      .get<Category[]>("/categories")
      .then((all) => setCategories(all.filter((c) => c.parentId === null)))
      .catch(() => {});
  }, []);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const q = searchInput.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <button
          onClick={() => setMobileMenuOpen((o) => !o)}
          className="rounded-md p-2 hover:bg-gray-100 md:hidden"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link href="/" className="shrink-0 text-lg font-semibold">
          E-Store
        </Link>

        <form
          onSubmit={handleSearch}
          className="relative hidden flex-1 max-w-md md:block"
        >
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
          />
        </form>

        <div className="ml-auto flex items-center gap-1">
          <Link
            href={user ? "/account" : "/login"}
            className="flex items-center gap-2 rounded-md p-2 hover:bg-gray-100"
          >
            <User size={20} className="text-gray-700" />
            <span className="hidden text-sm font-medium sm:inline">
              {user ? user.firstName : "Connexion"}
            </span>
          </Link>
          <CartIndicator />
        </div>
      </div>

      {/* Recherche mobile */}
      <form
        onSubmit={handleSearch}
        className="relative border-t border-gray-100 px-4 py-2 md:hidden"
      >
        <Search
          size={16}
          className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
        />
      </form>

      {/* Nav catégories desktop */}
      <nav className="hidden border-t border-gray-100 md:block">
        <div className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-4 py-2 text-sm sm:px-6">
          <Link
            href="/products"
            className="whitespace-nowrap font-medium text-gray-700 hover:text-gray-900"
          >
            Tous les produits
          </Link>
          {categories
            .filter((c) => !("parentId" in c) || true) // CategoryRef n'a pas parentId — top-level via /categories
            .slice(0, 8)
            .map((c) => (
              <Link
                key={c.id}
                href={`/categories/${c.slug}`}
                className="whitespace-nowrap text-gray-600 hover:text-gray-900"
              >
                {c.name}
              </Link>
            ))}
        </div>
      </nav>

      {/* Nav catégories mobile */}
      {mobileMenuOpen && (
        <nav className="border-t border-gray-100 md:hidden">
          <div className="flex flex-col px-4 py-2 text-sm">
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="border-b border-gray-50 py-2 font-medium text-gray-700"
            >
              Tous les produits
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/categories/${c.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="border-b border-gray-50 py-2 text-gray-600"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
