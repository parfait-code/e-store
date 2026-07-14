// lib/api/shop/popups.ts
import { apiClient } from "@/lib/api-client";
import type { PopupWithResolvedUrl } from "@/lib/types";

export const shopPopupsApi = {
  active: () =>
    apiClient
      .get<PopupWithResolvedUrl[]>("/popups/active", { auth: false })
      .then((res) => (Array.isArray(res) ? res : [])),
};
