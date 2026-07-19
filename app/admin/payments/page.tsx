// app/admin/payments/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Pencil,
  RefreshCw,
} from "lucide-react";
import { ApiError } from "@/lib/api-client";
import { formatXAF, formatDate } from "@/lib/format";
import type { Payment, PaymentMethodType, PaymentStatus } from "@/lib/types";
import { TableRowsSkeleton } from "@/components/admin/TableSkeleton";
import {
  useAdminPayments,
  useUpdatePaymentStatus,
  useReconcileCod,
} from "@/lib/queries/admin/usePayments";
import {
  useConfirmDialog,
  useAlertDialog,
} from "@/components/admin/ModalProvider";

const METHOD_OPTIONS: PaymentMethodType[] = [
  "CASH_ON_DELIVERY",
  "PAYPAL",
  "STRIPE",
  "CINETPAY",
];

const STATUS_OPTIONS: PaymentStatus[] = [
  "PENDING",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
  "CANCELLED",
];

const STATUS_STYLES: Record<PaymentStatus, string> = {
  PENDING: "bg-gray-100 text-gray-600",
  COMPLETED: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-amber-100 text-amber-700",
  CANCELLED: "bg-gray-200 text-gray-500",
};

// Restriction documentée (API_GUIDE_ADMIN.md §11) : un admin ne peut faire
// évoluer manuellement un paiement que vers REFUNDED. Les autres transitions
// sont exclusivement automatiques (cycle de vie commande/retour).
const ALLOWED_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  PENDING: [],
  COMPLETED: ["REFUNDED"],
  FAILED: [],
  REFUNDED: [],
  CANCELLED: [],
};

function ChangeStatusModal({
  payment,
  onClose,
}: {
  payment: Payment;
  onClose: () => void;
}) {
  const options = ALLOWED_TRANSITIONS[payment.status];
  const [status, setStatus] = useState<PaymentStatus>(options[0]);
  const [error, setError] = useState<string | null>(null);
  const { mutate: updateStatus, isPending: isSaving } =
    useUpdatePaymentStatus();

  function handleConfirm() {
    setError(null);
    updateStatus(
      { paymentId: payment.id, payload: { status } },
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
          Changer le statut du paiement
        </h2>
        {error && (
          <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </p>
        )}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as PaymentStatus)}
          className="mb-5 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
        >
          {options.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
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

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<PaymentStatus | "">("");
  const [method, setMethod] = useState("");
  const [orderIdInput, setOrderIdInput] = useState("");
  const [orderId, setOrderId] = useState("");
  const [statusEditPayment, setStatusEditPayment] = useState<Payment | null>(
    null,
  );
  const confirm = useConfirmDialog();
  const alertDialog = useAlertDialog();

  const { data, isLoading, isError } = useAdminPayments({
    page,
    status,
    method,
    orderId,
  });
  const payments = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const { mutate: reconcileCod, isPending: isReconciling } = useReconcileCod();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setOrderId(orderIdInput.trim());
  }

  async function handleReconcile() {
    const ok = await confirm({
      title: "Réconcilier les paiements COD",
      message:
        "Rattraper les commandes restées en attente alors qu'un paiement à la livraison a déjà été enregistré (échec de synchro) ?",
    });
    if (!ok) return;
    reconcileCod(undefined, {
      onSuccess: (res) =>
        alertDialog(`${res.reconciledCount} commande(s) réconciliée(s).`),
      onError: (err) =>
        alertDialog(
          err instanceof ApiError ? err.message : "Erreur lors de l'opération",
        ),
    });
  }

  const selectClass =
    "rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Paiements</h1>
          <p className="text-sm text-gray-500">{total} paiement(s)</p>
        </div>
        <button
          onClick={handleReconcile}
          disabled={isReconciling}
          className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={isReconciling ? "animate-spin" : ""}
          />
          Réconcilier les paiements COD
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="ID commande..."
            value={orderIdInput}
            onChange={(e) => setOrderIdInput(e.target.value)}
            className={selectClass}
          />
        </form>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as PaymentStatus | "");
            setPage(1);
          }}
          className={selectClass}
        >
          <option value="">Tous les statuts</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={method}
          onChange={(e) => {
            setMethod(e.target.value);
            setPage(1);
          }}
          className={selectClass}
        >
          <option value="">Toutes les méthodes</option>
          {METHOD_OPTIONS.map((m) => (
            <option key={m} value={m}>
              {m}
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
              <th className="px-4 py-3">Paiement</th>
              <th className="px-4 py-3">Commande</th>
              <th className="px-4 py-3">Méthode</th>
              <th className="px-4 py-3">Montant</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableRowsSkeleton rows={8} columns={6} />
            ) : payments.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  Aucun paiement trouvé.
                </td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <CreditCard size={14} className="text-gray-400" />
                      <span className="font-mono text-xs">
                        {p.id.slice(0, 8)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${p.orderId}`}
                      className="text-gray-600 hover:underline"
                    >
                      #{p.orderId.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.method}</td>
                  <td className="px-4 py-3 font-medium">
                    {formatXAF(p.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[p.status]}`}
                      >
                        {p.status}
                      </span>
                      {ALLOWED_TRANSITIONS[p.status].length > 0 && (
                        <button
                          onClick={() => setStatusEditPayment(p)}
                          className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
                          title="Changer le statut"
                        >
                          <Pencil size={12} />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDate(p.createdAt)}
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

      {statusEditPayment && (
        <ChangeStatusModal
          payment={statusEditPayment}
          onClose={() => setStatusEditPayment(null)}
        />
      )}
    </div>
  );
}
