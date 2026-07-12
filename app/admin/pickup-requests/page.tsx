// app/admin/pickup-requests/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Loader2,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Warehouse as WarehouseIcon,
  RefreshCw,
} from "lucide-react";
import { ApiError } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import type {
  PickupRequest,
  PickupRequestStatus,
  PickupCollectionMethod,
} from "@/lib/types";
import {
  useAdminPickupRequests,
  useExpireOverduePickupRequests,
  useUpdatePickupLocation,
  useUpdatePickupStatus,
} from "@/lib/queries/admin/usePickupRequests";
import { useAdminWarehouses } from "@/lib/queries/admin/useInventory";

const STATUS_OPTIONS: PickupRequestStatus[] = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "EXPIRED",
];

const STATUS_STYLES: Record<PickupRequestStatus, string> = {
  PENDING: "bg-gray-100 text-gray-600",
  CONFIRMED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  EXPIRED: "bg-amber-100 text-amber-700",
};

const STATUS_LABELS: Record<PickupRequestStatus, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
  EXPIRED: "Expirée",
};

// Transitions raisonnables — le backend valide de toute façon (400 si invalide)
const ALLOWED_TRANSITIONS: Record<PickupRequestStatus, PickupRequestStatus[]> =
  {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["COMPLETED", "CANCELLED"],
    COMPLETED: [],
    CANCELLED: [],
    EXPIRED: [],
  };

