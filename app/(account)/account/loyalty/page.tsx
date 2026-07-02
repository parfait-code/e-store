// app/(account)/account/loyalty/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Loader2, Coins } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth/auth-context";
import { formatDate } from "@/lib/format";
import type { LoyaltyTransaction, LoyaltyTransactionType } from "@/lib/types";

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
  const [balance, setBalance] = useState<number | null>(null);
  const [history, setHistory] = useState<LoyaltyTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      apiClient.get<{ userId: number; balance: number }>(
        `/loyalty/${user.id}/balance`,
      ),
      apiClient.get<LoyaltyTransaction[]>(`/loyalty/${user.id}/history`),
    ])
      .then(([b, h]) => {
        setBalance(b.balance);
        setHistory(h);
      })
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Erreur de chargement",
        ),
      )
      .finally(() => setIsLoading(false));
  }, [user]);

  if (isLoading)
    return <Loader2 size={20} className="animate-spin text-gray-400" />;
  if (error)
    return (
      <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Mes points fidélité</h1>

      <div className="mb-6 flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <div className="rounded-md bg-amber-50 p-2">
          <Coins size={20} className="text-amber-500" />
        </div>
        <p className="text-2xl font-semibold">{balance} points</p>
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
