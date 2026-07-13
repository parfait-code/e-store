// app/admin/dashboard/page.tsx
"use client";

import { useState } from "react";
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
  Loader2,
  RotateCcw,
  Star,
  XCircle,
  Clock,
  UserPlus,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  useDashboardStats,
  useSalesChart,
} from "@/lib/queries/admin/useDashboard";
import type { OrderStatus, ProductStatus, Role } from "@/lib/types";

function formatXAF(amount: number) {
  return (
    new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(
      amount,
    ) + " XAF"
  );
}

const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  DRAFT: "Brouillon",
  ACTIVE: "Actif",
  ARCHIVED: "Archivé",
};

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  PROCESSING: "En traitement",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
};

const ROLE_LABELS: Record<Role, string> = {
  USER: "Utilisateurs",
  ADMIN: "Admins",
  MANAGER: "Managers",
  SUPPORT: "Support",
};

function TrendBadge({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span
      className={`flex items-center gap-1 text-xs font-medium ${positive ? "text-green-600" : "text-red-600"}`}
    >
      {positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
      {Math.abs(value)}%
    </span>
  );
}

function BreakdownChips({
  data,
  labels,
}: {
  data: Record<string, number>;
  labels: Record<string, string>;
}) {
  const entries = Object.entries(data).filter(([, v]) => v > 0);
  if (entries.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-gray-100 pt-3">
      {entries.map(([key, value]) => (
        <span
          key={key}
          className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
        >
          {labels[key] ?? key} : <span className="font-medium">{value}</span>
        </span>
      ))}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  subValue,
  breakdown,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  trend?: number;
  subValue?: string;
  breakdown?: React.ReactNode;
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
      {subValue && <p className="mt-0.5 text-xs text-gray-400">{subValue}</p>}
      {breakdown}
    </div>
  );
}

function SalesChart() {
  const [year, setYear] = useState(new Date().getFullYear());
  const { data, isLoading, isError } = useSalesChart(year);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium">Ventes mensuelles</h2>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="rounded-md border border-gray-300 px-2 py-1 text-sm outline-none focus:border-gray-900"
        >
          {[year, year - 1, year - 2].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 size={20} className="animate-spin text-gray-400" />
        </div>
      ) : isError || !data ? (
        <p className="text-sm text-red-600">Erreur de chargement</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data.points}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <Tooltip
              formatter={(value) => {
                const formattedValue =
                  typeof value === "number"
                    ? `${new Intl.NumberFormat("fr-FR").format(value)} XAF`
                    : (value ?? "");
                return [formattedValue, "Revenu"];
              }}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#111827"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading, isError } = useDashboardStats();

  if (isLoading) {
    return (
      <p className="text-sm text-gray-500">Chargement du tableau de bord...</p>
    );
  }

  if (isError || !stats) {
    return (
      <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
        Impossible de charger les statistiques.
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
          breakdown={
            <BreakdownChips
              data={stats.orders.byStatus}
              labels={ORDER_STATUS_LABELS}
            />
          }
        />
        <StatCard
          icon={Wallet}
          label="Revenu ce mois"
          value={formatXAF(stats.payments.totalAmountThisMonth)}
          trend={stats.payments.trend}
          subValue={`Total cumulé : ${formatXAF(stats.payments.totalAmountAllTime)}`}
          breakdown={
            stats.payments.pendingCodCount > 0 ? (
              <BreakdownChips
                data={{ pendingCod: stats.payments.pendingCodCount }}
                labels={{ pendingCod: "Paiements à la livraison en attente" }}
              />
            ) : undefined
          }
        />
        <StatCard
          icon={Package}
          label={`Produits (+${stats.products.addedThisMonth} ce mois)`}
          value={stats.products.total}
          breakdown={
            <BreakdownChips
              data={stats.products.byStatus}
              labels={PRODUCT_STATUS_LABELS}
            />
          }
        />
        <StatCard
          icon={Users}
          label={`Utilisateurs actifs (/ ${stats.users.total})`}
          value={stats.users.active}
          subValue={`+${stats.users.newThisMonth} nouveaux ce mois`}
          breakdown={
            <BreakdownChips data={stats.users.byRole} labels={ROLE_LABELS} />
          }
        />
        <StatCard
          icon={AlertTriangle}
          label="Stock faible"
          value={stats.inventory.lowStockCount}
          breakdown={
            stats.inventory.outOfStockCount > 0 ? (
              <BreakdownChips
                data={{ outOfStock: stats.inventory.outOfStockCount }}
                labels={{ outOfStock: "En rupture" }}
              />
            ) : undefined
          }
        />
        <StatCard
          icon={Truck}
          label="Expéditions en cours"
          value={stats.shipments.inProgress}
          trend={stats.shipments.trend}
          breakdown={
            stats.shipments.pendingPickupRequests > 0 ? (
              <BreakdownChips
                data={{
                  pendingPickup: stats.shipments.pendingPickupRequests,
                }}
                labels={{ pendingPickup: "Enlèvements en attente" }}
              />
            ) : undefined
          }
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
        <StatCard
          icon={RotateCcw}
          label={`Retours (${stats.returns.thisMonth} ce mois)`}
          value={stats.returns.pending}
          subValue="En attente de traitement"
        />
        <StatCard
          icon={Star}
          label={`Avis clients (${stats.reviews.total} au total)`}
          value={stats.reviews.averageRating.toFixed(1)}
          subValue="Note moyenne"
        />
      </div>

      <div className="mt-6">
        <SalesChart />
      </div>
    </div>
  );
}