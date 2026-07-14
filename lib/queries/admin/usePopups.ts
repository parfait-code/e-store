// lib/queries/admin/usePopups.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminPopupsApi } from "@/lib/api/admin/popups";
import { queryKeys } from "@/lib/queries/keys";
import type { PopupFormInput, PopupTargetType } from "@/lib/types";

export function useAdminPopups(
  params: {
    isActive?: "" | "true" | "false";
    targetType?: PopupTargetType | "";
  } = {},
) {
  return useQuery({
    queryKey: queryKeys.admin.popups(params),
    queryFn: () => adminPopupsApi.list(params),
  });
}

export function useAdminPopup(popupId: string) {
  return useQuery({
    queryKey: queryKeys.admin.popup(popupId),
    queryFn: () => adminPopupsApi.byId(popupId),
    enabled: Boolean(popupId),
  });
}

export function useCreatePopup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PopupFormInput) => adminPopupsApi.create(payload),
    onSuccess: () =>
      qc.invalidateQueries({
        predicate: (q) =>
          q.queryKey[0] === "admin" && q.queryKey[1] === "popups",
      }),
  });
}

export function useUpdatePopup(popupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<PopupFormInput>) =>
      adminPopupsApi.update(popupId, payload),
    onSuccess: (updated) => {
      qc.setQueryData(queryKeys.admin.popup(popupId), updated);
      qc.invalidateQueries({
        predicate: (q) =>
          q.queryKey[0] === "admin" && q.queryKey[1] === "popups",
      });
    },
  });
}

export function useDeletePopup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (popupId: string) => adminPopupsApi.remove(popupId),
    onSuccess: () =>
      qc.invalidateQueries({
        predicate: (q) =>
          q.queryKey[0] === "admin" && q.queryKey[1] === "popups",
      }),
  });
}

export function useUploadPopupImage(popupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => adminPopupsApi.uploadImage(popupId, file),
    onSuccess: (updated) => {
      qc.setQueryData(queryKeys.admin.popup(popupId), updated);
      qc.invalidateQueries({
        predicate: (q) =>
          q.queryKey[0] === "admin" && q.queryKey[1] === "popups",
      });
    },
  });
}

export function useDeletePopupImage(popupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminPopupsApi.deleteImage(popupId),
    onSuccess: (updated) => {
      qc.setQueryData(queryKeys.admin.popup(popupId), updated);
      qc.invalidateQueries({
        predicate: (q) =>
          q.queryKey[0] === "admin" && q.queryKey[1] === "popups",
      });
    },
  });
}
