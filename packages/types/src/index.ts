// Tenant / Organization
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

// User & Auth
export interface User {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

// Product & Catalog
export interface Product {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  sku: string;
  stock: number;
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

// Customer
export interface Customer {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Order
export interface Order {
  id: string;
  tenantId: string;
  customerId: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// API Response wrappers
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
