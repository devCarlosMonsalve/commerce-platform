import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  GEMINI_TEXT_GENERATION_PROVIDER,
  OPENAI_TEXT_GENERATION_PROVIDER,
} from './ai-text-generation.provider';
import type {
  AiTextGenerationProvider,
  GenerateTextRequest,
  GenerateTextResponse,
} from './ai-text-generation.provider';

@Injectable()
export class AiTextGenerationService {
  private readonly logger = new Logger(AiTextGenerationService.name);

  constructor(
    @Inject(OPENAI_TEXT_GENERATION_PROVIDER)
    private readonly openAiProvider: AiTextGenerationProvider,
    @Inject(GEMINI_TEXT_GENERATION_PROVIDER)
    private readonly geminiProvider: AiTextGenerationProvider,
  ) {}

  async generateText(request: GenerateTextRequest): Promise<GenerateTextResponse> {
    try {
      return await this.geminiProvider.generateText(request);
    } catch (geminiError) {
      this.logger.warn(
        'Gemini text generation failed. Trying OpenAI fallback.',
        geminiError instanceof Error ? geminiError.stack : undefined,
      );
    }

    try {
      return await this.openAiProvider.generateText(request);
    } catch (openAiError) {
      this.logger.error(
        'OpenAI text generation failed after Gemini fallback.',
        openAiError instanceof Error ? openAiError.stack : undefined,
      );
      throw new ServiceUnavailableException(
        'Gemini and OpenAI text generation failed. Review backend logs.',
      );
    }
  }
}
