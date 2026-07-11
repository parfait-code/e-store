// lib/api/loyalty.ts
import { apiClient } from "@/lib/api-client";
import type { LoyaltyTransaction, LoyaltyAdjustInput } from "@/lib/types";

export const loyaltyApi = {
  balance: (userId: number | string) =>
    apiClient.get<{ userId: number; balance: number }>(
      `/loyalty/${userId}/balance`,
    ),

  history: (userId: number | string) =>
    apiClient.get<LoyaltyTransaction[]>(`/loyalty/${userId}/history`),

  adjust: (payload: LoyaltyAdjustInput) =>
    apiClient.post("/loyalty/adjust", payload),
};
