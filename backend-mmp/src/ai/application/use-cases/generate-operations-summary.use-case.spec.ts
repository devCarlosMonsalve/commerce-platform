import type { AiTextGenerationService } from '../ai-text-generation.service';
import type {
  OperationsSummaryRepository,
  OperationsSummarySnapshot,
} from '../operations-summary.repository';
import { GenerateOperationsSummaryUseCase } from './generate-operations-summary.use-case';

describe('GenerateOperationsSummaryUseCase', () => {
  const snapshot: OperationsSummarySnapshot = {
    products: { total: 12, active: 10, outOfStock: 2 },
    salesOrders: { DRAFT: 1, CONFIRMED: 3 },
    purchaseOrders: { ORDERED: 2 },
  };

  it('uses tenant-scoped aggregate data and requests a Spanish summary', async () => {
    const aiTextGenerationService = {
      generateText: jest.fn().mockResolvedValue({
        provider: 'gemini',
        model: 'gemini-3.6-flash',
        text: 'Hay dos productos sin existencias.',
      }),
    } as unknown as AiTextGenerationService;
    const operationsSummaryRepository = {
      getSnapshot: jest.fn().mockResolvedValue(snapshot),
    } as OperationsSummaryRepository;
    const useCase = new GenerateOperationsSummaryUseCase(
      aiTextGenerationService,
      operationsSummaryRepository,
    );

    await expect(useCase.execute('organization-1', 'es-CO')).resolves.toEqual({
      provider: 'gemini',
      model: 'gemini-3.6-flash',
      text: 'Hay dos productos sin existencias.',
    });

    expect(operationsSummaryRepository.getSnapshot).toHaveBeenCalledWith(
      'organization-1',
    );
    expect(aiTextGenerationService.generateText).toHaveBeenCalledWith({
      systemInstruction:
        'Write a concise operational summary in Spanish. Use only the supplied aggregate data. Do not invent facts, recommendations, or financial values. Use at most three short sentences.',
      prompt: `Organization operational data:\n${JSON.stringify(snapshot)}`,
      maxOutputTokens: 280,
    });
  });

  it('sends only product metrics when generating a product section summary', async () => {
    const aiTextGenerationService = {
      generateText: jest.fn().mockResolvedValue({
        provider: 'gemini',
        model: 'gemini-3.6-flash',
        text: 'Dos productos no tienen existencias.',
      }),
    } as unknown as AiTextGenerationService;
    const operationsSummaryRepository = {
      getSnapshot: jest.fn().mockResolvedValue(snapshot),
    } as OperationsSummaryRepository;
    const useCase = new GenerateOperationsSummaryUseCase(
      aiTextGenerationService,
      operationsSummaryRepository,
    );

    await useCase.execute('organization-1', 'es', 'products');

    expect(aiTextGenerationService.generateText).toHaveBeenCalledWith({
      systemInstruction:
        'Write a concise products operational summary in Spanish. Use only the supplied aggregate data. Do not invent facts, recommendations, or financial values. Use at most three short sentences.',
      prompt: `products operational data:\n${JSON.stringify({
        products: snapshot.products,
      })}`,
      maxOutputTokens: 280,
    });
  });
});
