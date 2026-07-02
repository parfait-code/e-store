// app/(account)/account/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Package, ChevronRight } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { formatXAF, formatDate } from "@/lib/format";
import type { Order, OrderStatus, Paginated } from "@/lib/types";

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-gray-100 text-gray-600",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-amber-100 text-amber-700",
};

export default function OrdersHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<Paginated<Order>>("/orders?limit=50")
      .then((res) => setOrders(res.items))
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Erreur de chargement",
        ),
      )
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Mes commandes</h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <Loader2 size={20} className="animate-spin text-gray-400" />
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
                  {formatXAF(order.discountedAmount ?? order.totalAmount)}
                </span>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[order.status]}`}
                >
                  {order.status}
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
