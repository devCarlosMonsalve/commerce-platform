import { Module } from '@nestjs/common';
import {
  GEMINI_TEXT_GENERATION_PROVIDER,
  OPENAI_TEXT_GENERATION_PROVIDER,
} from './application/ai-text-generation.provider';
import { AiTextGenerationService } from './application/ai-text-generation.service';
import { OPERATIONAL_SEARCH_REPOSITORY } from './application/operational-search.repository';
import { PURCHASE_SUGGESTIONS_REPOSITORY } from './application/purchase-suggestions.repository';
import { OPERATIONS_SUMMARY_REPOSITORY } from './application/operations-summary.repository';
import { GenerateOperationsSummaryUseCase } from './application/use-cases/generate-operations-summary.use-case';
import { SearchOperationsUseCase } from './application/use-cases/search-operations.use-case';
import { GeneratePurchaseSuggestionsUseCase } from './application/use-cases/generate-purchase-suggestions.use-case';
import { VerifyAiConnectorsUseCase } from './application/use-cases/verify-ai-connectors.use-case';
import { AiController } from './infrastructure/ai.controller';
import { GeminiTextGenerationProvider } from './infrastructure/gemini-text-generation.provider';
import { OpenAiTextGenerationProvider } from './infrastructure/openai-text-generation.provider';
import { PrismaOperationsSummaryRepository } from './infrastructure/persistence/prisma-operations-summary.repository';
import { PrismaOperationalSearchRepository } from './infrastructure/persistence/prisma-operational-search.repository';
import { PrismaPurchaseSuggestionsRepository } from './infrastructure/persistence/prisma-purchase-suggestions.repository';
import { OrganizationMemberGuard } from '../shared/guards/organization-member.guard';
import { RolesGuard } from '../shared/guards/roles.guard';

@Module({
  controllers: [AiController],
  providers: [
    OpenAiTextGenerationProvider,
    GeminiTextGenerationProvider,
    AiTextGenerationService,
    VerifyAiConnectorsUseCase,
    GenerateOperationsSummaryUseCase,
    SearchOperationsUseCase,
    GeneratePurchaseSuggestionsUseCase,
    OrganizationMemberGuard,
    RolesGuard,
    {
      provide: OPENAI_TEXT_GENERATION_PROVIDER,
      useExisting: OpenAiTextGenerationProvider,
    },
    {
      provide: GEMINI_TEXT_GENERATION_PROVIDER,
      useExisting: GeminiTextGenerationProvider,
    },
    {
      provide: OPERATIONS_SUMMARY_REPOSITORY,
      useClass: PrismaOperationsSummaryRepository,
    },
    {
      provide: OPERATIONAL_SEARCH_REPOSITORY,
      useClass: PrismaOperationalSearchRepository,
    },
    {
      provide: PURCHASE_SUGGESTIONS_REPOSITORY,
      useClass: PrismaPurchaseSuggestionsRepository,
    },
  ],
  exports: [
    OPENAI_TEXT_GENERATION_PROVIDER,
    GEMINI_TEXT_GENERATION_PROVIDER,
  ],
})
export class AiModule {}
