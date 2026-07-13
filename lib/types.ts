// lib/types.ts

export type Role = "USER" | "ADMIN" | "MANAGER" | "SUPPORT";

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  phone: string | null;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiSuccess<T> {
  status: true;
  data: T;
}

export interface ApiErrorShape {
  status: false;
  error: {
    message: string;
    details?: {
      formErrors?: string[];
      fieldErrors?: Record<string, string[]>;
    };
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorShape;

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  products: { total: number; addedThisMonth: number };
  orders: { total: number; thisMonth: number; trend: number };
  users: { total: number; active: number };
  payments: { totalAmountThisMonth: number; currency: "XAF"; trend: number };
  inventory: { lowStockCount: number };
  shipments: { inProgress: number; trend: number };
  promotions: {
    active: number;
    couponUsageThisMonth: number;
    revenueFromCouponsThisMonth: number;
    currency: "XAF";
  };
}

export type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  position: number;
  isPrimary: boolean;
}

export interface AttributeOption {
  id: string;
  value: string;
  colorHex: string | null;
  position: number;
}

export interface AttributeDefinition {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  type: "TEXT" | "NUMBER" | "COLOR" | "BOOLEAN" | "SELECT";
  unit: string | null;
  isVariant: boolean;
  isFilterable: boolean;
  isRequired: boolean;
  position: number;
  options: AttributeOption[];
}

export interface ProductAttributeValue {
  id: string;
  value: string;
  attributeDefinition: AttributeDefinition;
}

export interface CategoryRef {
  id: string;
  name: string;
  slug: string;
}

export interface Category extends CategoryRef {
  description: string | null;
  imageUrl: string | null;
  iconUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isActive: boolean;
  parentId: string | null;
  parent: CategoryRef | null;
  children: CategoryRef[];
  _count: { products: number };
}

export interface ProductPricing {
  originalPrice: number;
  finalPrice: number;
  discountAmount: number;
  discountPercentage: number;
  hasDiscount: boolean;
  promotionId: string | null;
  discountId: string | null;
}

// --- ProductCombination (chargé via endpoint séparé) ---

export interface CombinationOptionRef {
  id: string;
  value: string;
  colorHex: string | null;
}

export interface CombinationAttributeRef {
  id: string;
  name: string;
}

export interface CombinationValue {
  attributeDefinition: CombinationAttributeRef;
  attributeOption: CombinationOptionRef;
}

export interface CombinationInventoryLine {
  quantity: number;
  warehouseId: string;
}

export interface ProductCombination {
  id: string;
  productId: string;
  optionsKey: string;
  sku: string | null;
  price: number | null;
  isActive: boolean;
  values: CombinationValue[];
  inventory: CombinationInventoryLine[];
  createdAt: string;
  updatedAt: string;
}

export interface AttributeSelection {
  attributeDefinitionId: string;
  attributeDefinition: AttributeDefinition;
  optionIds: string[];
}

export interface CombinationFormInput {
  sku?: string;
  price?: number;
  isActive?: boolean;
}

// --- Product sans combinaisons (chargées séparément) ---

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  status: ProductStatus;
  weight: number | null;
  categoryId: string;
  category: CategoryRef;
  images: ProductImage[];
  attributeValues: ProductAttributeValue[];
  pricing?: ProductPricing;
  createdAt: string;
  updatedAt: string;
}

export interface ProductWithCombinations extends Product {
  combinations: ProductCombination[];
}

// --- Endpoint séparé pour les combinaisons ---

export interface ProductCombinationsResponse {
  productId: string;
  combinations: ProductCombination[];
}

export type PickupRequestStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED";

