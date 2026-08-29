import { Injectable } from '@nestjs/common';
import { AiTextGenerationService } from '../ai-text-generation.service';
import type { GenerateTextResponse } from '../ai-text-generation.provider';

const VERIFICATION_PROMPT = 'Reply with exactly: CONNECTION_OK';
const VERIFICATION_INSTRUCTION =
  'You are a connectivity verification service. Follow the user request exactly.';
const VERIFICATION_MAX_OUTPUT_TOKENS = 16;

@Injectable()
export class VerifyAiConnectorsUseCase {
  constructor(private readonly aiTextGenerationService: AiTextGenerationService) {}

  async execute(): Promise<GenerateTextResponse> {
    return this.aiTextGenerationService.generateText({
      prompt: VERIFICATION_PROMPT,
      systemInstruction: VERIFICATION_INSTRUCTION,
      maxOutputTokens: VERIFICATION_MAX_OUTPUT_TOKENS,
    });
  }
}
