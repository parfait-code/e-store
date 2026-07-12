// lib/queries/admin/useSettings.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminSettingsApi } from "@/lib/api/admin/settings";
import { queryKeys } from "@/lib/queries/keys";
import type { Setting } from "@/lib/types";

export function useAdminSettings(category?: string) {
  return useQuery({
    queryKey: queryKeys.admin.settings(category),
    queryFn: () => adminSettingsApi.list(category),
  });
}

export function useUpdateSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: unknown }) =>
      adminSettingsApi.updateOne(key, value),
    onSuccess: (updated: Setting) => {
      qc.setQueriesData<Setting[] | undefined>(
        {
          predicate: (q) =>
            q.queryKey[0] === "admin" && q.queryKey[1] === "settings",
        },
        (prev) => prev?.map((s) => (s.key === updated.key ? updated : s)),
      );
    },
  });
}
