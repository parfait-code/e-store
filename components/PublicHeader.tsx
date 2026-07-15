// components/PublicHeader.tsx
"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, User, Menu, X, Heart } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useCategories } from "@/lib/queries/shop/useCatalog";
import { CartIndicator } from "./CartIndicator";

export function PublicHeader() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: allCategories = [] } = useCategories();
  const categories = allCategories.filter((c) => c.parentId === null);
  const [searchInput, setSearchInput] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const q = searchInput.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  function closeMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="relative mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="rounded-md p-2 text-gray-900 hover:bg-gray-100 md:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu size={20} />
        </button>

        <Link href="/" className="shrink-0 text-lg font-semibold">
          E-Store
        </Link>

        {/* Barre de recherche centrée sur toute la largeur du header,
            indépendamment de la largeur du logo et du bloc d'icônes.
            pointer-events-none sur le conteneur pour ne pas bloquer les
            clics ailleurs dans la barre, réactivé uniquement sur le champ. */}
        <form
          onSubmit={handleSearch}
          className="pointer-events-none absolute inset-0 hidden items-center justify-center md:flex"
        >
          <div className="pointer-events-auto relative w-full max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            />
          </div>
        </form>

        <div className="relative ml-auto flex items-center gap-1">
          <Link
            href={
              user ? "/account/wishlist" : "/login?redirect=/account/wishlist"
            }
            className="flex items-center gap-2 rounded-md p-2 hover:bg-gray-100"
            aria-label="Liste de souhaits"
          >
            <Heart size={20} className="text-gray-900" />
          </Link>
          <Link
            href={user ? "/account" : "/login"}
            className="flex items-center gap-2 rounded-md p-2 hover:bg-gray-100"
          >
            <User size={20} className="text-gray-900" />
            <span className="hidden text-sm font-medium sm:inline">
              {user ? user.firstName : "Connexion"}
            </span>
          </Link>
          <CartIndicator />
        </div>
      </div>

      {/* Recherche mobile, sous la barre principale */}
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

      {/* Nav catégories desktop — plus de trait de séparation avec la barre principale */}
      <nav className="hidden md:block">
        <div className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-4 py-2 text-sm sm:px-6">
          <Link
            href="/products"
            className="whitespace-nowrap font-medium text-gray-700 hover:text-gray-900"
          >
            Tous les produits
          </Link>
          {categories.slice(0, 8).map((c) => (
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

      {/* Drawer mobile — glisse depuis la gauche, en absolute/fixed avec
          backdrop, au lieu de l'ancien bloc inline qui poussait le contenu. */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${
          mobileMenuOpen ? "" : "pointer-events-none"
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        <div
          onClick={closeMenu}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`absolute inset-y-0 left-0 flex w-72 max-w-[80%] flex-col bg-white shadow-xl transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
            <span className="text-lg font-semibold">E-Store</span>
            <button
              onClick={closeMenu}
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
              aria-label="Fermer le menu"
            >
              <X size={20} />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-2 py-3">
            <Link
              href="/products"
              onClick={closeMenu}
              className="block rounded-md px-3 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100"
            >
              Tous les produits
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/categories/${c.slug}`}
                onClick={closeMenu}
                className="block rounded-md px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-100"
              >
                {c.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}