// app/(account)/account/loyalty/page.tsx
"use client";

import Link from "next/link";
import { ArrowLeft, Coins, Sparkles } from "lucide-react";
import { formatDate } from "@/lib/format";
import { useAuth } from "@/lib/auth/auth-context";
import type { LoyaltyTransactionType } from "@/lib/types";
import {
  useMyLoyaltyBalance,
  useMyLoyaltyHistory,
} from "@/lib/queries/shop/useLoyalty";

const TYPE_LABELS: Record<LoyaltyTransactionType, string> = {
  EARNED: "Gagné",
  REDEEMED: "Utilisé",
  EXPIRED: "Expiré",
  ADJUSTED: "Ajusté",
};

const TYPE_STYLES: Record<LoyaltyTransactionType, string> = {
  EARNED: "text-emerald-600",
  REDEEMED: "text-red-600",
  EXPIRED: "text-gray-400",
  ADJUSTED: "text-blue-600",
};

function BalanceSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-amber-50 p-4">
      <div className="h-11 w-11 animate-pulse rounded-lg bg-amber-100" />
      <div>
        <div className="h-7 w-16 animate-pulse rounded bg-amber-100" />
        <div className="mt-2 h-3 w-24 animate-pulse rounded bg-amber-100" />
      </div>
    </div>
  );
}

function HistoryRowSkeleton() {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
      <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
    </div>
  );
}

export default function LoyaltyHistoryPage() {
  const { user } = useAuth();
  const { data: balanceRes, isLoading: isLoadingBalance } = useMyLoyaltyBalance(
    user?.id ?? null,
  );
  const { data: history = [], isLoading: isLoadingHistory } =
    useMyLoyaltyHistory(user?.id ?? null);

  return (
    <div className="max-w-2xl">
      <Link
        href="/account"
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft size={14} /> Retour à mon compte
      </Link>

      <div className="mb-6 flex items-center gap-2">
        <Sparkles size={18} className="text-amber-500" />
        <h1 className="text-xl font-semibold">Points fidélité</h1>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <div className="mb-6">
          {isLoadingBalance ? (
            <BalanceSkeleton />
          ) : (
            <div className="flex items-center gap-3 rounded-xl bg-amber-50 p-4">
              <div className="rounded-lg bg-amber-100 p-2">
                <Coins size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">
                  {balanceRes?.balance ?? 0}
                </p>
                <p className="text-xs text-gray-500">points disponibles</p>
              </div>
            </div>
          )}
        </div>

        <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
          Historique complet
        </h2>

        {isLoadingHistory ? (
          <div className="divide-y divide-gray-100">
            <HistoryRowSkeleton />
            <HistoryRowSkeleton />
            <HistoryRowSkeleton />
            <HistoryRowSkeleton />
          </div>
        ) : history.length === 0 ? (
          <p className="text-sm text-gray-400">
            Aucune transaction pour l'instant.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {history.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between py-3 text-sm"
              >
                <div>
                  <span className={`font-medium ${TYPE_STYLES[t.type]}`}>
                    {t.points > 0 ? "+" : ""}
                    {t.points} pts
                  </span>
                  <span className="ml-2 text-gray-500">
                    {TYPE_LABELS[t.type]}
                  </span>
                  {t.orderId && (
                    <span className="ml-2 text-xs text-gray-400">
                      Commande #{t.orderId.slice(0, 8)}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {formatDate(t.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
