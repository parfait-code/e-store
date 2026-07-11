// app/admin/shipments/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, ChevronLeft, ChevronRight, Truck, Eye } from "lucide-react";
import type { ShipmentStatus } from "@/lib/types";
import { useAdminShipments } from "@/lib/queries/admin/useShipments";

const STATUS_OPTIONS: ShipmentStatus[] = [
  "PENDING",
  "IN_TRANSIT",
  "DELIVERED",
  "CANCELLED",
];

const STATUS_STYLES: Record<ShipmentStatus, string> = {
  PENDING: "bg-gray-100 text-gray-600",
  IN_TRANSIT: "bg-blue-100 text-blue-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<ShipmentStatus, string> = {
  PENDING: "En attente",
  IN_TRANSIT: "En transit",
  DELIVERED: "Livré",
  CANCELLED: "Annulé",
};

export default function ShipmentsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<ShipmentStatus | "">("");
  const [orderIdInput, setOrderIdInput] = useState("");
  const [orderId, setOrderId] = useState("");

  const { data, isLoading, isError } = useAdminShipments({
    page,
    status,
    orderId,
  });
  const shipments = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setOrderId(orderIdInput.trim());
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Expéditions</h1>
        <p className="text-sm text-gray-500">{total} expédition(s)</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="ID commande..."
            value={orderIdInput}
            onChange={(e) => setOrderIdInput(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
          />
        </form>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as ShipmentStatus | "");
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

      {isError && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          Erreur de chargement
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
              <th className="px-4 py-3">Suivi</th>
              <th className="px-4 py-3">Destinataire</th>
              <th className="px-4 py-3">Commande</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  <Loader2 size={20} className="mx-auto animate-spin" />
                </td>
              </tr>
            ) : shipments.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  Aucune expédition.
                </td>
              </tr>
            ) : (
              shipments.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Truck size={14} className="text-gray-400" />
                      <span className="font-mono text-xs">
                        {s.trackingNumber ?? "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{s.recipientName}</p>
                    <p className="text-xs text-gray-500">
                      {s.recipientAddress}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {s.orderId ? `#${s.orderId.slice(0, 8)}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[s.status]}`}
                    >
                      {STATUS_LABELS[s.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/shipments/${s.id}`}
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
