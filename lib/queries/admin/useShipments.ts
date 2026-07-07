// lib/queries/admin/useShipments.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/queries/keys";
import type {
  Shipment,
  ShipmentStatusUpdateInput,
  ShipmentTrackingInput,
} from "@/lib/types";

const adminShipmentsApi = {
  byId: (id: string) => apiClient.get<Shipment>(`/shipments/${id}`),
  updateStatus: (id: string, payload: ShipmentStatusUpdateInput) =>
    apiClient.put<Shipment>(`/shipments/${id}/status`, payload),
  addTracking: (id: string, payload: ShipmentTrackingInput) =>
    apiClient.post<Shipment>(`/shipments/${id}/track`, payload),
  cancel: (id: string) => apiClient.post(`/shipments/${id}/cancel`),
};

export function useAdminShipment(shipmentId: string) {
  return useQuery({
    queryKey: queryKeys.admin.shipment(shipmentId),
    queryFn: () => adminShipmentsApi.byId(shipmentId),
    enabled: Boolean(shipmentId),
  });
}

export function useUpdateShipmentStatus(
  shipmentId: string,
  orderId?: string | null,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ShipmentStatusUpdateInput) =>
      adminShipmentsApi.updateStatus(shipmentId, payload),
    onSuccess: (updated: Shipment) => {
      qc.setQueryData(queryKeys.admin.shipment(shipmentId), updated);
      qc.invalidateQueries({ queryKey: ["admin", "shipments"] });
      // Synchronisation best-effort backend IN_TRANSIT→SHIPPED, DELIVERED→DELIVERED
      // (STATUS_MANAGEMENT.md §2) : la commande a pu changer de statut, on
      // invalide donc son cache ET le panneau shipment affiché sur sa page.
      if (orderId) {
        qc.invalidateQueries({ queryKey: queryKeys.admin.order(orderId) });
        qc.invalidateQueries({
          queryKey: queryKeys.admin.orderShipment(orderId),
        });
      }
    },
  });
}

export function useAddShipmentTracking(shipmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ShipmentTrackingInput) =>
      adminShipmentsApi.addTracking(shipmentId, payload),
    onSuccess: (updated: Shipment) => {
      qc.setQueryData(queryKeys.admin.shipment(shipmentId), updated);
    },
  });
}
