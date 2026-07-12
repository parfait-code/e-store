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

export function useAdminPickupRequest(id: string) {
  return useQuery({
    queryKey: queryKeys.admin.pickupRequest(id),
    queryFn: () => adminPickupRequestsApi.byId(id),
    enabled: Boolean(id),
  });
}

export function useUpdatePickupLocation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PickupRequestLocationUpdateInput) =>
      adminPickupRequestsApi.updateLocation(id, payload),
    onSuccess: (updated) => {
      qc.setQueryData(queryKeys.admin.pickupRequest(id), updated);
      qc.invalidateQueries({ queryKey: ["admin", "pickup-requests"] });
    },
  });
}

export function useUpdatePickupStatus(id: string, returnId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PickupRequestStatusUpdateInput) =>
      adminPickupRequestsApi.updateStatus(id, payload),
    onSuccess: (updated) => {
      qc.setQueryData(queryKeys.admin.pickupRequest(id), updated);
      qc.invalidateQueries({ queryKey: ["admin", "pickup-requests"] });
      // Annuler la pickup annule en cascade le retour lié (§6.15 du guide) —
      // on invalide donc aussi le retour associé et sa liste.
      if (returnId) {
        qc.invalidateQueries({ queryKey: queryKeys.admin.return(returnId) });
        qc.invalidateQueries({ queryKey: ["admin", "returns"] });
      }
    },
  });
}
export function useExpireOverduePickupRequests() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminPickupRequestsApi.expireOverdue(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "pickup-requests"] });
    },
  });
}
