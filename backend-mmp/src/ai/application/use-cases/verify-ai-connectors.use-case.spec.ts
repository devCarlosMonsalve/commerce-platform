import type { AiTextGenerationService } from '../ai-text-generation.service';
import { VerifyAiConnectorsUseCase } from './verify-ai-connectors.use-case';

describe('VerifyAiConnectorsUseCase', () => {
  it('delegates the fixed verification request to the text generation service', async () => {
    const aiTextGenerationService = {
      generateText: jest.fn().mockResolvedValue({
        provider: 'gemini',
        model: 'gemini-3.6-flash',
        text: 'CONNECTION_OK',
      }),
    } as unknown as AiTextGenerationService;
    const useCase = new VerifyAiConnectorsUseCase(aiTextGenerationService);

    await expect(useCase.execute()).resolves.toEqual({
      provider: 'gemini',
      model: 'gemini-3.6-flash',
      text: 'CONNECTION_OK',
    });

    expect(aiTextGenerationService.generateText).toHaveBeenCalledWith({
      prompt: 'Reply with exactly: CONNECTION_OK',
      systemInstruction:
        'You are a connectivity verification service. Follow the user request exactly.',
      maxOutputTokens: 16,
    });
  });
});
