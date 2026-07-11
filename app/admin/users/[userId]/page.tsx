// app/admin/users/[userId]/page.tsx
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
} from "lucide-react";
import { formatXAF, formatDate } from "@/lib/format";
import type { Order } from "@/lib/types";
import { useAdminUser, useAdminUserOrders } from "@/lib/queries/admin/useUsers";

const STATUS_STYLES: Record<Order["status"], string> = {
  PENDING: "bg-gray-100 text-gray-600",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-amber-100 text-amber-700",
};

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const { data: user, isLoading, isError } = useAdminUser(userId);
  const { data: ordersData } = useAdminUserOrders(userId);
  const orders = ordersData?.items ?? [];

  if (isLoading)
    return <Loader2 size={20} className="animate-spin text-gray-400" />;
  if (isError || !user) {
    return (
      <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
        Utilisateur introuvable.
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/users"
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft size={14} /> Retour aux utilisateurs
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-sm text-gray-500">@{user.username}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            user.isActive
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {user.isActive ? "Actif" : "Inactif"}
        </span>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-white p-4 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Mail size={14} /> {user.email}
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Phone size={14} /> {user.phone ?? "—"}
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar size={14} /> Inscrit le {formatDate(user.createdAt)}
        </div>
        <div className="text-gray-600">
          Rôle : <span className="font-medium">{user.role}</span>
        </div>
      </div>

      <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
        <ShoppingBag size={16} /> Commandes récentes
      </h2>
      {orders.length === 0 ? (
        <p className="text-sm text-gray-400">Aucune commande.</p>
      ) : (
        <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50"
            >
              <div>
                <p className="font-medium">#{order.id.slice(0, 8)}</p>
                <p className="text-xs text-gray-500">
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span>
                  {formatXAF(order.discountedAmount ?? order.totalAmount)}
                </span>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[order.status]}`}
                >
                  {order.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
