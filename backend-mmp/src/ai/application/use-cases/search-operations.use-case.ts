import { Inject, Injectable } from '@nestjs/common';
import { AiTextGenerationService } from '../ai-text-generation.service';
import {
  OPERATIONAL_SEARCH_REPOSITORY,
  type OperationalSearchIntent,
  type OperationalSearchRepository,
} from '../operational-search.repository';

const MAX_OUTPUT_TOKENS = 16;
const SUPPORTED_INTENTS: readonly OperationalSearchIntent[] = [
  'OUT_OF_STOCK_PRODUCTS',
  'PENDING_SALES_ORDERS',
  'OPEN_PURCHASE_ORDERS',
];

@Injectable()
export class SearchOperationsUseCase {
  constructor(
    private readonly aiTextGenerationService: AiTextGenerationService,
    @Inject(OPERATIONAL_SEARCH_REPOSITORY)
    private readonly operationalSearchRepository: OperationalSearchRepository,
  ) {}

  async execute(organizationId: string, query: string) {
    const classification = await this.aiTextGenerationService.generateText({
      systemInstruction:
        'Classify the request into exactly one of these codes: OUT_OF_STOCK_PRODUCTS, PENDING_SALES_ORDERS, OPEN_PURCHASE_ORDERS, UNSUPPORTED. ' +
        'OUT_OF_STOCK_PRODUCTS is for products with stock at or below zero. ' +
        'PENDING_SALES_ORDERS is for sales orders with status PENDING. ' +
        'OPEN_PURCHASE_ORDERS is for purchase orders with status ORDERED or PARTIALLY_RECEIVED. ' +
        'Return only the code. Do not answer the request.',
      prompt: query,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
    });
    const intent = this.resolveIntent(classification.text);

    switch (intent) {
      case 'OUT_OF_STOCK_PRODUCTS':
        return {
          intent,
          provider: classification.provider,
          model: classification.model,
          items:
            await this.operationalSearchRepository.findOutOfStockProducts(
              organizationId,
            ),
        };
      case 'PENDING_SALES_ORDERS':
        return {
          intent,
          provider: classification.provider,
          model: classification.model,
          items:
            await this.operationalSearchRepository.findPendingSalesOrders(
              organizationId,
            ),
        };
      case 'OPEN_PURCHASE_ORDERS':
        return {
          intent,
          provider: classification.provider,
          model: classification.model,
          items:
            await this.operationalSearchRepository.findOpenPurchaseOrders(
              organizationId,
            ),
        };
      default:
        return {
          intent: 'UNSUPPORTED' as const,
          provider: classification.provider,
          model: classification.model,
          items: [],
        };
    }
  }

  private resolveIntent(text: string): OperationalSearchIntent {
    const intent = text.trim().toUpperCase();
    return SUPPORTED_INTENTS.includes(intent as OperationalSearchIntent)
      ? (intent as OperationalSearchIntent)
      : 'UNSUPPORTED';
  }
}
