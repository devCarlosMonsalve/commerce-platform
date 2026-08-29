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

// AI
export interface AiOperationsSummaryResponse {
  provider: 'openai' | 'gemini';
  model: string;
  text: string;
}

export type OperationsSummarySection =
  | 'products'
  | 'sales-orders'
  | 'purchase-orders';

export interface AiPurchaseSuggestionsResponse extends AiOperationsSummaryResponse {
  suggestions: Array<{
    productId: string;
    productName: string;
    productSku: string | null;
    stock: number;
    openPurchaseOrders: number;
  }>;
}

export type OperationalSearchIntent =
  | 'OUT_OF_STOCK_PRODUCTS'
  | 'PENDING_SALES_ORDERS'
  | 'OPEN_PURCHASE_ORDERS'
  | 'UNSUPPORTED';

export interface OperationalSearchResponse {
  intent: OperationalSearchIntent;
  provider: 'openai' | 'gemini';
  model: string;
  items: Array<{
    id: string;
    label: string;
    detail: string;
  }>;
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
  user: UserResponse;
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

// Suppliers
export interface SupplierResponse {
  id: string;
  organizationId: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  taxId: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierUpsertRequest {
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  taxId?: string;
  address?: string;
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

// Purchase orders
export type PurchaseOrderStatus =
  | 'DRAFT'
  | 'ORDERED'
  | 'PARTIALLY_RECEIVED'
  | 'RECEIVED'
  | 'CANCELLED';

export interface PurchaseOrderItemResponse {
  id: string;
  productId: string;
  productName: string;
  productSku: string | null;
  productDescription: string | null;
  orderedQuantity: number;
  receivedQuantity: number;
  unitCost: string;
  total: string;
}

export interface PurchaseReceiptItemResponse {
  id: string;
  purchaseOrderItemId: string;
  productId: string;
  productName: string;
  quantity: number;
}

export interface PurchaseReceiptResponse {
  id: string;
  organizationId: string;
  purchaseOrderId: string;
  reference: string | null;
  notes: string | null;
  receivedAt: string;
  items: PurchaseReceiptItemResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderResponse {
  id: string;
  organizationId: string;
  supplierId: string;
  status: PurchaseOrderStatus;
  total: string;
  orderedAt: string | null;
  receivedAt: string | null;
  items: PurchaseOrderItemResponse[];
  receipts: PurchaseReceiptResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchaseOrderRequest {
  supplierId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitCost: number;
  }>;
}

export interface ReceivePurchaseOrderRequest {
  reference?: string;
  notes?: string;
  items: Array<{
    purchaseOrderItemId: string;
    quantity: number;
  }>;
}
