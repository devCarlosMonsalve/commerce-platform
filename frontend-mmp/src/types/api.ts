// Generic API response shape from backend
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  statusCode: number;
  message: string | string[];
  path: string;
  timestamp: string;
}

// Auth
export interface UserResponse {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
}

// Organizations
export interface OrganizationResponse {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationRequest {
  name: string;
  slug: string;
}

// Products
export type ProductStatus = 'ACTIVE' | 'INACTIVE';

export interface ProductResponse {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  sku: string | null;
  price: string;
  stock: number;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProductUpsertRequest {
  name: string;
  description?: string;
  sku?: string;
  price: number;
  stock?: number;
}

// Customers
export interface CustomerResponse {
  id: string;
  organizationId: string;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerUpsertRequest {
  name: string;
  email?: string;
  phone?: string;
}

// Orders
export type OrderStatus = 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface OrderItemResponse {
  id: string;
  productId: string;
  productName: string;
  productSku: string | null;
  productDescription: string | null;
  quantity: number;
  unitPrice: string;
  total: string;
}

export interface OrderResponse {
  id: string;
  organizationId: string;
  customerId: string;
  status: OrderStatus;
  total: string;
  items: OrderItemResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}
