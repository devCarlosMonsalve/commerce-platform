import type { AiTextGenerationService } from '../ai-text-generation.service';
import type { OperationalSearchRepository } from '../operational-search.repository';
import { SearchOperationsUseCase } from './search-operations.use-case';

describe('SearchOperationsUseCase', () => {
  const aiTextGenerationService = {
    generateText: jest.fn(),
  } as unknown as AiTextGenerationService;
  const operationalSearchRepository = {
    findOutOfStockProducts: jest.fn(),
    findPendingSalesOrders: jest.fn(),
    findOpenPurchaseOrders: jest.fn(),
  } as unknown as OperationalSearchRepository;
  const useCase = new SearchOperationsUseCase(
    aiTextGenerationService,
    operationalSearchRepository,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('runs only the approved tenant-scoped query selected by the classifier', async () => {
    jest
      .spyOn(aiTextGenerationService, 'generateText')
      .mockResolvedValue({
        provider: 'gemini',
        model: 'gemini-3.6-flash',
        text: 'OUT_OF_STOCK_PRODUCTS',
      });
    jest
      .spyOn(operationalSearchRepository, 'findOutOfStockProducts')
      .mockResolvedValue([{ id: 'product-1', label: 'Paper', detail: 'Stock 0' }]);

    await expect(
      useCase.execute('organization-1', 'Which products are out of stock?'),
    ).resolves.toEqual({
      intent: 'OUT_OF_STOCK_PRODUCTS',
      provider: 'gemini',
      model: 'gemini-3.6-flash',
      items: [{ id: 'product-1', label: 'Paper', detail: 'Stock 0' }],
    });

    expect(
      operationalSearchRepository.findOutOfStockProducts,
    ).toHaveBeenCalledWith('organization-1');
    expect(
      operationalSearchRepository.findPendingSalesOrders,
    ).not.toHaveBeenCalled();
    expect(
      operationalSearchRepository.findOpenPurchaseOrders,
    ).not.toHaveBeenCalled();
  });

  it('does not query data when the classifier returns an unsupported intent', async () => {
    jest
      .spyOn(aiTextGenerationService, 'generateText')
      .mockResolvedValue({
        provider: 'gemini',
        model: 'gemini-3.6-flash',
        text: 'CREATE_PURCHASE_ORDER',
      });

    await expect(
      useCase.execute('organization-1', 'Create a purchase order'),
    ).resolves.toMatchObject({
      intent: 'UNSUPPORTED',
      items: [],
    });

    expect(
      operationalSearchRepository.findOutOfStockProducts,
    ).not.toHaveBeenCalled();
    expect(
      operationalSearchRepository.findPendingSalesOrders,
    ).not.toHaveBeenCalled();
    expect(
      operationalSearchRepository.findOpenPurchaseOrders,
    ).not.toHaveBeenCalled();
  });
});
