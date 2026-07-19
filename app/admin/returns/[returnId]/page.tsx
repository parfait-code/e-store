// app/admin/returns/[returnId]/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, PackageOpen } from "lucide-react";
import { ApiError } from "@/lib/api-client";
import type { ReturnRequest, ReturnStatus } from "@/lib/types";
import {
  useAdminReturn,
  useUpdateReturnStatus,
} from "@/lib/queries/admin/useReturns";

const STATUS_OPTIONS: ReturnStatus[] = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "COMPLETED",
];

const STATUS_STYLES: Record<ReturnStatus, string> = {
  PENDING: "bg-gray-100 text-gray-600",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  COMPLETED: "bg-blue-100 text-blue-700",
};

function StatusUpdateForm({ returnRequest }: { returnRequest: ReturnRequest }) {
  const [status, setStatus] = useState<ReturnStatus>(returnRequest.status);
  const [notes, setNotes] = useState(returnRequest.notes ?? "");
  const [pickupDeadline, setPickupDeadline] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { mutate: updateStatus, isPending: isSubmitting } =
    useUpdateReturnStatus(returnRequest.id);

  const requiresDeadline = status === "APPROVED";

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (requiresDeadline && !pickupDeadline) {
      setError(
        "La date limite de collecte est requise pour approuver un retour.",
      );
      return;
    }

    updateStatus(
      {
        status,
        notes: notes || undefined,
        pickup_deadline: requiresDeadline
          ? new Date(pickupDeadline).toISOString()
          : undefined,
      },
      {
        onError: (err) =>
          setError(
            err instanceof ApiError
              ? err.message
              : "Erreur lors de la mise à jour",
          ),
      },
    );
  }

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-lg border border-gray-200 bg-white p-4"
    >
      <h2 className="text-sm font-medium">Traiter la demande</h2>
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Statut
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ReturnStatus)}
          className={inputClass}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {requiresDeadline && (
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Date limite de collecte <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            required
            value={pickupDeadline}
            onChange={(e) => setPickupDeadline(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-gray-400">
            Requise pour approuver le retour — déclenche automatiquement la
            création de la demande d'enlèvement (pickup request).
          </p>
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Notes (optionnel)
        </label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting || status === returnRequest.status}
        className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {isSubmitting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Save size={16} />
        )}
        Mettre à jour
      </button>
    </form>
  );
}

export default function ReturnDetailPage() {
  const { returnId } = useParams<{ returnId: string }>();
  const { data: returnRequest, isLoading, isError } = useAdminReturn(returnId);

  if (isLoading)
    return <Loader2 size={20} className="animate-spin text-gray-400" />;
  if (isError || !returnRequest) {
    return (
      <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
        Demande introuvable.
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/returns"
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft size={14} /> Retour aux demandes
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            Retour #{returnRequest.id.slice(0, 8)}
          </h1>
          <p className="text-sm text-gray-500">
            Commande{" "}
            <Link
              href={`/admin/orders/${returnRequest.orderId}`}
              className="hover:underline"
            >
              #{returnRequest.orderId.slice(0, 8)}
            </Link>
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_STYLES[returnRequest.status]}`}
        >
          {returnRequest.status}
        </span>
      </div>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
          <PackageOpen size={16} /> Articles retournés
        </h2>
        <p className="mb-3 text-sm text-gray-600">
          <span className="font-medium">Raison : </span>
          {returnRequest.reason}
        </p>
        <div className="divide-y divide-gray-100">
          {returnRequest.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-2 text-sm"
            >
              <span>Article commande #{item.orderItem.id.slice(0, 8)}</span>
              <span className="text-gray-500">
                Qté {item.quantity}{" "}
                {item.condition && `· État : ${item.condition}`}
              </span>
            </div>
          ))}
        </div>
      </div>

      <StatusUpdateForm returnRequest={returnRequest} />
    </div>
  );
}
