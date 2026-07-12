// lib/api/admin/settings.ts
import { apiClient } from "@/lib/api-client";
import type { Setting } from "@/lib/types";

export const adminSettingsApi = {
  list: (category?: string) =>
    apiClient.get<Setting[]>(
      `/settings${category ? `?category=${encodeURIComponent(category)}` : ""}`,
    ),

  // value envoyé en natif (nombre, booléen, objet, tableau) — le serveur
  // se charge de la (re)sérialisation selon le type déclaré du setting.
  updateOne: (key: string, value: unknown) =>
    apiClient.patch<Setting>(`/settings/${key}`, { value }),

  updateBulk: (settings: { key: string; value: unknown }[]) =>
    apiClient.patch<Setting[]>("/settings", { settings }),
};

export const publicSettingsApi = {
  list: () => apiClient.get<Setting[]>("/settings/public", { auth: false }),
};
