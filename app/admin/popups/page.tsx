// app/admin/popups/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  MessageSquarePlus,
  ExternalLink,
} from "lucide-react";
import { ApiError } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import type { PopupTargetType } from "@/lib/types";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  useAdminPopups,
  useUpdatePopup,
  useDeletePopup,
} from "@/lib/queries/admin/usePopups";
import { useAlertDialog } from "@/components/admin/ModalProvider";

const TARGET_OPTIONS: PopupTargetType[] = [
  "PROMOTION",
  "CATEGORY",
  "PRODUCT",
  "INFO",
  "EXTERNAL_LINK",
];

const TARGET_LABELS: Record<PopupTargetType, string> = {
  PROMOTION: "Promotion",
  CATEGORY: "Catégorie",
  PRODUCT: "Produit",
  INFO: "Information",
  EXTERNAL_LINK: "Lien externe",
};

function ActiveToggle({
  popupId,
  isActive,
}: {
  popupId: string;
  isActive: boolean;
}) {
  const { mutate: updatePopup, isPending } = useUpdatePopup(popupId);

  return (
    <button
      onClick={() => updatePopup({ isActive: !isActive })}
      disabled={isPending}
      className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium disabled:opacity-50 ${
        isActive
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      }`}
    >
      {isPending ? (
        <Loader2 size={12} className="animate-spin" />
      ) : isActive ? (
        "Actif"
      ) : (
        "Inactif"
      )}
    </button>
  );
}

export default function PopupsPage() {
  const [isActive, setIsActive] = useState<"" | "true" | "false">("");
  const [targetType, setTargetType] = useState<PopupTargetType | "">("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const alertDialog = useAlertDialog();

  const {
    data: popups = [],
    isLoading,
    isError,
  } = useAdminPopups({
    isActive,
    targetType,
  });
  const { mutate: deletePopup, isPending: isDeleting } = useDeletePopup();

  function confirmDelete() {
    if (!confirmDeleteId) return;
    deletePopup(confirmDeleteId, {
      onError: (err) =>
        alertDialog(
          err instanceof ApiError ? err.message : "Suppression impossible",
        ),
      onSettled: () => setConfirmDeleteId(null),
    });
  }

  const selectClass =
    "rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Popups</h1>
          <p className="text-sm text-gray-500">{popups.length} popup(s)</p>
        </div>
        <Link
          href="/admin/popups/new"
          className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          <Plus size={16} />
          Nouveau popup
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <select
          value={isActive}
          onChange={(e) => setIsActive(e.target.value as "" | "true" | "false")}
          className={selectClass}
        >
          <option value="">Actif ou non</option>
          <option value="true">Actifs</option>
          <option value="false">Inactifs</option>
        </select>
        <select
          value={targetType}
          onChange={(e) =>
            setTargetType(e.target.value as PopupTargetType | "")
          }
          className={selectClass}
        >
          <option value="">Tous les types</option>
          {TARGET_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {TARGET_LABELS[t]}
            </option>
          ))}
        </select>
      </div>

      {isError && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          Erreur de chargement
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
              <th className="px-4 py-3">Titre</th>
              <th className="px-4 py-3">Cible</th>
              <th className="px-4 py-3">Fenêtre d'affichage</th>
              <th className="px-4 py-3">Priorité</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  <Loader2 size={20} className="mx-auto animate-spin" />
                </td>
              </tr>
            ) : popups.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  Aucun popup.
                </td>
              </tr>
            ) : (
              popups.map((popup) => (
                <tr
                  key={popup.id}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <MessageSquarePlus size={14} className="text-gray-400" />
                      <span className="font-medium">{popup.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    <span className="flex items-center gap-1">
                      {TARGET_LABELS[popup.targetType]}
                      {popup.targetType === "EXTERNAL_LINK" && (
                        <ExternalLink size={12} className="text-gray-400" />
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {popup.startDate ? formatDate(popup.startDate) : "—"}
                    {" → "}
                    {popup.endDate ? formatDate(popup.endDate) : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{popup.priority}</td>
                  <td className="px-4 py-3">
                    <ActiveToggle
                      popupId={popup.id}
                      isActive={popup.isActive}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/popups/${popup.id}`}
                        className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        onClick={() => setConfirmDeleteId(popup.id)}
                        disabled={isDeleting}
                        className="rounded-md p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        {isDeleting && confirmDeleteId === popup.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Supprimer le popup"
        message="Cette action est irréversible. Voulez-vous vraiment continuer ?"
        confirmLabel="Supprimer"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
