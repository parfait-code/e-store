// app/(account)/account/loyalty/page.tsx
"use client";

import { Loader2, Coins } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { formatDate } from "@/lib/format";
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
  EARNED: "text-green-600",
  REDEEMED: "text-red-600",
  EXPIRED: "text-gray-400",
  ADJUSTED: "text-blue-600",
};

export default function LoyaltyPage() {
  const { user } = useAuth();
  const {
    data: balanceRes,
    isLoading: isLoadingBalance,
    isError: isBalanceError,
  } = useMyLoyaltyBalance(user?.id ?? null);
  const { data: history = [], isLoading: isLoadingHistory } =
    useMyLoyaltyHistory(user?.id ?? null);

  const isLoading = isLoadingBalance || isLoadingHistory;

  if (isLoading)
    return <Loader2 size={20} className="animate-spin text-gray-400" />;
  if (isBalanceError)
    return (
      <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
        Erreur de chargement
      </div>
    );

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Mes points fidélité</h1>

      <div className="mb-6 flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <div className="rounded-md bg-amber-50 p-2">
          <Coins size={20} className="text-amber-500" />
        </div>
        <p className="text-2xl font-semibold">
          {balanceRes?.balance ?? 0} points
        </p>
      </div>

      <h2 className="mb-3 text-sm font-medium">Historique</h2>
      {history.length === 0 ? (
        <p className="text-sm text-gray-400">
          Aucune transaction pour l'instant.
        </p>
      ) : (
        <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
          {history.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between px-4 py-3 text-sm"
            >
              <div>
                <span className={`font-medium ${TYPE_STYLES[t.type]}`}>
                  {t.points > 0 ? "+" : ""}
                  {t.points} pts
                </span>
                <span className="ml-2 text-gray-500">
                  {TYPE_LABELS[t.type]}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {formatDate(t.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
