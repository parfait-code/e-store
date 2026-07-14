// lib/api/admin/popups.ts
import { apiClient } from "@/lib/api-client";
import type {
  Popup,
  PopupWithResolvedUrl,
  PopupFormInput,
  PopupTargetType,
} from "@/lib/types";

export const adminPopupsApi = {
  list: (
    params: {
      isActive?: "" | "true" | "false";
      targetType?: PopupTargetType | "";
    } = {},
  ) => {
    const qs = new URLSearchParams();
    if (params.isActive) qs.set("isActive", params.isActive);
    if (params.targetType) qs.set("targetType", params.targetType);
    return apiClient
      .get<Popup[]>(`/popups?${qs.toString()}`)
      .then((res) => (Array.isArray(res) ? res : []));
  },

  byId: (popupId: string) =>
    apiClient.get<PopupWithResolvedUrl>(`/popups/${popupId}`),

  create: (payload: PopupFormInput) =>
    apiClient.post<PopupWithResolvedUrl>("/popups", payload),

  update: (popupId: string, payload: Partial<PopupFormInput>) =>
    apiClient.put<PopupWithResolvedUrl>(`/popups/${popupId}`, payload),

  remove: (popupId: string) => apiClient.delete(`/popups/${popupId}`),

  uploadImage: (popupId: string, file: File) => {
    const fd = new FormData();
    fd.append("image", file);
    return apiClient.post<PopupWithResolvedUrl>(
      `/popups/${popupId}/image`,
      fd,
      { isFormData: true },
    );
  },

  deleteImage: (popupId: string) =>
    apiClient.delete<PopupWithResolvedUrl>(`/popups/${popupId}/image`),
};
