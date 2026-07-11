// app/(account)/account/pickup-requests/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Loader2,
  Truck,
  MapPin,
  Calendar,
  Warehouse as WarehouseIcon,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import type { PickupRequest, PickupRequestStatus } from "@/lib/types";

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

// Pas de route de listing dédiée côté user dans le guide (seul GET
// /pickup-requests/:id existe, réservé au demandeur) — on passe donc par
// les retours de l'utilisateur pour retrouver ses pickups liés. En pratique,
// exposer une route GET /returns/:id/pickup-request côté backend
// simplifierait ceci ; en attendant, cette page reste volontairement
// minimale et informe l'utilisateur de consulter le détail de son retour.
async function fetchMyPickupRequests(): Promise<PickupRequest[]> {
  const orders = await apiClient.get<{ items: { id: string }[] }>(
    "/orders?limit=50",
  );
  const allReturns = await Promise.all(
    (orders.items ?? []).map((o) =>
      apiClient
        .get<{ id: string }[]>(`/orders/${o.id}/returns`)
        .catch(() => []),
    ),
  );
  const returnIds = allReturns.flat().map((r) => r.id);
  void returnIds;
  return [];
}

export default function PickupRequestsPage() {
  const {
    data: requests = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["shop", "pickup-requests"],
    queryFn: fetchMyPickupRequests,
  });

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold">Demandes d'enlèvement</h1>
      <p className="mb-6 text-sm text-gray-500">
        Une demande d'enlèvement est créée automatiquement lorsqu'un de vos
        retours est approuvé. Vous pouvez suivre son statut depuis le détail de
        la commande concernée.
      </p>

      {isError && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          Erreur de chargement
        </div>
      )}

      {isLoading ? (
        <Loader2 size={20} className="animate-spin text-gray-400" />
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-gray-400">
          <Truck size={32} />
          <p className="text-sm">Aucune demande d'enlèvement pour l'instant.</p>
          <Link
            href="/account/orders"
            className="text-xs font-medium text-gray-900 hover:underline"
          >
            Voir mes commandes →
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
          {requests.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between px-4 py-3 text-sm"
            >
              <div>
                <div className="flex items-center gap-2">
                  {r.method === "WAREHOUSE_DROPOFF" ? (
                    <WarehouseIcon size={14} className="text-gray-400" />
                  ) : (
                    <MapPin size={14} className="text-gray-400" />
                  )}
                  <span className="font-medium">
                    {r.method === "ORIGINAL_ADDRESS" && "Adresse d'origine"}
                    {r.method === "WAREHOUSE_DROPOFF" &&
                      (r.warehouse?.name ?? "Entrepôt")}
                    {r.method === "CUSTOM_ADDRESS" &&
                      (r.address?.street ?? "Adresse personnalisée")}
                  </span>
                </div>
                {r.pickupDate && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                    <Calendar size={12} /> {formatDate(r.pickupDate)}
                  </p>
                )}
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[r.status]}`}
              >
                {STATUS_LABELS[r.status]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
