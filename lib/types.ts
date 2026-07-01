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
