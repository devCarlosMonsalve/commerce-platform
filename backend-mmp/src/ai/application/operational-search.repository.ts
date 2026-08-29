export type OperationalSearchIntent =
  | 'OUT_OF_STOCK_PRODUCTS'
  | 'PENDING_SALES_ORDERS'
  | 'OPEN_PURCHASE_ORDERS'
  | 'UNSUPPORTED';

export interface OperationalSearchItem {
  id: string;
  label: string;
  detail: string;
}

export interface OperationalSearchRepository {
  findOutOfStockProducts(organizationId: string): Promise<OperationalSearchItem[]>;
  findPendingSalesOrders(
    organizationId: string,
  ): Promise<OperationalSearchItem[]>;
  findOpenPurchaseOrders(
    organizationId: string,
  ): Promise<OperationalSearchItem[]>;
}

export const OPERATIONAL_SEARCH_REPOSITORY = Symbol(
  'OPERATIONAL_SEARCH_REPOSITORY',
);
