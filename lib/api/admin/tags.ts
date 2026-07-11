// lib/api/admin/tags.ts
import { apiClient } from "@/lib/api-client";
import type { Tag, TagFormInput } from "@/lib/types";

export const adminTagsApi = {
  list: () => apiClient.get<Tag[]>("/tags"),

  create: (payload: TagFormInput) => apiClient.post<Tag>("/tags", payload),

  update: (tagId: string, payload: Partial<TagFormInput>) =>
    apiClient.patch<Tag>(`/tags/${tagId}`, payload),

  remove: (tagId: string) => apiClient.delete(`/tags/${tagId}`),
};
