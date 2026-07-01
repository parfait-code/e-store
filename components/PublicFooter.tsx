// components/PublicFooter.tsx
import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div>
            <h3 className="mb-3 text-sm font-semibold">E-Store</h3>
            <p className="text-sm text-gray-500">
              Votre boutique en ligne de confiance.
            </p>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold">Boutique</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="/products" className="hover:text-gray-900">
                  Tous les produits
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-gray-900">
                  Recherche
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold">Compte</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="/login" className="hover:text-gray-900">
                  Connexion
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-gray-900">
                  Créer un compte
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold">Panier</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="/cart" className="hover:text-gray-900">
                  Voir mon panier
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-8 border-t border-gray-100 pt-6 text-xs text-gray-400">
          © {new Date().getFullYear()} E-Store. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
