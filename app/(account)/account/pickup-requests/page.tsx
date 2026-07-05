// app/(account)/account/pickup-requests/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { Loader2, Truck, Plus, X, MapPin, Calendar } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import type { PickupRequest, PickupRequestFormInput } from "@/lib/types";

const STORAGE_KEY = "pickup_request_ids";

const STATUS_STYLES: Record<PickupRequest["status"], string> = {
  PENDING: "bg-gray-100 text-gray-600",
  CONFIRMED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<PickupRequest["status"], string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  CANCELLED: "Annulée",
};

function getStoredIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function storeIds(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // localStorage indisponible — l'historique ne persistera pas
  }
}

function NewPickupRequestForm({
  onCreated,
}: {
  onCreated: (r: PickupRequest) => void;
}) {
  const [pickupDate, setPickupDate] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const payload: PickupRequestFormInput = {
        pickup_date: new Date(pickupDate).toISOString(),
        pickup_address: pickupAddress,
      };
      const created = await apiClient.post<PickupRequest>(
        "/pickup-requests",
        payload,
      );
      storeIds([...getStoredIds(), created.id]);
      onCreated(created);
      setPickupDate("");
      setPickupAddress("");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Erreur lors de la demande",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 space-y-3 rounded-lg border border-gray-200 bg-white p-4"
    >
      <h2 className="flex items-center gap-2 text-sm font-medium">
        <Plus size={16} /> Nouvelle demande d'enlèvement
      </h2>
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Date souhaitée
        </label>
        <input
          type="datetime-local"
          required
          value={pickupDate}
          onChange={(e) => setPickupDate(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Adresse d'enlèvement
        </label>
        <textarea
          required
          rows={2}
          value={pickupAddress}
          onChange={(e) => setPickupAddress(e.target.value)}
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {isSubmitting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Truck size={16} />
        )}
        Envoyer la demande
      </button>
    </form>
  );
}

export default function PickupRequestsPage() {
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    const ids = getStoredIds();
    if (ids.length === 0) {
      setIsLoading(false);
      return;
    }
    Promise.allSettled(
      ids.map((id) => apiClient.get<PickupRequest>(`/pickup-requests/${id}`)),
    ).then((results) => {
      const found: PickupRequest[] = [];
      const validIds: string[] = [];
      results.forEach((r, i) => {
        if (r.status === "fulfilled") {
          found.push(r.value);
          validIds.push(ids[i]);
        }
      });
      storeIds(validIds); // nettoie les IDs qui ne résolvent plus
      setRequests(found);
      setIsLoading(false);
    });
  }, []);

  async function handleCancel(id: string) {
    if (!confirm("Annuler cette demande d'enlèvement ?")) return;
    setCancellingId(id);
    try {
      await apiClient.post(`/pickup-requests/${id}/cancel`);
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "CANCELLED" } : r)),
      );
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Annulation impossible");
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Demandes d'enlèvement</h1>

      <NewPickupRequestForm
        onCreated={(r) => setRequests((prev) => [r, ...prev])}
      />

      <h2 className="mb-3 text-sm font-medium">Mes demandes</h2>
      {isLoading ? (
        <Loader2 size={20} className="animate-spin text-gray-400" />
      ) : requests.length === 0 ? (
        <p className="text-sm text-gray-400">
          Aucune demande d'enlèvement pour l'instant.
        </p>
      ) : (
        <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
          {requests.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between px-4 py-3 text-sm"
            >
              <div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-gray-400" />
                  <span className="font-medium">{r.pickupAddress}</span>
                </div>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                  <Calendar size={12} /> {formatDate(r.pickupDate)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[r.status]}`}
                >
                  {STATUS_LABELS[r.status]}
                </span>
                {r.status === "PENDING" && (
                  <button
                    onClick={() => handleCancel(r.id)}
                    disabled={cancellingId === r.id}
                    className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    {cancellingId === r.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <X size={14} />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
