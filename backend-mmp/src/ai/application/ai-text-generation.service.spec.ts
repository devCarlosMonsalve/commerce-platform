import type { AiTextGenerationProvider } from './ai-text-generation.provider';
import { AiTextGenerationService } from './ai-text-generation.service';

function buildProvider(
  provider: 'openai' | 'gemini',
  generateText: AiTextGenerationProvider['generateText'],
): AiTextGenerationProvider {
  return { provider, isConfigured: jest.fn(() => true), generateText };
}

describe('AiTextGenerationService', () => {
  const request = { prompt: 'Test prompt' };

  it('uses Gemini without calling OpenAI when Gemini succeeds', async () => {
    const geminiProvider = buildProvider(
      'gemini',
      jest.fn().mockResolvedValue({
        provider: 'gemini',
        model: 'gemini-3.6-flash',
        text: 'Gemini response',
      }),
    );
    const openAiProvider = buildProvider('openai', jest.fn());
    const service = new AiTextGenerationService(openAiProvider, geminiProvider);

    await expect(service.generateText(request)).resolves.toMatchObject({
      provider: 'gemini',
    });
    expect(openAiProvider.generateText).not.toHaveBeenCalled();
  });

  it('uses OpenAI only after Gemini fails', async () => {
    const geminiProvider = buildProvider(
      'gemini',
      jest.fn().mockRejectedValue(new Error('Gemini unavailable')),
    );
    const openAiProvider = buildProvider(
      'openai',
      jest.fn().mockResolvedValue({
        provider: 'openai',
        model: 'gpt-4.1-mini',
        text: 'OpenAI response',
      }),
    );
    const service = new AiTextGenerationService(openAiProvider, geminiProvider);

    await expect(service.generateText(request)).resolves.toMatchObject({
      provider: 'openai',
    });
    expect(openAiProvider.generateText).toHaveBeenCalledWith(request);
  });

  it('returns Gemini retry metadata when both providers fail', async () => {
    const geminiProvider = buildProvider(
      'gemini',
      jest
        .fn()
        .mockRejectedValue(new Error('Please retry in 22.820592499s.')),
    );
    const openAiProvider = buildProvider(
      'openai',
      jest.fn().mockRejectedValue(new Error('OpenAI unavailable')),
    );
    const service = new AiTextGenerationService(openAiProvider, geminiProvider);

    await expect(service.generateText(request)).rejects.toMatchObject({
      response: expect.objectContaining({
        retryAfterSeconds: expect.any(Number),
      }),
    });
  });
});
