import type { PurchaseSuggestionsRepository } from '../purchase-suggestions.repository';
import { GeneratePurchaseSuggestionsUseCase } from './generate-purchase-suggestions.use-case';

describe('GeneratePurchaseSuggestionsUseCase', () => {
  const purchaseSuggestionsRepository = {
    findSuggestions: jest.fn(),
  } as unknown as PurchaseSuggestionsRepository;
  const useCase = new GeneratePurchaseSuggestionsUseCase(
    purchaseSuggestionsRepository,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('assigns priorities and actions using tenant-scoped purchase review data', async () => {
    jest
      .spyOn(purchaseSuggestionsRepository, 'findSuggestions')
      .mockResolvedValue([
        {
          productId: 'product-1',
          productName: 'Product 1',
          productSku: 'SKU-1',
          stock: 0,
          openPurchaseOrders: 0,
          pendingReceiptQuantity: 0,
        },
        {
          productId: 'product-2',
          productName: 'Product 2',
          productSku: null,
          stock: 3,
          openPurchaseOrders: 1,
          pendingReceiptQuantity: 12,
        },
      ]);

    await expect(useCase.execute('organization-1')).resolves.toEqual({
      suggestions: [
        {
          productId: 'product-1',
          productName: 'Product 1',
          productSku: 'SKU-1',
          stock: 0,
          openPurchaseOrders: 0,
          pendingReceiptQuantity: 0,
          priority: 'CRITICAL',
          recommendedAction: 'CREATE_PURCHASE_ORDER',
        },
        {
          productId: 'product-2',
          productName: 'Product 2',
          productSku: null,
          stock: 3,
          openPurchaseOrders: 1,
          pendingReceiptQuantity: 12,
          priority: 'ATTENTION',
          recommendedAction: 'REVIEW_OPEN_PURCHASE_ORDERS',
        },
      ],
    });

    expect(purchaseSuggestionsRepository.findSuggestions).toHaveBeenCalledWith(
      'organization-1',
    );
  });
});
