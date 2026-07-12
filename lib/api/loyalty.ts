// lib/api/loyalty.ts
import { apiClient } from "@/lib/api-client";
import type { LoyaltyTransaction, LoyaltyAdjustInput } from "@/lib/types";

export const loyaltyApi = {
  balance: (userId: string) =>
    apiClient.get<{ userId: string; balance: number }>(
      `/loyalty/${userId}/balance`,
    ),

  history: (userId: string) =>
    apiClient.get<LoyaltyTransaction[]>(`/loyalty/${userId}/history`),

  adjust: (payload: LoyaltyAdjustInput) =>
    apiClient.post("/loyalty/adjust", payload),
};
