export type AiProviderName = 'openai' | 'gemini';

export interface GenerateTextRequest {
  prompt: string;
  systemInstruction?: string;
  maxOutputTokens?: number;
}

export interface GenerateTextResponse {
  provider: AiProviderName;
  model: string;
  text: string;
}

export interface AiTextGenerationProvider {
  readonly provider: AiProviderName;
  isConfigured(): boolean;
  generateText(request: GenerateTextRequest): Promise<GenerateTextResponse>;
}

export const OPENAI_TEXT_GENERATION_PROVIDER = Symbol(
  'OPENAI_TEXT_GENERATION_PROVIDER',
);
export const GEMINI_TEXT_GENERATION_PROVIDER = Symbol(
  'GEMINI_TEXT_GENERATION_PROVIDER',
);
