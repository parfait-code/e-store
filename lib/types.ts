// lib/types.ts

export type Role = "USER" | "ADMIN" | "MANAGER" | "SUPPORT";

export interface User {
  id: number;
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
  productId: number;
  optionsKey: string;
  sku: string | null; // corrigé — peut être absent
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
  id: number;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  status: ProductStatus;
  weight: number | null;
  brand: string | null;
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
  productId: number;
  combinations: ProductCombination[];
}

export type PickupRequestStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export interface PickupRequest {
  id: string;
  userId: number;
  pickupDate: string;
  pickupAddress: string;
  status: PickupRequestStatus;
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
  brand?: string;
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

export interface Address {
  id: string;
  userId: number;
  street: string;
  city: string;
  state: string | null;
  country: string;
  postalCode: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
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
  productId: number;
  combinationId: string | null;
  combinationSnapshot: Record<string, string> | null;
  quantity: number;
  price: number;
  originalPrice: number;
  discountAmount: number;
  combination: OrderItemCombinationRef | null;
  product: { id: number; name: string; sku: string; images: ProductImage[] };
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
  userId: number;
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
  userId: number;
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
  products: { id: number; name: string; sku: string }[];
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
  products: { product: { id: number; name: string; price: number } }[];
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
  productIds?: number[];
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
  productId: number;
  combinationId: string | null;
  warehouseId: string;
  quantity: number;
  product: { id: number; name: string; sku: string; images: ProductImage[] };
  warehouse: Warehouse;
  combination: { id: string; sku: string } | null;
}

export interface InventoryFormInput {
  product_id: number;
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
}

export type ReturnStatus = "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";

export interface ReturnRequest {
  id: string;
  orderId: string;
  userId: number;
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
      productId: number;
      quantity: number;
      price: number;
    };
  }[];
  order: { id: string; userId: number; status: OrderStatus };
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
  userId: number;
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
  userId: number;
  items: {
    id: string;
    productId: number;
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
  product_id: number;
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
    products: { product: { id: number; name: string; price: number } }[];
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
  productId: number;
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
  removeItem: (productId: number, combinationId: string | null) => void;
  updateQuantity: (
    productId: number,
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
  postalCode: string;
  isDefault?: boolean;
}

// --- Wishlist avec combinationId ---

export interface WishlistItem {
  id: string;
  productId: number;
  combinationId: string | null;
  product: {
    id: number;
    name: string;
    price: number;
    images: { url: string }[];
  };
  combination: { id: string; sku: string; price: number | null } | null;
  addedAt: string;
}

export interface Wishlist {
  id: string;
  userId: number;
  items: WishlistItem[];
}

export interface ReviewCreateInput {
  order_item_id: string;
  product_id: number;
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
  items: { id: string; combinationId?: string; quantity: number }[];
  shippingAddressId?: string;
  shippingAddress: {
    street: string;
    city: string;
    state?: string;
    country: string;
    postalCode: string;
  };
  shippingMethodId?: string;
  paymentMethodId?: string;
  notes?: string;
  couponCode?: string;
}

export interface PickupRequestFormInput {
  pickup_date: string;
  pickup_address: string;
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
  street: string;
  city: string;
  state?: string;
  country: string;
  postal_code: string;
}

export interface AddressValidateResponse {
  valid: boolean;
  normalized_address?: {
    street: string;
    city: string;
    state?: string;
    country: string;
    postal_code: string; // corrigé (était postalCode)
  };
}

export interface PromotionProductsResponse {
  promotionId: string;
  promotionName: string;
  count: number;
  products: Product[];
}
