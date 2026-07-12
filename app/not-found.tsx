// app/not-found.tsx
import Link from "next/link";
import { PackageX, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
      <div className="rounded-full bg-gray-100 p-4">
        <PackageX size={40} className="text-gray-400" />
      </div>
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Page introuvable
        </h1>
        <p className="mt-2 max-w-sm text-sm text-gray-500">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          <Home size={16} /> Retour à l'accueil
        </Link>
        <Link
          href="/products"
          className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Search size={16} /> Voir le catalogue
        </Link>
      </div>
    </div>
  );
}
