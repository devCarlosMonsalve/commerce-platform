type BackendMessageMapper = (message: string) => string | undefined;

export function getErrorMessage(
  error: unknown,
  fallback: string,
  mapBackendMessage?: BackendMessageMapper,
): string {
  if (typeof error === 'object' && error !== null) {
    const response = Reflect.get(error, 'response');

    if (typeof response === 'object' && response !== null) {
      const data = Reflect.get(response, 'data');

      if (typeof data === 'object' && data !== null) {
        const message = Reflect.get(data, 'message');

        if (Array.isArray(message)) {
          return fallback;
        }

        if (typeof message === 'string') {
          return mapBackendMessage?.(message) ?? fallback;
        }
      }
    }

    const message = Reflect.get(error, 'message');

    if (typeof message === 'string') {
      return mapBackendMessage?.(message) ?? fallback;
    }
  }

  return fallback;
}
