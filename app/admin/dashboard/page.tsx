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
} from "lucide-react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
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

// Palettes dédiées aux graphiques (indépendantes des classes Tailwind
// utilisées pour les badges, recharts a besoin de couleurs hexadécimales).
const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "#9ca3af",
  CONFIRMED: "#3b82f6",
  PROCESSING: "#6366f1",
  SHIPPED: "#a855f7",
  DELIVERED: "#22c55e",
  CANCELLED: "#ef4444",
  REFUNDED: "#f59e0b",
};

const PRODUCT_STATUS_COLORS: Record<ProductStatus, string> = {
  DRAFT: "#9ca3af",
  ACTIVE: "#22c55e",
  ARCHIVED: "#f59e0b",
};

const ROLE_COLORS: Record<Role, string> = {
  USER: "#9ca3af",
  ADMIN: "#ef4444",
  MANAGER: "#3b82f6",
  SUPPORT: "#a855f7",
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

function StatCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="h-9 w-9 animate-pulse rounded-md bg-gray-200" />
        <div className="h-4 w-10 animate-pulse rounded bg-gray-100" />
      </div>
      <div className="h-7 w-20 animate-pulse rounded bg-gray-200" />
      <div className="mt-2 h-4 w-32 animate-pulse rounded bg-gray-100" />
      <div className="mt-1 h-3 w-24 animate-pulse rounded bg-gray-100" />
    </div>
  );
}

function ChartCardSkeleton({ height = 140 }: { height?: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="mb-3 h-4 w-32 animate-pulse rounded bg-gray-200" />
      <div
        className="w-full animate-pulse rounded bg-gray-100"
        style={{ height }}
      />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div>
      <div className="mb-6 h-6 w-48 animate-pulse rounded bg-gray-200" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-8 w-20 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="h-64 w-full animate-pulse rounded bg-gray-100" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCardSkeleton />
        <ChartCardSkeleton />
        <ChartCardSkeleton />
      </div>
    </div>
  );
}

