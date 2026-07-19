// lib/queries/keys.ts
export const queryKeys = {
  shop: {
    categories: ["shop", "categories"] as const,
    categoryBySlug: (slug: string) =>
      ["shop", "categories", "slug", slug] as const,
    categoryProducts: (slug: string, page: number) =>
      ["shop", "categories", "slug", slug, "products", page] as const,
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
    myPickupRequests: ["shop", "pickup-requests"] as const,
    activePromotions: (params: Record<string, unknown> = {}) =>
      ["shop", "promotions", "active", params] as const,
    promotionBySlug: (slug: string) =>
      ["shop", "promotions", "slug", slug] as const,
    promotionProductsBySlug: (slug: string) =>
      ["shop", "promotions", "slug", slug, "products"] as const,
    newestProducts: (limit: number) =>
      ["shop", "products", "newest", limit] as const,
    activePopups: ["shop", "popups", "active"] as const,
  },
  admin: {
    products: (params: Record<string, unknown>) =>
      ["admin", "products", params] as const,
    product: (id: string | number) => ["admin", "product", id] as const,
    productTags: (productId: string) =>
      ["admin", "product", productId, "tags"] as const,
    productVariantSelections: (productId: string) =>
      ["admin", "product", productId, "variant-selections"] as const,
    categories: ["admin", "categories"] as const,
    category: (id: string) => ["admin", "category", id] as const,
    categoryAttributes: (categoryId: string) =>
      ["admin", "category", categoryId, "attributes"] as const,
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
    inventoryGroupedDetail: (
      productId: string,
      page: number,
      warehouseId?: string,
    ) =>
      [
        "admin",
        "inventory",
        "grouped",
        productId,
        page,
        warehouseId ?? "all",
      ] as const,
    inventorySearch: (keyword: string) =>
      ["admin", "inventory", "search", keyword] as const,
    productCombinations: (productId: number | string) =>
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
    settings: (category?: string) =>
      ["admin", "settings", category ?? "all"] as const,
    payments: (params: Record<string, unknown>) =>
      ["admin", "payments", params] as const,
    returns: (params: Record<string, unknown>) =>
      ["admin", "returns", params] as const,
    return: (id: string) => ["admin", "return", id] as const,
    shipments: (params: Record<string, unknown>) =>
      ["admin", "shipments", params] as const,
    pickupRequests: (params: Record<string, unknown>) =>
      ["admin", "pickup-requests", params] as const,
    pickupRequest: (id: string) => ["admin", "pickup-request", id] as const,
    promotions: (params: Record<string, unknown>) =>
      ["admin", "promotions", params] as const,
    promotion: (id: string) => ["admin", "promotion", id] as const,
    popups: (params: Record<string, unknown>) =>
      ["admin", "popups", params] as const,
    popup: (id: string) => ["admin", "popup", id] as const,
  },
};
