// app/admin/shipments/[shipmentId]/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Package,
  FileText,
  Plus,
  Save,
  X,
  RefreshCw,
} from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import type {
  Shipment,
  ShipmentTrackingInput,
  ShipmentStatus,
  ShipmentStatusUpdateInput,
} from "@/lib/types";

const STATUS_STYLES: Record<ShipmentStatus, string> = {
  PENDING: "bg-gray-100 text-gray-600",
  IN_TRANSIT: "bg-blue-100 text-blue-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

// D'après status_management_guide.md : DELIVERED et CANCELLED sont terminaux.
// L'annulation reste gérée par le bouton dédié (POST /shipments/:id/cancel),
// ce formulaire ne propose donc que les transitions "d'avancement".
const ADVANCE_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  PENDING: ["IN_TRANSIT", "DELIVERED"],
  IN_TRANSIT: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

function OfficialStatusForm({
  shipment,
  onUpdated,
}: {
  shipment: Shipment;
  onUpdated: (s: Shipment) => void;
}) {
  const options = ADVANCE_TRANSITIONS[shipment.status];
  const [status, setStatus] = useState<ShipmentStatus>(
    options[0] ?? shipment.status,
  );
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (options.length === 0) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const payload: ShipmentStatusUpdateInput = {
        status,
        reason: reason || undefined,
      };
      const updated = await apiClient.put<Shipment>(
        `/shipments/${shipment.id}/status`,
        payload,
      );
      onUpdated(updated);
      setReason("");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Erreur lors de la mise à jour",
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
      <h2 className="flex items-center gap-2 text-sm font-medium">
        <RefreshCw size={16} /> Statut officiel
      </h2>
      <p className="text-xs text-gray-400">
        Distinct du suivi ci-dessous : ce statut synchronise automatiquement la
        commande liée (IN_TRANSIT → SHIPPED, DELIVERED → DELIVERED).
      </p>
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Nouveau statut
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ShipmentStatus)}
            className={`${inputClass} w-full`}
          >
            {options.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Raison (optionnel)
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className={`${inputClass} w-full`}
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {isSubmitting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Save size={16} />
        )}
        Mettre à jour le statut
      </button>
    </form>
  );
}

function AddTrackingForm({
  shipmentId,
  onAdded,
}: {
  shipmentId: string;
  onAdded: (shipment: Shipment) => void;
}) {
  const [status, setStatus] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const payload: ShipmentTrackingInput = {
        status,
        location: location || undefined,
      };
      const updated = await apiClient.post<Shipment>(
        `/shipments/${shipmentId}/track`,
        payload,
      );
      onAdded(updated);
      setStatus("");
      setLocation("");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Erreur lors de l'ajout",
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
      <h2 className="flex items-center gap-2 text-sm font-medium">
        <Plus size={16} /> Ajouter un événement de suivi
      </h2>
      <p className="text-xs text-gray-400">
        Journal libre (ne change pas le statut officiel de l'expédition).
      </p>
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Statut / étape
        </label>
        <input
          type="text"
          required
          placeholder="Ex: Arrivé au centre de tri"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={`${inputClass} w-full`}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Localisation (optionnel)
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={`${inputClass} w-full`}
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
          <Save size={16} />
        )}
        Ajouter
      </button>
    </form>
  );
}

function GenerateLabelButton({
  shipmentId,
  onGenerated,
}: {
  shipmentId: string;
  onGenerated: (label: { id: string; labelUrl: string }) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<{ label_id: string; label_url: string }>(
        `/labels/${shipmentId}`,
      );
      onGenerated({ id: res.label_id, labelUrl: res.label_url });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur de génération");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <FileText size={16} />
        )}
        Générer l'étiquette
      </button>
    </div>
  );
}

export default function ShipmentDetailPage() {
  const { shipmentId } = useParams<{ shipmentId: string }>();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    apiClient
      .get<Shipment>(`/shipments/${shipmentId}`)
      .then(setShipment)
      .catch((err) =>
        setError(
          err instanceof ApiError ? err.message : "Erreur de chargement",
        ),
      )
      .finally(() => setIsLoading(false));
  }, [shipmentId]);

  async function handleCancelShipment() {
    if (!confirm("Annuler cette expédition ?")) return;
    setIsCancelling(true);
    try {
      await apiClient.post(`/shipments/${shipment!.id}/cancel`);
      setShipment((prev) => (prev ? { ...prev, status: "CANCELLED" } : prev));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Annulation impossible");
    } finally {
      setIsCancelling(false);
    }
  }

  if (isLoading)
    return <Loader2 size={20} className="animate-spin text-gray-400" />;
  if (error || !shipment) {
    return (
      <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
        {error ?? "Expédition introuvable."}
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/shipments"
        className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft size={14} /> Retour aux expéditions
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            Expédition{" "}
            {shipment.trackingNumber ?? `#${shipment.id.slice(0, 8)}`}
          </h1>
          {shipment.orderId && (
            <p className="text-sm text-gray-500">
              Commande{" "}
              <Link
                href={`/admin/orders/${shipment.orderId}`}
                className="hover:underline"
              >
                #{shipment.orderId.slice(0, 8)}
              </Link>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_STYLES[shipment.status]}`}
          >
            {shipment.status}
          </span>
          {shipment.status !== "CANCELLED" &&
            shipment.status !== "DELIVERED" && (
              <button
                onClick={handleCancelShipment}
                disabled={isCancelling}
                className="flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {isCancelling ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <X size={14} />
                )}
                Annuler l'expédition
              </button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <OfficialStatusForm shipment={shipment} onUpdated={setShipment} />

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
              <MapPin size={16} /> Historique de suivi
            </h2>
            {shipment.trackingEvents.length === 0 ? (
              <p className="text-sm text-gray-400">
                Aucun événement pour le moment.
              </p>
            ) : (
              <div className="space-y-3">
                {shipment.trackingEvents
                  .slice()
                  .reverse()
                  .map((e) => (
                    <div
                      key={e.id}
                      className="flex items-start justify-between border-l-2 border-gray-200 pl-3 text-sm"
                    >
                      <div>
                        <p className="font-medium">{e.status}</p>
                        {e.location && (
                          <p className="text-xs text-gray-500">{e.location}</p>
                        )}
                      </div>
                      <span className="whitespace-nowrap text-xs text-gray-400">
                        {formatDate(e.createdAt)}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <AddTrackingForm shipmentId={shipment.id} onAdded={setShipment} />
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Package size={16} /> Colis
            </h2>
            <p className="text-gray-500">Expéditeur</p>
            <p className="mb-2">
              {shipment.senderName}
              <br />
              {shipment.senderAddress}
            </p>
            <p className="text-gray-500">Destinataire</p>
            <p className="mb-2">
              {shipment.recipientName}
              <br />
              {shipment.recipientAddress}
            </p>
            <p className="text-gray-500">Poids : {shipment.weight} kg</p>
            {shipment.estimatedDeliveryDate && (
              <p className="text-gray-500">
                Livraison estimée : {formatDate(shipment.estimatedDeliveryDate)}
              </p>
            )}
          </div>

          {shipment.label ? (
            <a
              href={shipment.label.labelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-4 text-sm font-medium hover:bg-gray-50"
            >
              <FileText size={16} /> Voir l'étiquette
            </a>
          ) : (
            <GenerateLabelButton
              shipmentId={shipment.id}
              onGenerated={(label) =>
                setShipment((prev) => (prev ? { ...prev, label } : prev))
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
