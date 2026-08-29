export interface PurchaseSuggestion {
  productId: string;
  productName: string;
  productSku: string | null;
  stock: number;
  openPurchaseOrders: number;
}

export interface PurchaseSuggestionsRepository {
  findSuggestions(organizationId: string): Promise<PurchaseSuggestion[]>;
}

export const PURCHASE_SUGGESTIONS_REPOSITORY = Symbol(
  'PURCHASE_SUGGESTIONS_REPOSITORY',
);
