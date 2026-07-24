// lib/api/shop/user.ts
import { apiClient } from "@/lib/api-client";
import type { User } from "@/lib/types";

export const shopUserApi = {
  me: () => apiClient.get<User>("/user"),
};
