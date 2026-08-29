import { Inject, Injectable } from '@nestjs/common';
import { AiTextGenerationService } from '../ai-text-generation.service';
import {
  OPERATIONS_SUMMARY_REPOSITORY,
} from '../operations-summary.repository';
import type {
  OperationsSummarySnapshot,
  OperationsSummaryRepository,
} from '../operations-summary.repository';

const MAX_OUTPUT_TOKENS = 280;
export const OPERATIONS_SUMMARY_SECTIONS = [
  'products',
  'sales-orders',
  'purchase-orders',
] as const;
export type OperationsSummarySection = (typeof OPERATIONS_SUMMARY_SECTIONS)[number];

export function isOperationsSummarySection(
  section: string,
): section is OperationsSummarySection {
  return OPERATIONS_SUMMARY_SECTIONS.some(
    (supportedSection) => supportedSection === section,
  );
}

@Injectable()
export class GenerateOperationsSummaryUseCase {
  constructor(
    private readonly aiTextGenerationService: AiTextGenerationService,
    @Inject(OPERATIONS_SUMMARY_REPOSITORY)
    private readonly operationsSummaryRepository: OperationsSummaryRepository,
  ) {}

  async execute(
    organizationId: string,
    locale: string,
    section?: OperationsSummarySection,
  ) {
    const snapshot =
      await this.operationsSummaryRepository.getSnapshot(organizationId);
    const language = locale.startsWith('fr')
      ? 'French'
      : locale.startsWith('en')
        ? 'English'
        : 'Spanish';

    return this.aiTextGenerationService.generateText({
      systemInstruction: `Write a concise ${section ? `${section} ` : ''}operational summary in ${language}. ` +
        'Use only the supplied aggregate data. Do not invent facts, recommendations, ' +
        'or financial values. Use at most three short sentences.',
      prompt: `${section ?? 'Organization'} operational data:\n${JSON.stringify(
        this.getSummaryData(snapshot, section),
      )}`,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
    });
  }

  private getSummaryData(
    snapshot: OperationsSummarySnapshot,
    section?: OperationsSummarySection,
  ) {
    switch (section) {
      case 'products':
        return { products: snapshot.products };
      case 'sales-orders':
        return { salesOrders: snapshot.salesOrders };
      case 'purchase-orders':
        return { purchaseOrders: snapshot.purchaseOrders };
      default:
        return snapshot;
    }
  }
}
