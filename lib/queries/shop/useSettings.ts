// lib/queries/shop/useSettings.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { shopSettingsApi } from "@/lib/api/shop/settings";

function parseSettingValue(setting: { type: string; value: string }): unknown {
  if (setting.type === "JSON") {
    try {
      return JSON.parse(setting.value);
    } catch {
      return null;
    }
  }
  return setting.value;
}

export function usePublicSettings() {
  return useQuery({
    queryKey: ["shop", "settings", "public"],
    queryFn: shopSettingsApi.public,
    staleTime: 10 * 60 * 1000,
  });
}

export function useSupportedCountries(): string[] {
  const { data = [] } = usePublicSettings();
  const setting = data.find((s) => s.key === "store.supported_countries");
  if (!setting) return [];
  const parsed = parseSettingValue(setting);
  return Array.isArray(parsed) ? (parsed as string[]) : [];
}

export function useStoreCurrency(): string {
  const { data = [] } = usePublicSettings();
  return data.find((s) => s.key === "store.currency")?.value ?? "XAF";
}
