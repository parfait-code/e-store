// lib/api/shop/popups.ts
import { apiClient } from "@/lib/api-client";
import type { PopupWithResolvedUrl } from "@/lib/types";

export const shopPopupsApi = {
  active: () =>
    apiClient
      .get<PopupWithResolvedUrl[]>("/popups/active")
      .then((res) => (Array.isArray(res) ? res : [])),

  markSeen: (popupId: string) =>
    apiClient.post(`/popups/${popupId}/seen`, undefined, { auth: true }),
};
