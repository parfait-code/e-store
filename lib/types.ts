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

export interface Variant {
  id: string;
  productId: number;
  sku: string;
  price: number | null;
  isActive: boolean;
  attributeValues: {
    id: string;
    value: string;
    attributeDefinition: AttributeDefinition;
  }[];
  inventory: { id: string; quantity: number; warehouseId: string }[];
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
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
  variants: Variant[];
  attributeValues: ProductAttributeValue[];
  createdAt: string;
  updatedAt: string;
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

export interface VariantFormInput {
  sku: string;
  price?: number;
  isActive?: boolean;
  attributes: { attributeDefinitionId: string; value: string }[];
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

export interface OrderItem {
  id: string;
  productId: number;
  quantity: number;
  price: number;
  originalPrice: number;
  discountAmount: number;
  product: { id: number; name: string; sku: string; images: ProductImage[] };
}

export interface Payment {
  id: string;
  orderId: string;
  userId: number;
  method: string;
  status: string;
  amount: number;
  currency: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
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
