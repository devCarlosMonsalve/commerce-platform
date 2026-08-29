import { ConfigService } from '@nestjs/config';
import { OpenAiTextGenerationProvider } from './openai-text-generation.provider';

function buildConfigService(values: Record<string, string | undefined>): ConfigService {
  return {
    get: jest.fn((key: string, defaultValue?: string) => values[key] ?? defaultValue),
  } as unknown as ConfigService;
}

describe('OpenAiTextGenerationProvider', () => {
  it('reports whether the OpenAI API key is configured', () => {
    expect(
      new OpenAiTextGenerationProvider(
        buildConfigService({ OPENAI_API_KEY: 'test-key' }),
      ).isConfigured(),
    ).toBe(true);

    expect(
      new OpenAiTextGenerationProvider(buildConfigService({})).isConfigured(),
    ).toBe(false);
  });

  it('rejects generation when OpenAI is not configured', async () => {
    const provider = new OpenAiTextGenerationProvider(buildConfigService({}));

    await expect(provider.generateText({ prompt: 'Test prompt' })).rejects.toThrow(
      'OpenAI text generation is not configured',
    );
  });
});
