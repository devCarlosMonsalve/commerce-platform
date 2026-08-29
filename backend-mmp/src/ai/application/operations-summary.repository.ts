export interface OperationsSummarySnapshot {
  products: {
    total: number;
    active: number;
    outOfStock: number;
  };
  salesOrders: Record<string, number>;
  purchaseOrders: Record<string, number>;
}

export interface OperationsSummaryRepository {
  getSnapshot(organizationId: string): Promise<OperationsSummarySnapshot>;
}

export const OPERATIONS_SUMMARY_REPOSITORY = Symbol(
  'OPERATIONS_SUMMARY_REPOSITORY',
);
