// app/admin/promotions/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Loader2, Pencil, Trash2, Power, TagIcon } from "lucide-react";
import { ApiError } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import type { PromotionStatus } from "@/lib/types";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  useAdminPromotions,
  useTogglePromotion,
  useDeletePromotion,
} from "@/lib/queries/admin/usePromotions";

const STATUS_OPTIONS: PromotionStatus[] = [
  "SCHEDULED",
  "ACTIVE",
  "EXPIRED",
  "CANCELLED",
];

const STATUS_STYLES: Record<PromotionStatus, string> = {
  SCHEDULED: "bg-blue-100 text-blue-700",
  ACTIVE: "bg-green-100 text-green-700",
  EXPIRED: "bg-gray-100 text-gray-500",
  CANCELLED: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<PromotionStatus, string> = {
  SCHEDULED: "Programmée",
  ACTIVE: "Active",
  EXPIRED: "Expirée",
  CANCELLED: "Annulée",
};

export default function PromotionsPage() {
  const [status, setStatus] = useState<PromotionStatus | "">("");
  const [isActive, setIsActive] = useState<"" | "true" | "false">("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { data, isLoading, isError } = useAdminPromotions({ status, isActive });
  // `data?.items` garantit toujours un tableau — même si l'API renvoyait un
  // format inattendu, `adminPromotionsApi.list` l'a déjà normalisé en amont.
  const promotions = data?.items ?? [];

  const {
    mutate: togglePromotion,
    isPending: isToggling,
    variables: togglingId,
  } = useTogglePromotion();
  const { mutate: deletePromotion, isPending: isDeleting } =
    useDeletePromotion();

  function confirmDelete() {
    if (!confirmDeleteId) return;
    deletePromotion(confirmDeleteId, {
      onError: (err) =>
        alert(err instanceof ApiError ? err.message : "Suppression impossible"),
      onSettled: () => setConfirmDeleteId(null),
    });
  }

  const selectClass =
    "rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Promotions</h1>
          <p className="text-sm text-gray-500">
            {promotions.length} promotion(s)
          </p>
        </div>
        <Link
          href="/admin/promotions/new"
          className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          <Plus size={16} />
          Nouvelle promotion
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as PromotionStatus | "")}
          className={selectClass}
        >
          <option value="">Tous les statuts</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select
          value={isActive}
          onChange={(e) => setIsActive(e.target.value as "" | "true" | "false")}
          className={selectClass}
        >
          <option value="">Actif ou non</option>
          <option value="true">Actives</option>
          <option value="false">Inactives</option>
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
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Période</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Remises</th>
              <th className="px-4 py-3">Coupons</th>
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
            ) : promotions.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  Aucune promotion.
                </td>
              </tr>
            ) : (
              promotions.map((promo) => (
                <tr
                  key={promo.id}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <TagIcon size={14} className="text-gray-400" />
                      <span className="font-medium">{promo.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDate(promo.startDate)} → {formatDate(promo.endDate)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[promo.status]}`}
                    >
                      {STATUS_LABELS[promo.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {promo.discounts.length}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {promo.coupons.length}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => togglePromotion(promo.id)}
                        disabled={isToggling && togglingId === promo.id}
                        title={promo.isActive ? "Désactiver" : "Activer"}
                        className={`rounded-md p-1.5 hover:bg-gray-100 disabled:opacity-50 ${
                          promo.isActive ? "text-green-600" : "text-gray-400"
                        }`}
                      >
                        {isToggling && togglingId === promo.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Power size={16} />
                        )}
                      </button>
                      <Link
                        href={`/admin/promotions/${promo.id}`}
                        className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        onClick={() => setConfirmDeleteId(promo.id)}
                        disabled={isDeleting}
                        className="rounded-md p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        {isDeleting && confirmDeleteId === promo.id ? (
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
        title="Supprimer la promotion"
        message="Cette action est irréversible. Voulez-vous vraiment continuer ?"
        confirmLabel="Supprimer"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
