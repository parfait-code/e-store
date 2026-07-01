// app/admin/returns/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Eye,
} from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import type { ReturnRequest, ReturnStatus, Paginated } from "@/lib/types";

const STATUS_OPTIONS: ReturnStatus[] = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "COMPLETED",
];

const STATUS_STYLES: Record<ReturnStatus, string> = {
  PENDING: "bg-gray-100 text-gray-600",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  COMPLETED: "bg-blue-100 text-blue-700",
};

const STATUS_LABELS: Record<ReturnStatus, string> = {
  PENDING: "En attente",
  APPROVED: "Approuvé",
  REJECTED: "Rejeté",
  COMPLETED: "Terminé",
};

export default function ReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<ReturnStatus | "">("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReturns = useCallback(() => {
    setIsLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (status) params.set("status", status);

    apiClient
      .get<Paginated<ReturnRequest>>(`/returns?${params.toString()}`)
      .then((res) => {
        setReturns(res.items);
        setTotalPages(res.totalPages);
        setTotal(res.total);
      })
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Erreur de chargement",
        ),
      )
      .finally(() => setIsLoading(false));
  }, [page, status]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Retours</h1>
        <p className="text-sm text-gray-500">{total} demande(s) de retour</p>
      </div>

      <div className="mb-4">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as ReturnStatus | "");
            setPage(1);
          }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
        >
          <option value="">Tous les statuts</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
              <th className="px-4 py-3">Retour</th>
              <th className="px-4 py-3">Commande</th>
              <th className="px-4 py-3">Raison</th>
              <th className="px-4 py-3">Articles</th>
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
            ) : returns.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  Aucune demande de retour.
                </td>
              </tr>
            ) : (
              returns.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <RotateCcw size={14} className="text-gray-400" />
                      <span className="font-medium">#{r.id.slice(0, 8)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    #{r.orderId.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{r.reason}</td>
                  <td className="px-4 py-3 text-gray-500">{r.items.length}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[r.status]}`}
                    >
                      {STATUS_LABELS[r.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/returns/${r.id}`}
                      className="flex items-center justify-end rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    >
                      <Eye size={16} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Page {page} sur {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 disabled:opacity-40"
            >
              <ChevronLeft size={14} /> Précédent
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 disabled:opacity-40"
            >
              Suivant <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
