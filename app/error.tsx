// app/error.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Pas d'infra de monitoring (Sentry, etc.) actuellement dans le projet —
    // à brancher ici le jour où elle existe. En attendant, log console minimal.
    console.error("Erreur applicative :", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
      <div className="rounded-full bg-red-50 p-4">
        <AlertTriangle size={40} className="text-red-500" />
      </div>
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Une erreur est survenue
        </h1>
        <p className="mt-2 max-w-sm text-sm text-gray-500">
          Quelque chose s'est mal passé. Vous pouvez réessayer ou revenir à
          l'accueil.
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-gray-400">
            Référence : {error.digest}
          </p>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          <RefreshCw size={16} /> Réessayer
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Home size={16} /> Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
