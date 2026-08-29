import { Inject, Injectable } from '@nestjs/common';
import {
  PURCHASE_SUGGESTIONS_REPOSITORY,
  type PurchaseSuggestionsRepository,
} from '../purchase-suggestions.repository';

@Injectable()
export class GeneratePurchaseSuggestionsUseCase {
  constructor(
    @Inject(PURCHASE_SUGGESTIONS_REPOSITORY)
    private readonly purchaseSuggestionsRepository: PurchaseSuggestionsRepository,
  ) {}

  async execute(organizationId: string) {
    const candidates =
      await this.purchaseSuggestionsRepository.findSuggestions(organizationId);

    return {
      suggestions: candidates.map((suggestion) => ({
        ...suggestion,
        priority: suggestion.stock <= 0 ? 'CRITICAL' : 'ATTENTION',
        recommendedAction:
          suggestion.openPurchaseOrders > 0
            ? 'REVIEW_OPEN_PURCHASE_ORDERS'
            : 'CREATE_PURCHASE_ORDER',
      })),
    };
  }
}
