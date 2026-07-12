// app/global-error.tsx
"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erreur critique (root layout) :", error);
  }, [error]);

  return (
    <html lang="fr">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center antialiased">
        <div className="rounded-full bg-red-50 p-4">
          <AlertTriangle size={40} className="text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Une erreur critique est survenue
          </h1>
          <p className="mt-2 max-w-sm text-sm text-gray-500">
            L'application n'a pas pu se charger correctement.
          </p>
          {error.digest && (
            <p className="mt-2 text-xs text-gray-400">
              Référence : {error.digest}
            </p>
          )}
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          <RefreshCw size={16} /> Réessayer
        </button>
      </body>
    </html>
  );
}
