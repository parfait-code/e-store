// app/admin/loyalty/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { Search, Loader2, Coins, Plus, Minus } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
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

function AdjustPointsForm({
  userId,
  onAdjusted,
}: {
  userId: number;
  onAdjusted: () => void;
}) {
  const [points, setPoints] = useState(0);
  const [type, setType] = useState<LoyaltyTransactionType>("ADJUSTED");
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (points === 0) {
      setError("Le nombre de points doit être différent de 0.");
      return;
    }
    setIsSubmitting(true);
    try {
      await apiClient.post("/loyalty/adjust", {
        userId,
        points,
        type,
        orderId: orderId || undefined,
      });
      onAdjusted();
      setPoints(0);
      setOrderId("");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Erreur lors de l'ajustement",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-lg border border-gray-200 bg-white p-4"
    >
      <h2 className="text-sm font-medium">Ajuster les points</h2>
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Points (négatif pour un débit)
          </label>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPoints((p) => p - 10)}
              className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
            >
              <Minus size={14} />
            </button>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              className={`${inputClass} text-center`}
            />
            <button
              type="button"
              onClick={() => setPoints((p) => p + 10)}
              className="rounded-md border border-gray-300 p-2 text-gray-500 hover:bg-gray-50"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as LoyaltyTransactionType)}
            className={inputClass}
          >
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          ID commande (optionnel)
        </label>
        <input
          type="text"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className={`${inputClass} w-full`}
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {isSubmitting ? "Application..." : "Appliquer l'ajustement"}
      </button>
    </form>
  );
}

export default function LoyaltyPage() {
  const [userIdInput, setUserIdInput] = useState("");
  const [activeUserId, setActiveUserId] = useState<number | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [history, setHistory] = useState<LoyaltyTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadUser(userId: number) {
    setIsLoading(true);
    setError(null);
    try {
      const [balanceRes, historyRes] = await Promise.all([
        apiClient.get<{ userId: number; balance: number }>(
          `/loyalty/${userId}/balance`,
        ),
        apiClient.get<LoyaltyTransaction[]>(`/loyalty/${userId}/history`),
      ]);
      setBalance(balanceRes.balance);
      setHistory(historyRes);
      setActiveUserId(userId);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Utilisateur introuvable",
      );
      setActiveUserId(null);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const id = Number(userIdInput);
    if (!id) {
      setError("Entrez un ID utilisateur valide.");
      return;
    }
    loadUser(id);
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Programme fidélité</h1>
        <p className="text-sm text-gray-500">
          Recherchez un utilisateur par ID pour voir son solde et l'ajuster
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="number"
            placeholder="ID utilisateur"
            value={userIdInput}
            onChange={(e) => setUserIdInput(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            "Rechercher"
          )}
        </button>
      </form>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {activeUserId !== null && balance !== null && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
            <div className="rounded-md bg-amber-50 p-2">
              <Coins size={20} className="text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{balance} points</p>
              <p className="text-sm text-gray-500">
                Utilisateur #{activeUserId}
              </p>
            </div>
          </div>

          <AdjustPointsForm
            userId={activeUserId}
            onAdjusted={() => loadUser(activeUserId)}
          />

          <div>
            <h2 className="mb-3 text-sm font-medium">Historique</h2>
            {history.length === 0 ? (
              <p className="text-sm text-gray-400">Aucune transaction.</p>
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
      )}
    </div>
  );
}
