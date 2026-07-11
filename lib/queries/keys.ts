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
    addresses: ["shop", "addresses"] as const,
    address: (id: string) => ["shop", "address", id] as const,
    shippingMethods: ["shop", "shipping-methods"] as const,
    shippingCost: (methodId: string, weight: number, country: string) =>
      ["shop", "shipping-cost", methodId, weight, country] as const,
    paymentMethods: ["shop", "payment-methods"] as const,
    loyaltyBalance: (userId: number | string) =>
      ["shop", "loyalty", userId, "balance"] as const,
    loyaltyHistory: (userId: number | string) =>
      ["shop", "loyalty", userId, "history"] as const,
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
    inventoryGrouped: (params: Record<string, unknown>) =>
      ["admin", "inventory", "grouped", params] as const,
    inventoryGroupedDetail: (productId: number, page: number) =>
      ["admin", "inventory", "grouped", productId, page] as const,
    inventorySearch: (keyword: string) =>
      ["admin", "inventory", "search", keyword] as const,
    productCombinations: (productId: number) =>
      ["admin", "product", productId, "combinations"] as const,
    tags: ["admin", "tags"] as const,
    users: ["admin", "users"] as const,
    user: (userId: number | string) => ["admin", "user", userId] as const,
    userOrders: (userId: number | string) =>
      ["admin", "user", userId, "orders"] as const,
    loyaltyBalance: (userId: number | string) =>
      ["admin", "loyalty", userId, "balance"] as const,
    loyaltyHistory: (userId: number | string) =>
      ["admin", "loyalty", userId, "history"] as const,
    shippingMethods: ["admin", "shipping-methods"] as const,
  },
};
