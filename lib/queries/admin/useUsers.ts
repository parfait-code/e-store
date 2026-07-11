// lib/queries/admin/useUsers.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminUsersApi } from "@/lib/api/admin/users";
import { queryKeys } from "@/lib/queries/keys";
import type { User, Role } from "@/lib/types";

export function useAdminUsers() {
  return useQuery({
    queryKey: queryKeys.admin.users,
    queryFn: adminUsersApi.list,
  });
}

export function useAdminUser(userId: string) {
  return useQuery({
    queryKey: queryKeys.admin.user(userId),
    queryFn: () => adminUsersApi.byId(userId),
    enabled: Boolean(userId),
  });
}

export function useAdminUserOrders(userId: string, limit = 10) {
  return useQuery({
    queryKey: queryKeys.admin.userOrders(userId),
    queryFn: () => adminUsersApi.ordersForUser(userId, limit),
    enabled: Boolean(userId),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      adminUsersApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.admin.users }),
  });
}

// Le backend ne renvoie pas le user à jour sur ce endpoint — on met à jour
// le cache localement (setQueryData) plutôt que de refaire un round-trip.
export function useChangeUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: Role }) =>
      adminUsersApi.changeRole(userId, role),
    onSuccess: (_data, { userId, role }) => {
      qc.setQueryData(queryKeys.admin.users, (prev: User[] | undefined) =>
        prev?.map((u) => (u.id === userId ? { ...u, role } : u)),
      );
      qc.setQueryData(queryKeys.admin.user(userId), (prev: User | undefined) =>
        prev ? { ...prev, role } : prev,
      );
    },
  });
}

export function useSetUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, isActive }: { userId: number; isActive: boolean }) =>
      adminUsersApi.setStatus(userId, isActive),
    onSuccess: (updated: User) => {
      qc.setQueryData(queryKeys.admin.users, (prev: User[] | undefined) =>
        prev?.map((u) => (u.id === updated.id ? updated : u)),
      );
      qc.setQueryData(queryKeys.admin.user(updated.id), updated);
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => adminUsersApi.remove(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.admin.users }),
  });
}
