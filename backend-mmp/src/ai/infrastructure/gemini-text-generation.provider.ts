import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import type {
  AiTextGenerationProvider,
  GenerateTextRequest,
  GenerateTextResponse,
} from '../application/ai-text-generation.provider';

const DEFAULT_GEMINI_MODEL = 'gemini-3.6-flash';

@Injectable()
export class GeminiTextGenerationProvider
  implements AiTextGenerationProvider
{
  readonly provider = 'gemini' as const;

  constructor(private readonly configService: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(this.configService.get<string>('GEMINI_API_KEY'));
  }

  async generateText(
    request: GenerateTextRequest,
  ): Promise<GenerateTextResponse> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'Google Gemini text generation is not configured',
      );
    }

    const model = this.configService.get<string>(
      'GEMINI_MODEL',
      DEFAULT_GEMINI_MODEL,
    );
    const client = new GoogleGenAI({ apiKey });
    const response = await client.interactions.create({
      model,
      input: request.systemInstruction
        ? `${request.systemInstruction}\n\n${request.prompt}`
        : request.prompt,
    });
    const text = response.output_text?.trim();

    if (!text) {
      throw new ServiceUnavailableException(
        'Google Gemini did not return generated text',
      );
    }

    return {
      provider: this.provider,
      model,
      text,
    };
  }
}
