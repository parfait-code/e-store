// lib/queries/admin/useReturns.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminReturnsApi } from "@/lib/api/admin/returns";
import { queryKeys } from "@/lib/queries/keys";
import type { ReturnStatus, ReturnStatusUpdateInput } from "@/lib/types";

export function useAdminReturns(params: {
  page: number;
  status?: ReturnStatus | "";
}) {
  return useQuery({
    queryKey: queryKeys.admin.returns(params),
    queryFn: () => adminReturnsApi.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useAdminReturn(returnId: string) {
  return useQuery({
    queryKey: queryKeys.admin.return(returnId),
    queryFn: () => adminReturnsApi.byId(returnId),
    enabled: Boolean(returnId),
  });
}

export function useUpdateReturnStatus(returnId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReturnStatusUpdateInput) =>
      adminReturnsApi.updateStatus(returnId, payload),
    onSuccess: (updated) => {
      qc.setQueryData(queryKeys.admin.return(returnId), updated);
      qc.invalidateQueries({ queryKey: ["admin", "returns"] });
      // Un retour COMPLETED déclenche côté backend : Order.status →
      // REFUNDED, réintégration stock, reversal fidélité — on invalide donc
      // aussi la commande liée pour refléter ces effets de bord.
      qc.invalidateQueries({
        queryKey: queryKeys.admin.order(updated.orderId),
      });
      // Approuver un retour matérialise une PickupRequest — la liste admin
      // des pickups doit refléter cette création.
      qc.invalidateQueries({ queryKey: ["admin", "pickup-requests"] });
    },
  });
}
