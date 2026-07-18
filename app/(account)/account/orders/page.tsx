// app/(account)/account/orders/page.tsx
"use client";

import Link from "next/link";
import { Package, ChevronRight } from "lucide-react";
import { formatXAF, formatDate } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";
import { useMyOrders } from "@/lib/queries/shop/useOrders";

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

function OrderRowSkeleton() {
  return (
    <div className="flex items-center justify-between px-4 py-4">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 animate-pulse rounded-md bg-gray-200" />
        <div>
          <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-3 w-36 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
        <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200" />
        <div className="h-4 w-4 animate-pulse rounded bg-gray-100" />
      </div>
    </div>
  );
}

export default function OrdersHistoryPage() {
  const { data, isLoading, isError } = useMyOrders();
  const orders = data?.items ?? [];

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Mes commandes</h1>

      {isError && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          Erreur de chargement
        </div>
      )}

      {isLoading ? (
        <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
          {Array.from({ length: 5 }).map((_, i) => (
            <OrderRowSkeleton key={i} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <p className="text-sm text-gray-400">
          Vous n'avez pas encore passé de commande.
        </p>
      ) : (
        <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="flex items-center justify-between px-4 py-4 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <Package size={16} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium">#{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(order.createdAt)} · {order.items.length}{" "}
                    article(s)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">
                  {formatXAF(order.totalAmount)}
                </span>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[order.status]}`}
                >
                  {STATUS_LABELS[order.status]}
                </span>
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
