// lib/api/admin/users.ts
import { apiClient } from "@/lib/api-client";
import type { User, UserFormInput, Role, Order, Paginated } from "@/lib/types";

export const adminUsersApi = {
  list: () => apiClient.get<User[]>("/user/all"),

  byId: (userId: string) => apiClient.get<User>(`/user/${userId}`),

  ordersForUser: (userId: string, limit = 10) =>
    apiClient.get<Paginated<Order>>(`/user/${userId}/orders?limit=${limit}`),

  create: (payload: Record<string, unknown>) =>
    apiClient.post<User>("/user", payload),

  changeRole: (userId: string, role: Role) =>
    apiClient.patch(`/user/change-role/${userId}`, { role }),

  setStatus: (userId: string, isActive: boolean) =>
    apiClient.patch<User>(`/user/${userId}/status`, { isActive }),

  remove: (userId: string) => apiClient.delete(`/user/${userId}`),
};

export type { UserFormInput };
