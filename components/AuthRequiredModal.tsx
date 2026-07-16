// components/AuthRequiredModal.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, X } from "lucide-react";

interface AuthRequiredModalProps {
  open: boolean;
  onClose: () => void;
  message?: string;
}

export function AuthRequiredModal({
  open,
  onClose,
  message = "Connectez-vous pour continuer.",
}: AuthRequiredModalProps) {
  const pathname = usePathname();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Fermer"
        >
          <X size={16} />
        </button>

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
          <LogIn size={24} className="text-gray-700" />
        </div>

        <h2 className="text-base font-semibold text-gray-900">
          Connexion requise
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">{message}</p>

        <div className="mt-6 flex flex-col gap-2">
          <Link
            href={`/login?redirect=${encodeURIComponent(pathname || "/")}`}
            onClick={onClose}
            className="flex items-center justify-center rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Se connecter
          </Link>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-md border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
