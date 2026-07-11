// lib/queries/admin/usePickupRequests.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminPickupRequestsApi } from "@/lib/api/admin/pickupRequests";
import { queryKeys } from "@/lib/queries/keys";
import type {
  PickupRequestStatus,
  PickupRequestLocationUpdateInput,
  PickupRequestStatusUpdateInput,
} from "@/lib/types";

export function useAdminPickupRequests(params: {
  page: number;
  status?: PickupRequestStatus | "";
}) {
  return useQuery({
    queryKey: queryKeys.admin.pickupRequests(params),
    queryFn: () => adminPickupRequestsApi.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useAdminPickupRequest(requestId: string) {
  return useQuery({
    queryKey: queryKeys.admin.pickupRequest(requestId),
    queryFn: () => adminPickupRequestsApi.byId(requestId),
    enabled: Boolean(requestId),
  });
}

export function useUpdatePickupLocation(requestId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PickupRequestLocationUpdateInput) =>
      adminPickupRequestsApi.updateLocation(requestId, payload),
    onSuccess: (updated) => {
      qc.setQueryData(queryKeys.admin.pickupRequest(requestId), updated);
      qc.invalidateQueries({ queryKey: ["admin", "pickup-requests"] });
    },
  });
}

export function useUpdatePickupStatus(requestId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PickupRequestStatusUpdateInput) =>
      adminPickupRequestsApi.updateStatus(requestId, payload),
    onSuccess: (updated) => {
      qc.setQueryData(queryKeys.admin.pickupRequest(requestId), updated);
      qc.invalidateQueries({ queryKey: ["admin", "pickup-requests"] });
      // Annuler la pickup annule en cascade le retour lié (§6.15 du guide) —
      // on invalide donc aussi le retour associé pour refléter ce cas.
      qc.invalidateQueries({
        queryKey: queryKeys.admin.return(updated.returnId),
      });
    },
  });
}

export function useExpireOverduePickups() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminPickupRequestsApi.expireOverdue(),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin", "pickup-requests"] }),
  });
}
