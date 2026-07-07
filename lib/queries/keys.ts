// lib/queries/keys.ts
export const queryKeys = {
  shop: {
    categories: ["shop", "categories"] as const,
    categoryBySlug: (slug: string) =>
      ["shop", "categories", "slug", slug] as const,
    products: (params: Record<string, unknown>) =>
      ["shop", "products", params] as const,
    product: (id: string | number) => ["shop", "product", id] as const,
    combinations: (productId: string | number) =>
      ["shop", "product", productId, "combinations"] as const,
  },
  admin: {
    products: (params: Record<string, unknown>) =>
      ["admin", "products", params] as const,
    product: (id: string | number) => ["admin", "product", id] as const,
    categories: ["admin", "categories"] as const,
    dashboardStats: ["admin", "dashboard", "stats"] as const,
    salesChart: (year: number) =>
      ["admin", "dashboard", "sales-chart", year] as const,
  },
};