function SalesChart() {
  const [year, setYear] = useState(new Date().getFullYear());
  const { data, isLoading, isError } = useSalesChart(year);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium">Ventes mensuelles</h2>
          <p className="text-xs text-gray-400">
            Revenu (ligne) et nombre de commandes (barres)
          </p>
        </div>
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
          <ComposedChart data={data.points}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <YAxis yAxisId="amount" tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <YAxis
              yAxisId="count"
              orientation="right"
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
              allowDecimals={false}
            />
            <Tooltip
              formatter={(value, name) => {
                if (name === "amount") {
                  return [
                    `${new Intl.NumberFormat("fr-FR").format(Number(value))} XAF`,
                    "Revenu",
                  ];
                }
                return [value, "Commandes"];
              }}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Bar
              yAxisId="count"
              dataKey="orderCount"
              fill="#e5e7eb"
              radius={[4, 4, 0, 0]}
              barSize={18}
            />
            <Line
              yAxisId="amount"
              type="monotone"
              dataKey="amount"
              stroke="#111827"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function StatusDonut<K extends string>({
  title,
  data,
  labels,
  colors,
}: {
  title: string;
  data: Record<K, number>;
  labels: Record<K, string>;
  colors: Record<K, string>;
}) {
  const entries = (Object.entries(data) as [K, number][]).filter(
    ([, v]) => v > 0,
  );
  const total = entries.reduce((sum, [, v]) => sum + v, 0);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="mb-3 text-sm font-medium">{title}</h2>
      {entries.length === 0 ? (
        <p className="text-xs text-gray-400">Aucune donnée pour l'instant.</p>
      ) : (
        <div className="flex items-center gap-4">
          <ResponsiveContainer width={110} height={110}>
            <PieChart>
              <Pie
                data={entries.map(([key, value]) => ({ key, value }))}
                dataKey="value"
                nameKey="key"
                innerRadius={32}
                outerRadius={50}
                paddingAngle={2}
                stroke="none"
              >
                {entries.map(([key]) => (
                  <Cell key={key} fill={colors[key]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, _name, item) => [
                  value,
                  labels[item.payload.key as K],
                ]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-1.5">
            {entries.map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between gap-2 text-xs"
              >
                <span className="flex items-center gap-1.5 text-gray-600">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: colors[key] }}
                  />
                  {labels[key]}
                </span>
                <span className="font-medium text-gray-900">
                  {value}
                  <span className="ml-1 text-gray-400">
                    ({total > 0 ? Math.round((value / total) * 100) : 0}%)
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InventoryBarChart({
  lowStock,
  outOfStock,
}: {
  lowStock: number;
  outOfStock: number;
}) {
  const data = [
    { name: "Stock faible", value: lowStock, fill: "#f59e0b" },
    { name: "Rupture", value: outOfStock, fill: "#ef4444" },
  ];
  const hasData = lowStock > 0 || outOfStock > 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
        <AlertTriangle size={15} className="text-amber-500" /> État du stock
      </h2>
      {!hasData ? (
        <p className="text-xs text-gray-400">
          Tous les articles ont un stock suffisant.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={110}>
          <ComposedChart data={data} layout="vertical" margin={{ left: 8 }}>
            <XAxis type="number" hide allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="name"
              width={80}
              tick={{ fontSize: 12 }}
              stroke="#9ca3af"
            />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={22}>
              {data.map((d) => (
                <Cell key={d.name} fill={d.fill} />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function RatingGauge({ rating, total }: { rating: number; total: number }) {
  const data = [{ value: rating, fill: "#f59e0b" }];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
        <Star size={15} className="text-amber-500" /> Note moyenne
      </h2>
      <div className="flex items-center gap-4">
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
          <ResponsiveContainer width={96} height={96}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="100%"
              barSize={9}
              data={data}
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 5]}
                angleAxisId={0}
                tick={false}
              />
              <RadialBar
                background={{ fill: "#f3f4f6" }}
                dataKey="value"
                cornerRadius={8}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <span className="absolute text-lg font-semibold text-gray-900">
            {rating.toFixed(1)}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          Sur <span className="font-medium text-gray-900">5</span>, basé sur{" "}
          <span className="font-medium text-gray-900">{total}</span> avis
          client.
        </div>
      </div>
    </div>
  );
}

function CouponShareBar({
  couponRevenue,
  totalRevenue,
  couponUsage,
}: {
  couponRevenue: number;
  totalRevenue: number;
  couponUsage: number;
}) {
  const pct =
    totalRevenue > 0
      ? Math.min(100, Math.round((couponRevenue / totalRevenue) * 100))
      : 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
        <Tag size={15} className="text-gray-500" /> Part du revenu via coupons
      </h2>
      <p className="mb-3 text-2xl font-semibold">{pct}%</p>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-gray-900 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-3 text-xs text-gray-500">
        {formatXAF(couponRevenue)} sur {formatXAF(totalRevenue)} de revenu ce
        mois · {couponUsage} coupon(s) utilisé(s)
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading, isError } = useDashboardStats();

  if (isLoading) return <DashboardSkeleton />;

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
        />
        <StatCard
          icon={Users}
          label={`Utilisateurs actifs (/ ${stats.users.total})`}
          value={stats.users.active}
          subValue={`+${stats.users.newThisMonth} nouveaux ce mois`}
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

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">
          Répartitions
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <StatusDonut
            title="Commandes par statut"
            data={stats.orders.byStatus}
            labels={ORDER_STATUS_LABELS}
            colors={ORDER_STATUS_COLORS}
          />
          <StatusDonut
            title="Produits par statut"
            data={stats.products.byStatus}
            labels={PRODUCT_STATUS_LABELS}
            colors={PRODUCT_STATUS_COLORS}
          />
          <StatusDonut
            title="Utilisateurs par rôle"
            data={stats.users.byRole}
            labels={ROLE_LABELS}
            colors={ROLE_COLORS}
          />
        </div>
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">
          Aperçu opérationnel
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <InventoryBarChart
            lowStock={stats.inventory.lowStockCount}
            outOfStock={stats.inventory.outOfStockCount}
          />
          <RatingGauge
            rating={stats.reviews.averageRating}
            total={stats.reviews.total}
          />
          <CouponShareBar
            couponRevenue={stats.promotions.revenueFromCouponsThisMonth}
            totalRevenue={stats.payments.totalAmountThisMonth}
            couponUsage={stats.promotions.couponUsageThisMonth}
          />
        </div>
      </div>
    </div>
  );
}
