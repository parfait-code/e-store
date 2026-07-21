// app/admin/orders/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { formatXAF, formatDate } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";
import {
  useAdminOrders,
  useExpireStaleOrders,
} from "@/lib/queries/admin/useOrders";
import { ApiError } from "@/lib/api-client";
import { TableRowsSkeleton } from "@/components/admin/TableSkeleton";
import {
  useConfirmDialog,
  useAlertDialog,
} from "@/components/admin/ModalProvider";

const STATUS_OPTIONS: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-gray-100 text-gray-600",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-amber-100 text-amber-700",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  PROCESSING: "En traitement",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
};

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerInput, setCustomerInput] = useState("");
  const confirm = useConfirmDialog();
  const alertDialog = useAlertDialog();

  const { mutate: expireStale, isPending: isExpiring } = useExpireStaleOrders();

  const { data, isLoading, isError } = useAdminOrders({
    page,
    status,
    customer: customerEmail,
  });
  const orders = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setCustomerEmail(customerInput.trim());
  }

  async function handleExpireStale() {
    const ok = await confirm({
      title: "Expirer les commandes en attente",
      message:
        "Forcer l'annulation des commandes PENDING non payées dépassant le délai configuré ?",
    });
    if (!ok) return;
    expireStale(undefined, {
      onSuccess: (res) =>
        alertDialog(
          res.cancelledCount !== undefined
            ? `${res.cancelledCount} commande(s) annulée(s).`
            : "Vérification terminée.",
        ),
      onError: (err) =>
        alertDialog(
          err instanceof ApiError ? err.message : "Erreur lors de l'opération",
        ),
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Commandes</h1>
          <p className="text-sm text-gray-500">{total} commande(s) au total</p>
        </div>
        <button
          onClick={handleExpireStale}
          disabled={isExpiring}
          className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          {isExpiring ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <RefreshCw size={16} />
          )}
          Expirer les commandes en attente
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Rechercher par email client..."
            value={customerInput}
            onChange={(e) => setCustomerInput(e.target.value)}
            className="w-72 rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
          />
        </form>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as OrderStatus | "");
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
              <th className="px-4 py-3">Commande</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Articles</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableRowsSkeleton rows={8} columns={7} />
            ) : orders.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  Aucune commande trouvée.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                // totalAmount est le SEUL montant réellement payé (produits
                // remisés + livraison) — discountedAmount n'est qu'une
                // économie informative, jamais un montant à afficher comme
                // "total" ni à soustraire d'un prix "original".
                const hasSavings =
                  order.discountedAmount !== null && order.discountedAmount > 0;
                return (
                  <tr
                    key={order.id}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="px-4 py-3 font-medium">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      <Link
                        href={`/admin/users/${order.userId}`}
                        className="hover:underline"
                      >
                        #{order.userId.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {order.items.length}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {formatXAF(order.totalAmount)}
                      </div>
                      {hasSavings && (
                        <div className="text-xs text-green-600">
                          Économie : {formatXAF(order.discountedAmount!)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[order.status]}`}
                      >
                        {STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="flex items-center justify-end rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                      >
                        <Eye size={16} />
                      </Link>
                    </td>
                  </tr>
                );
              })
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
