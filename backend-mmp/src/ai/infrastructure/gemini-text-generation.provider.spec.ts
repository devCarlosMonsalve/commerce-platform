import { ConfigService } from '@nestjs/config';
import { GeminiTextGenerationProvider } from './gemini-text-generation.provider';

function buildConfigService(values: Record<string, string | undefined>): ConfigService {
  return {
    get: jest.fn((key: string, defaultValue?: string) => values[key] ?? defaultValue),
  } as unknown as ConfigService;
}

describe('GeminiTextGenerationProvider', () => {
  it('reports whether the Gemini API key is configured', () => {
    expect(
      new GeminiTextGenerationProvider(
        buildConfigService({ GEMINI_API_KEY: 'test-key' }),
      ).isConfigured(),
    ).toBe(true);

    expect(
      new GeminiTextGenerationProvider(buildConfigService({})).isConfigured(),
    ).toBe(false);
  });

  it('rejects generation when Gemini is not configured', async () => {
    const provider = new GeminiTextGenerationProvider(buildConfigService({}));

    await expect(provider.generateText({ prompt: 'Test prompt' })).rejects.toThrow(
      'Google Gemini text generation is not configured',
    );
  });
});
