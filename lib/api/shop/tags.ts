// lib/api/shop/tags.ts
import { apiClient } from "@/lib/api-client";
import type { Tag } from "@/lib/types";

export const shopTagsApi = {
  list: () =>
    apiClient
      .get<Tag[]>("/tags", { auth: false })
      .then((res) => (Array.isArray(res) ? res : [])),

  byProduct: (productId: string) =>
    apiClient
      .get<{ tag: Tag }[]>(`/product/${productId}/tags`, { auth: false })
      .then((res) => (Array.isArray(res) ? res.map((r) => r.tag) : []))
      .catch(() => [] as Tag[]),
};
