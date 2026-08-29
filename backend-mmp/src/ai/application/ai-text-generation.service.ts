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

const GEMINI_RETRY_DELAY_PATTERN = /Please retry in\s+([\d.]+)s\./i;

function getGeminiRetryAfterSeconds(error: unknown): number | undefined {
  const message = error instanceof Error ? error.message : '';
  const match = GEMINI_RETRY_DELAY_PATTERN.exec(message);
  const seconds = match?.[1] ? Number.parseFloat(match[1]) : Number.NaN;

  return Number.isFinite(seconds) && seconds > 0 ? Math.ceil(seconds) : undefined;
}

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
    let geminiRetryAt: number | undefined;

    try {
      return await this.geminiProvider.generateText(request);
    } catch (geminiError) {
      const retryAfterSeconds = getGeminiRetryAfterSeconds(geminiError);
      geminiRetryAt = retryAfterSeconds
        ? Date.now() + retryAfterSeconds * 1000
        : undefined;
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
      const retryAfterSeconds = geminiRetryAt
        ? Math.max(1, Math.ceil((geminiRetryAt - Date.now()) / 1000))
        : undefined;
      throw new ServiceUnavailableException({
        message: 'Gemini and OpenAI text generation failed. Review backend logs.',
        ...(retryAfterSeconds ? { retryAfterSeconds } : {}),
      });
    }
  }
}