export interface PickupRequest {
  id: string;
  userId: string;
  returnId: string; // toute pickup naît d'un retour APPROVED
  method: PickupCollectionMethod;
  addressId: string | null;
  warehouseId: string | null;
  address: { id: string; street: string; city: string; country: string } | null;
  warehouse: { id: string; name: string; location: string } | null;
  pickupDate: string | null;
  deadline: string | null;
  status: PickupRequestStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AttributeOptionUpdateInput {
  value?: string;
  colorHex?: string;
  position?: number;
}

export interface ProductFormInput {
  sku: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  status?: ProductStatus;
  weight?: number;
}

export interface CategoryFormInput {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  iconUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive?: boolean;
  parentId?: string;
}

export interface AttributeDefinitionFormInput {
  name: string;
  slug: string;
  type: "TEXT" | "NUMBER" | "COLOR" | "BOOLEAN" | "SELECT";
  unit?: string;
  isVariant?: boolean;
  isFilterable?: boolean;
  isRequired?: boolean;
  position?: number;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

// --- Adresses : recipientName devient requis, postalCode optionnel, ajout phone/addressLine2 ---

export interface Address {
  id: string;
  userId: string;
  recipientName: string;
  phone: string | null;
  street: string;
  addressLine2: string | null;
  city: string;
  state: string | null;
  country: string;
  postalCode: string | null; // était `string` (requis) — maintenant optionnel
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddressFormInput {
  recipientName: string; // NOUVEAU — requis, min 2 caractères
  phone?: string; // NOUVEAU
  street: string;
  addressLine2?: string; // NOUVEAU
  city: string;
  state?: string;
  country: string;
  postalCode: string | null; // était requis — maintenant optionnel
  isDefault?: boolean;
}

// --- Commande : shippingAddress suit le même schéma que Address, + billing, + basketId ---

export interface OrderAddressInput {
  recipientName: string;
  phone?: string;
  street: string;
  addressLine2?: string;
  city: string;
  state?: string;
  country: string;
  postalCode: string | null;
}


export interface InventoryGroupedLine {
  id: string;
  warehouseId: string;
  warehouse: { id: string; name: string };
  quantity: number;
}

export interface InventoryGroupedProduct {
  product: { id: string; name: string; sku: string; status: ProductStatus };
  hasVariants: boolean;
  totalQuantity: number;
  warehouseCount: number;
  combinationsWithStockCount: number;
  lowStockLineCount: number;
  outOfStockLineCount: number;
  lines?: InventoryGroupedLine[];
}

// --- Pickup requests : refonte complète du modèle ---

export type PickupCollectionMethod =
  | "ORIGINAL_ADDRESS"
  | "WAREHOUSE_DROPOFF"
  | "CUSTOM_ADDRESS";

export interface PickupRequestLocationUpdateInput {
  method: PickupCollectionMethod;
  address_id?: string;
  warehouse_id?: string;
  pickup_date?: string;
  deadline?: string;
}

export interface PickupRequestStatusUpdateInput {
  status: PickupRequestStatus;
  notes?: string;
}

// --- OrderItem avec support des combinaisons ---

export interface OrderItemCombinationRef {
  id: string;
  sku: string;
  price: number | null;
  values: CombinationValue[];
}

export interface OrderItem {
  id: string;
  productId: string;
  combinationId: string | null;
  combinationSnapshot: Record<string, string> | null;
  quantity: number;
  price: number;
  originalPrice: number;
  discountAmount: number;
  combination: OrderItemCombinationRef | null;
  product: { id: string; name: string; sku: string; images: ProductImage[] } | null;
  productName?: string;
  productSku?: string;
}

// Remplacer le champ `status: string` de l'interface Payment par :
export type PaymentStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "REFUNDED"
  | "CANCELLED";

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  method: string;
  status: PaymentStatus; // était `string`
  amount: number;
  currency: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentStatusUpdateInput {
  status: PaymentStatus;
  notes?: string;
}

export interface ShipmentStatusUpdateInput {
  status: ShipmentStatus;
  reason?: string;
}

export interface OrderStatusHistoryEntry {
  id: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  changedBy: number | null;
  reason: string | null;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  discountedAmount: number | null;
  shippingAddressSnapshot: Record<string, unknown>;
  billingAddressSnapshot: Record<string, unknown> | null;
  items: OrderItem[];
  payments: Payment[];
  appliedCoupon: {
    id: string;
    code: string;
    promotion: { id: string; name: string; slug: string };
  } | null;
  shippingMethod: { id: string; name: string; estimatedDays: number } | null;
  statusHistory: OrderStatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderStatusUpdateInput {
  status: OrderStatus;
  reason?: string;
  shippingCarrier?: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface TagWithProducts extends Tag {
  products: { id: string; name: string; sku: string }[];
}

export interface TagFormInput {
  name: string;
  slug: string;
}

export type PromotionStatus = "SCHEDULED" | "ACTIVE" | "EXPIRED" | "CANCELLED";
export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

export interface Discount {
  id: string;
  type: DiscountType;
  value: number;
  category: { id: string; name: string; slug: string } | null;
  products: { product: { id: string; name: string; price: number } }[];
}

export interface CouponCode {
  id: string;
  code: string;
  maxUses: number | null;
  usedCount: number;
  perUserLimit: number;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  effectiveIsActive?: boolean;
}

export interface Promotion {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  images: string[];
  status: PromotionStatus;
  isActive: boolean;
  startDate: string;
  endDate: string;
  discounts: Discount[];
  coupons: CouponCode[];
}

export interface PromotionFormInput {
  name: string;
  slug: string;
  description?: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

export interface DiscountFormInput {
  type: DiscountType;
  value: number;
  categoryId?: string;
  productIds?: string[];
}

export interface CouponFormInput {
  code: string;
  maxUses?: number;
  perUserLimit?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface UserFormInput {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  phone?: string;
  role?: Role;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  capacity: number | null;
}

export interface WarehouseFormInput {
  name: string;
  location: string;
  capacity?: number;
}

// --- Inventaire keyé par (productId, combinationId) ---

export interface InventoryItem {
  id: string;
  productId: string;
  combinationId: string | null;
  warehouseId: string;
  quantity: number;
  product: { id: string; name: string; sku: string; images: ProductImage[] };
  warehouse: Warehouse;
  combination: { id: string; sku: string } | null;
}

export interface InventoryFormInput {
  product_id: string;
  warehouse_id: string;
  combination_id?: string;
  quantity?: number;
}

export interface InventoryTransferInput {
  item_id: string;
  from_warehouse: string;
  to_warehouse: string;
  quantity: number;
}

export type ShipmentStatus =
  | "PENDING"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED";

export interface TrackingEvent {
  id: string;
  status: string;
  location: string | null;
  createdAt: string;
}

export interface Shipment {
  id: string;
  orderId: string | null;
  senderName: string;
  senderAddress: string;
  recipientName: string;
  recipientAddress: string;
  weight: number;
  dimensions: { length: number; width: number; height: number } | null;
  status: ShipmentStatus;
  trackingNumber: string | null;
  estimatedDeliveryDate: string | null;
  trackingEvents: TrackingEvent[];
  label: { id: string; labelUrl: string } | null;
}

export interface ShipmentTrackingInput {
  status: string;
  location?: string;
  shipment_status?: ShipmentStatus;
}

export type ReturnStatus = "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";

export interface ReturnRequest {
  id: string;
  orderId: string;
  userId: string;
  status: ReturnStatus;
  reason: string;
  notes: string | null;
  items: {
    id: string;
    orderItemId: string;
    quantity: number;
    condition: string | null;
    orderItem: {
      id: string;
      productId: string;
      quantity: number;
      price: number;
    };
  }[];
  order: { id: string; userId: string; status: OrderStatus };
}

export interface ReturnStatusUpdateInput {
  status: ReturnStatus;
  notes?: string;
}

export type LoyaltyTransactionType =
  | "EARNED"
  | "REDEEMED"
  | "EXPIRED"
  | "ADJUSTED";

export interface LoyaltyTransaction {
  id: string;
  points: number;
  type: LoyaltyTransactionType;
  orderId: string | null;
  createdAt: string;
}

export interface LoyaltyAdjustInput {
  userId: string;
  points: number;
  type: LoyaltyTransactionType;
  orderId?: string;
}

export interface SalesChartPoint {
  label: string;
  amount: number;
  orderCount: number;
}

export interface SalesChartResponse {
  period: string;
  year: number;
  currency: "XAF";
  points: SalesChartPoint[];
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string | null;
  estimatedDays: number;
  basePrice: number;
  pricePerKg: number;
  isActive: boolean;
  zones: string[];
}

export interface ShippingMethodFormInput {
  name: string;
  description?: string;
  estimatedDays: number;
  basePrice: number;
  pricePerKg?: number;
  isActive?: boolean;
  zones: string[];
}

export interface ShipmentFormInput {
  sender_name: string;
  sender_address: string;
  recipient_name: string;
  recipient_address: string;
  weight: number;
  dimensions?: { length: number; width: number; height: number };
  order_id?: string;
  estimated_delivery_at?: string;
}

// --- Basket avec support des combinaisons ---

export interface Basket {
  id: string;
  userId: string;
  items: {
    id: string;
    productId: string;
    combinationId: string | null;
    quantity: number;
    product: Product;
    combination: ProductCombination | null;
  }[];
}

export interface ProductReview {
  id: string;
  rating: number;
  comment: string | null;
  user: { id: number; username: string; firstName: string; lastName: string };
  createdAt: string;
  updatedAt: string;
}

export interface ProductReviewsResponse {
  product_id: string;
  average_rating: number;
  total_reviews: number;
  reviews: ProductReview[];
}

export interface PromotionPublic {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  images: string[];
  status: PromotionStatus;
  isActive: boolean;
  startDate: string;
  endDate: string;
  discounts: {
    id: string;
    type: DiscountType;
    value: number;
    category: { id: string; name: string; slug: string } | null;
    products: { product: { id: string; name: string; price: number } }[];
  }[];
  coupons: {
    id: string;
    code: string;
    maxUses: number | null;
    usedCount: number;
    perUserLimit: number;
    startDate: string | null;
    endDate: string | null;
    isActive: boolean;
    effectiveIsActive?: boolean;
  }[];
}

export interface CategoryProductsResponse {
  category: CategoryRef;
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SignupFormInput {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  phone?: string;
}

// --- Cart local avec combinationId ---

export interface CartLocalItem {
  productId: string;
  combinationId: string | null;
  quantity: number;
  name: string;
  price: number;
  pricing?: ProductPricing;
  image: string | null;
  sku: string;
  slug?: string;
  maxQuantity?: number;
  weight?: number;
}

export interface CartContextValue {
  items: CartLocalItem[];
  totalItems: number;
  totalAmount: number;
  addItem: (item: CartLocalItem) => void;
  removeItem: (productId: string, combinationId: string | null) => void;
  updateQuantity: (
    productId: string,
    combinationId: string | null,
    quantity: number,
  ) => void;
  clearCart: () => void;
  syncToServer: () => Promise<void>;
  isLoaded: boolean;
}

export interface AddressFormInput {
  street: string;
  city: string;
  state?: string;
  country: string;
  postalCode: string | null;
  isDefault?: boolean;
}

// --- Wishlist avec combinationId ---

export interface WishlistItem {
  id: string;
  productId: string;
  combinationId: string | null;
  product: {
    id: string;
    name: string;
    price: number;
    images: { url: string }[];
  };
  combination: { id: string; sku: string; price: number | null } | null;
  addedAt: string;
}

export interface Wishlist {
  id: string;
  userId: string;
  items: WishlistItem[];
}

export interface ReviewCreateInput {
  order_item_id: string;
  product_id: string;
  rating: number;
  comment?: string;
}

export interface ReturnCreateInput {
  order_id: string;
  reason: string;
  notes?: string;
  items: { order_item_id: string; quantity: number; condition?: string }[];
}

export interface PaymentMethodOption {
  id: string;
  name: string;
  description: string;
  available: boolean;
  message?: string;
}

export type PaymentMethodType =
  | "CASH_ON_DELIVERY"
  | "PAYPAL"
  | "STRIPE"
  | "CINETPAY";

// --- OrderCreateInput avec combinationId ---

export interface OrderCreateInput {
  items?: { id: string; combinationId?: string; quantity: number }[];
  basketId?: string; // alternative à `items`
  shippingAddressId?: string;
  shippingAddress: OrderAddressInput;
  billingAddressId?: string;
  billingAddress?: OrderAddressInput;
  shippingMethodId?: string;
  paymentMethodId?: string;
  notes?: string;
  couponCode?: string;
}

export interface ShippingCalculateInput {
  shippingMethodId: string;
  weight: number;
}

export interface ShippingCostResponse {
  cost: number;
}

export interface PaymentsAdminQuery {
  page?: number;
  limit?: number;
  status?: string;
  method?: string;
  order_id?: string;
}

export interface CouponValidateInput {
  code: string;
  basketId: string;
}

export interface CouponValidateResponse {
  valid: boolean;
  message?: string;
  discount?: {
    type: DiscountType;
    value: number;
  };
}

export interface AddressValidateInput {
  recipientName: string;
  phone?: string;
  street: string;
  addressLine2?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string; // était `postal_code` (snake_case) — le body /address/validate est en camelCase maintenant
}

export interface AddressValidateResponse {
  valid: boolean;
  normalized_address?: {
    recipientName: string;
    phone?: string;
    street: string;
    addressLine2?: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;
  };
}

export interface PromotionProductsResponse {
  promotionId: string;
  promotionName: string;
  count: number;
  products: Product[];
}

export type SettingType = "STRING" | "NUMBER" | "BOOLEAN" | "JSON";

export interface Setting {
  id: string;
  key: string;
  value: string; // toujours une string en base, y compris pour JSON (à parser)
  type: SettingType;
  category: string;
  description: string | null;
  isPublic: boolean;
  updatedBy: number | null;
  createdAt: string;
  updatedAt: string;
}
