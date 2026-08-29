import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type {
  AiTextGenerationProvider,
  GenerateTextRequest,
  GenerateTextResponse,
} from '../application/ai-text-generation.provider';

const DEFAULT_OPENAI_MODEL = 'gpt-4.1-mini';

@Injectable()
export class OpenAiTextGenerationProvider
  implements AiTextGenerationProvider
{
  readonly provider = 'openai' as const;

  constructor(private readonly configService: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(this.configService.get<string>('OPENAI_API_KEY'));
  }

  async generateText(
    request: GenerateTextRequest,
  ): Promise<GenerateTextResponse> {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'OpenAI text generation is not configured',
      );
    }

    const model = this.configService.get<string>(
      'OPENAI_MODEL',
      DEFAULT_OPENAI_MODEL,
    );
    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({
      model,
      input: [
        ...(request.systemInstruction
          ? [{ role: 'developer' as const, content: request.systemInstruction }]
          : []),
        { role: 'user', content: request.prompt },
      ],
      max_output_tokens: request.maxOutputTokens,
    });

    if (!response.output_text.trim()) {
      throw new ServiceUnavailableException(
        'OpenAI did not return generated text',
      );
    }

    return {
      provider: this.provider,
      model,
      text: response.output_text,
    };
  }
}
