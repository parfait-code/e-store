// components/PopupDisplay.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useActivePopups } from "@/lib/queries/shop/usePopups";
import { hasBeenSeen, markAsSeen } from "@/lib/popups/storage";
import type { PopupWithResolvedUrl } from "@/lib/types";

function isInternalUrl(url: string) {
  return url.startsWith("/");
}

export function PopupDisplay() {
  const { data: popups = [] } = useActivePopups();
  const [popupToShow, setPopupToShow] = useState<PopupWithResolvedUrl | null>(
    null,
  );

  useEffect(() => {
    if (popups.length === 0) return;
    // L'API trie déjà par priorité décroissante puis createdAt décroissant —
    // on prend le premier qui n'a pas déjà été vu selon sa fréquence.
    const next = popups.find((p) => !hasBeenSeen(p.id, p.displayFrequency));
    if (next) {
      setPopupToShow(next);
      markAsSeen(next.id, next.displayFrequency);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popups]);

  if (!popupToShow) return null;

  function handleClose() {
    setPopupToShow(null);
  }

  const hasLink =
    popupToShow.targetType !== "INFO" && Boolean(popupToShow.resolvedUrl);
  const ctaLabel = popupToShow.ctaLabel ?? "Découvrir";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          aria-label="Fermer"
        >
          <X size={16} />
        </button>

        {popupToShow.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={popupToShow.imageUrl}
            alt={popupToShow.title}
            className="h-48 w-full object-cover"
          />
        )}

        <div className="p-5">
          <h2 className="text-lg font-semibold text-gray-900">
            {popupToShow.title}
          </h2>
          {popupToShow.message && (
            <p className="mt-2 text-sm text-gray-600">{popupToShow.message}</p>
          )}

          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={handleClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Fermer
            </button>
            {hasLink &&
              (isInternalUrl(popupToShow.resolvedUrl!) ? (
                <Link
                  href={popupToShow.resolvedUrl!}
                  onClick={handleClose}
                  className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  {ctaLabel}
                </Link>
              ) : (
                <a
                  href={popupToShow.resolvedUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleClose}
                  className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  {ctaLabel}
                </a>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
