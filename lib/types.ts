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

// lib/types.ts (ajouts)

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
