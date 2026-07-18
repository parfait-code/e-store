// app/(account)/account/pickup-requests/page.tsx
"use client";

import Link from "next/link";
import {
  Truck,
  MapPin,
  Calendar,
  Warehouse as WarehouseIcon,
} from "lucide-react";
import { formatDate } from "@/lib/format";
import type { PickupRequestStatus } from "@/lib/types";
import { useMyPickupRequests } from "@/lib/queries/shop/usePickupRequests";

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

function PickupRequestRowSkeleton() {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <div className="flex items-center gap-2">
          <div className="h-3.5 w-3.5 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="mt-1.5 h-3 w-28 animate-pulse rounded bg-gray-100" />
      </div>
      <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200" />
    </div>
  );
}

export default function PickupRequestsPage() {
  const { data: requests = [], isLoading, isError } = useMyPickupRequests();

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
        <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
          {Array.from({ length: 3 }).map((_, i) => (
            <PickupRequestRowSkeleton key={i} />
          ))}
        </div>
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