function StatusModal({
  request,
  onClose,
}: {
  request: PickupRequest;
  onClose: () => void;
}) {
  const options = ALLOWED_TRANSITIONS[request.status];
  const [status, setStatus] = useState<PickupRequestStatus>(options[0]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { mutate: updateStatus, isPending: isSaving } = useUpdatePickupStatus(
    request.id,
    request.returnId,
  );

  function handleConfirm() {
    setError(null);
    updateStatus(
      { status, notes: notes || undefined },
      {
        onSuccess: onClose,
        onError: (err) =>
          setError(
            err instanceof ApiError
              ? err.message
              : "Erreur lors de la mise à jour",
          ),
      },
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold">
          Changer le statut de l'enlèvement
        </h2>
        {error && (
          <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </p>
        )}
        <p className="mb-3 text-xs text-amber-600">
          ⚠️ Annuler cet enlèvement annule aussi en cascade le retour associé.
        </p>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as PickupRequestStatus)}
          className="mb-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
        >
          {options.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <textarea
          rows={2}
          placeholder="Notes (optionnel)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mb-5 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSaving}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {isSaving ? "..." : "Confirmer"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LocationModal({
  request,
  onClose,
}: {
  request: PickupRequest;
  onClose: () => void;
}) {
  const { data: warehouses = [] } = useAdminWarehouses();
  const [method, setMethod] = useState<PickupCollectionMethod>(request.method);
  const [warehouseId, setWarehouseId] = useState(request.warehouseId ?? "");
  const [pickupDate, setPickupDate] = useState(
    request.pickupDate ? request.pickupDate.slice(0, 16) : "",
  );
  const [deadline, setDeadline] = useState(
    request.deadline ? request.deadline.slice(0, 16) : "",
  );
  const [error, setError] = useState<string | null>(null);
  const { mutate: updateLocation, isPending: isSaving } =
    useUpdatePickupLocation(request.id);

  function handleConfirm() {
    setError(null);
    updateLocation(
      {
        method,
        warehouse_id: method === "WAREHOUSE_DROPOFF" ? warehouseId : undefined,
        pickup_date: pickupDate
          ? new Date(pickupDate).toISOString()
          : undefined,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
      },
      {
        onSuccess: onClose,
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
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold">
          Définir le lieu d'enlèvement
        </h2>
        {error && (
          <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </p>
        )}
        <div className="mb-3">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Méthode
          </label>
          <select
            value={method}
            onChange={(e) =>
              setMethod(e.target.value as PickupCollectionMethod)
            }
            className={inputClass}
          >
            <option value="ORIGINAL_ADDRESS">Adresse d'origine</option>
            <option value="WAREHOUSE_DROPOFF">Dépôt en entrepôt</option>
            <option value="CUSTOM_ADDRESS">Adresse personnalisée</option>
          </select>
        </div>
        {method === "WAREHOUSE_DROPOFF" && (
          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Entrepôt
            </label>
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className={inputClass}
            >
              <option value="">Sélectionner...</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="mb-3">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Date d'enlèvement
          </label>
          <input
            type="datetime-local"
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="mb-5">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Date limite
          </label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSaving}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {isSaving ? "..." : "Confirmer"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPickupRequestsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<PickupRequestStatus | "">("");
  const [statusEditRequest, setStatusEditRequest] =
    useState<PickupRequest | null>(null);
  const [locationEditRequest, setLocationEditRequest] =
    useState<PickupRequest | null>(null);

  const { mutate: expireOverdue, isPending: isExpiring } =
    useExpireOverduePickupRequests();

  function handleExpireOverdue() {
    if (!confirm("Forcer l'expiration des demandes d'enlèvement en retard ?"))
      return;
    expireOverdue(undefined, {
      onError: (err) =>
        alert(
          err instanceof ApiError ? err.message : "Erreur lors de l'opération",
        ),
      onSettled: fetchRequests,
    });
  }

  const { data, isLoading, isError } = useAdminPickupRequests({
    page,
    status,
  });
  const requests = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Demandes d'enlèvement</h1>
          <p className="text-sm text-gray-500">
            {total} demande(s) — créées automatiquement à l'approbation d'un
            retour
          </p>
        </div>
        <button
          onClick={handleExpireOverdue}
          disabled={isExpiring}
          className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          {isExpiring ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <RefreshCw size={16} />
          )}
          Expirer les demandes en retard
        </button>
      </div>

      <div className="mb-4">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as PickupRequestStatus | "");
            setPage(1);
          }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
        >
          <option value="">Tous les statuts</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {isError && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          Erreur de chargement
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
              <th className="px-4 py-3">Utilisateur</th>
              <th className="px-4 py-3">Retour lié</th>
              <th className="px-4 py-3">Méthode</th>
              <th className="px-4 py-3">Date / limite</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  <Loader2 size={20} className="mx-auto animate-spin" />
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  Aucune demande.
                </td>
              </tr>
            ) : (
              requests.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="px-4 py-3 text-gray-500">#{r.userId}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/returns/${r.returnId}`}
                      className="text-gray-600 hover:underline"
                    >
                      #{r.returnId.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      {r.method === "WAREHOUSE_DROPOFF" ? (
                        <WarehouseIcon size={14} />
                      ) : (
                        <MapPin size={14} />
                      )}
                      {r.method === "ORIGINAL_ADDRESS" && "Adresse d'origine"}
                      {r.method === "WAREHOUSE_DROPOFF" &&
                        (r.warehouse?.name ?? "Entrepôt")}
                      {r.method === "CUSTOM_ADDRESS" &&
                        (r.address?.street ?? "Adresse perso.")}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      {r.pickupDate ? formatDate(r.pickupDate) : "—"}
                      {r.deadline && (
                        <span className="text-xs text-gray-400">
                          (limite {formatDate(r.deadline)})
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[r.status]}`}
                    >
                      {STATUS_LABELS[r.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setLocationEditRequest(r)}
                        title="Modifier le lieu"
                        className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                      >
                        <MapPin size={16} />
                      </button>
                      {ALLOWED_TRANSITIONS[r.status].length > 0 && (
                        <button
                          onClick={() => setStatusEditRequest(r)}
                          title="Changer le statut"
                          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                        >
                          <Pencil size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Page {page} sur {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 disabled:opacity-40"
            >
              <ChevronLeft size={14} /> Précédent
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 disabled:opacity-40"
            >
              Suivant <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {statusEditRequest && (
        <StatusModal
          request={statusEditRequest}
          onClose={() => setStatusEditRequest(null)}
        />
      )}
      {locationEditRequest && (
        <LocationModal
          request={locationEditRequest}
          onClose={() => setLocationEditRequest(null)}
        />
      )}
    </div>
  );
}
