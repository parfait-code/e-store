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
    orders: (params: Record<string, unknown>) =>
      ["shop", "orders", params] as const,
    order: (id: string) => ["shop", "order", id] as const,
    orderReturns: (orderId: string) =>
      ["shop", "order", orderId, "returns"] as const,
  },
  admin: {
    products: (params: Record<string, unknown>) =>
      ["admin", "products", params] as const,
    product: (id: string | number) => ["admin", "product", id] as const,
    categories: ["admin", "categories"] as const,
    dashboardStats: ["admin", "dashboard", "stats"] as const,
    salesChart: (year: number) =>
      ["admin", "dashboard", "sales-chart", year] as const,
    orders: (params: Record<string, unknown>) =>
      ["admin", "orders", params] as const,
    order: (id: string) => ["admin", "order", id] as const,
    orderShipment: (orderId: string) =>
      ["admin", "order", orderId, "shipment"] as const,
    shipment: (id: string) => ["admin", "shipment", id] as const,
    warehouses: ["admin", "warehouses"] as const,
    warehouseInventory: (warehouseId: string) =>
      ["admin", "warehouses", warehouseId, "inventory"] as const,
    inventoryList: (page: number) =>
      ["admin", "inventory", "list", page] as const,
    inventoryLowStock: ["admin", "inventory", "low-stock"] as const,
    inventoryOutOfStock: ["admin", "inventory", "out-of-stock"] as const,
    inventorySearch: (keyword: string) =>
      ["admin", "inventory", "search", keyword] as const,
    productCombinations: (productId: number) =>
      ["admin", "product", productId, "combinations"] as const,
  },
};
