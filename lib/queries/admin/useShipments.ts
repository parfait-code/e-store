// lib/queries/admin/useShipments.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminShipmentsApi } from "@/lib/api/admin/shipments";
import { queryKeys } from "@/lib/queries/keys";
import type {
  Shipment,
  ShipmentStatus,
  ShipmentStatusUpdateInput,
  ShipmentTrackingInput,
  ShipmentFormInput,
} from "@/lib/types";

export function useAdminShipments(params: {
  page: number;
  status?: ShipmentStatus | "";
  orderId?: string;
}) {
  return useQuery({
    queryKey: queryKeys.admin.shipments(params),
    queryFn: () => adminShipmentsApi.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useAdminShipment(shipmentId: string) {
  return useQuery({
    queryKey: queryKeys.admin.shipment(shipmentId),
    queryFn: () => adminShipmentsApi.byId(shipmentId),
    enabled: Boolean(shipmentId),
  });
}

export function useCreateShipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ShipmentFormInput) =>
      adminShipmentsApi.create(payload),
    onSuccess: (created: Shipment) => {
      qc.invalidateQueries({ queryKey: ["admin", "shipments"] });
      if (created.orderId) {
        qc.invalidateQueries({
          queryKey: queryKeys.admin.order(created.orderId),
        });
        qc.invalidateQueries({
          queryKey: queryKeys.admin.orderShipment(created.orderId),
        });
      }
    },
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

export function useCancelShipment(shipmentId: string, orderId?: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminShipmentsApi.cancel(shipmentId),
    onSuccess: () => {
      qc.setQueryData(
        queryKeys.admin.shipment(shipmentId),
        (prev: Shipment | undefined) =>
          prev ? { ...prev, status: "CANCELLED" as const } : prev,
      );
      qc.invalidateQueries({ queryKey: ["admin", "shipments"] });
      if (orderId) {
        qc.invalidateQueries({ queryKey: queryKeys.admin.order(orderId) });
        qc.invalidateQueries({
          queryKey: queryKeys.admin.orderShipment(orderId),
        });
      }
    },
  });
}

export function useGenerateShipmentLabel(shipmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminShipmentsApi.generateLabel(shipmentId),
    onSuccess: (res) => {
      qc.setQueryData(
        queryKeys.admin.shipment(shipmentId),
        (prev: Shipment | undefined) =>
          prev
            ? {
                ...prev,
                label: { id: res.label_id, labelUrl: res.label_url },
              }
            : prev,
      );
    },
  });
}
