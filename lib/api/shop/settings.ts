// lib/api/shop/settings.ts
import { apiClient } from "@/lib/api-client";
import type { Setting } from "@/lib/types";

export const shopSettingsApi = {
  public: () =>
    apiClient
      .get<Setting[]>("/settings/public", { auth: false })
      .then((res) => (Array.isArray(res) ? res : [])),
};
