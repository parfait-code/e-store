// lib/queries/admin/usePayments.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminPaymentsApi } from "@/lib/api/admin/payments";
import { queryKeys } from "@/lib/queries/keys";
import type { PaymentStatus } from "@/lib/types";

export function useAdminPayments(params: {
  page: number;
  status?: PaymentStatus | "";
  method?: string;
  orderId?: string;
}) {
  return useQuery({
    queryKey: queryKeys.admin.payments(params),
    queryFn: () => adminPaymentsApi.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useUpdatePaymentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      paymentId,
      payload,
    }: {
      paymentId: string;
      payload: { status: PaymentStatus; notes?: string };
    }) => adminPaymentsApi.updateStatus(paymentId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "payments"] });
    },
  });
}

export function useReconcileCod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminPaymentsApi.reconcileCod(),
    onSuccess: () => {
      // La réconciliation peut faire passer des commandes PENDING → CONFIRMED
      qc.invalidateQueries({ queryKey: ["admin", "payments"] });
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });
}
