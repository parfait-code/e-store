// lib/api/admin/users.ts
import { apiClient } from "@/lib/api-client";
import type { User, UserFormInput, Role, Order, Paginated } from "@/lib/types";

export const adminUsersApi = {
  list: () => apiClient.get<User[]>("/user/all"),

  byId: (userId: number | string) => apiClient.get<User>(`/user/${userId}`),

  ordersForUser: (userId: number | string, limit = 10) =>
    apiClient.get<Paginated<Order>>(`/user/${userId}/orders?limit=${limit}`),

  create: (payload: Record<string, unknown>) =>
    apiClient.post<User>("/user", payload),

  changeRole: (userId: number | string, role: Role) =>
    apiClient.patch(`/user/change-role/${userId}`, { role }),

  setStatus: (userId: number | string, isActive: boolean) =>
    apiClient.patch<User>(`/user/${userId}/status`, { isActive }),

  remove: (userId: number | string) => apiClient.delete(`/user/${userId}`),
};

export type { UserFormInput };
