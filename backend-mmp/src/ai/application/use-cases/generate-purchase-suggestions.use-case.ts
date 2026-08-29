import { Inject, Injectable } from '@nestjs/common';
import { AiTextGenerationService } from '../ai-text-generation.service';
import {
  PURCHASE_SUGGESTIONS_REPOSITORY,
  type PurchaseSuggestionsRepository,
} from '../purchase-suggestions.repository';

@Injectable()
export class GeneratePurchaseSuggestionsUseCase {
  constructor(
    private readonly aiTextGenerationService: AiTextGenerationService,
    @Inject(PURCHASE_SUGGESTIONS_REPOSITORY)
    private readonly purchaseSuggestionsRepository: PurchaseSuggestionsRepository,
  ) {}

  async execute(organizationId: string, locale: string) {
    const suggestions =
      await this.purchaseSuggestionsRepository.findSuggestions(organizationId);
    const language = locale.startsWith('fr')
      ? 'French'
      : locale.startsWith('en')
        ? 'English'
        : 'Spanish';
    const analysis = await this.aiTextGenerationService.generateText({
      systemInstruction:
        `Write a concise purchase-review note in ${language}. Use only the supplied product stock and open purchase-order counts. ` +
        'Do not invent demand, quantities, suppliers, prices, or actions. State that suggestions require human review. Use at most two short sentences.',
      prompt: `Products requiring purchase review:\n${JSON.stringify(suggestions)}`,
      maxOutputTokens: 180,
    });

    return { ...analysis, suggestions };
  }
}
