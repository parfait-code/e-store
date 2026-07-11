// lib/queries/admin/useTags.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminTagsApi } from "@/lib/api/admin/tags";
import { queryKeys } from "@/lib/queries/keys";
import type { TagFormInput } from "@/lib/types";

export function useAdminTags() {
  return useQuery({
    queryKey: queryKeys.admin.tags,
    queryFn: adminTagsApi.list,
  });
}

export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TagFormInput) => adminTagsApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.admin.tags }),
  });
}

export function useUpdateTag(tagId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<TagFormInput>) =>
      adminTagsApi.update(tagId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.admin.tags }),
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tagId: string) => adminTagsApi.remove(tagId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.admin.tags }),
  });
}
