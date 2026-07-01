// app/admin/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Package,
  ShoppingCart,
  Users,
  Wallet,
  AlertTriangle,
  Truck,
  Tag,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import type { DashboardStats } from "@/lib/types";

function formatXAF(amount: number) {
  return (
    new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(
      amount,
    ) + " XAF"
  );
}

function TrendBadge({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span
      className={`flex items-center gap-1 text-xs font-medium ${
        positive ? "text-green-600" : "text-red-600"
      }`}
    >
      {positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
      {Math.abs(value)}%
    </span>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  trend?: number;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="rounded-md bg-gray-100 p-2">
          <Icon size={18} className="text-gray-700" />
        </div>
        {trend !== undefined && <TrendBadge value={trend} />}
      </div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<DashboardStats>("/dashboard/stats")
      .then(setStats)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Erreur de chargement",
        ),
      )
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <p className="text-sm text-gray-500">Chargement du tableau de bord...</p>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
        {error ?? "Impossible de charger les statistiques."}
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Tableau de bord</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={ShoppingCart}
          label={`Commandes ce mois (${stats.orders.total} total)`}
          value={stats.orders.thisMonth}
          trend={stats.orders.trend}
        />
        <StatCard
          icon={Wallet}
          label="Revenu ce mois"
          value={formatXAF(stats.payments.totalAmountThisMonth)}
          trend={stats.payments.trend}
        />
        <StatCard
          icon={Package}
          label={`Produits (+${stats.products.addedThisMonth} ce mois)`}
          value={stats.products.total}
        />
        <StatCard
          icon={Users}
          label={`Utilisateurs actifs (/ ${stats.users.total})`}
          value={stats.users.active}
        />
        <StatCard
          icon={AlertTriangle}
          label="Stock faible"
          value={stats.inventory.lowStockCount}
        />
        <StatCard
          icon={Truck}
          label="Expéditions en cours"
          value={stats.shipments.inProgress}
          trend={stats.shipments.trend}
        />
        <StatCard
          icon={Tag}
          label={`Promotions actives (${stats.promotions.couponUsageThisMonth} coupons utilisés)`}
          value={stats.promotions.active}
        />
        <StatCard
          icon={Wallet}
          label="Revenu via coupons ce mois"
          value={formatXAF(stats.promotions.revenueFromCouponsThisMonth)}
        />
      </div>
    </div>
  );
}
