type BackendMessageMapper = (message: string) => string | undefined;

export function getRetryAfterSeconds(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) {
    return undefined;
  }

  const response = Reflect.get(error, 'response');
  if (typeof response !== 'object' || response === null) {
    return undefined;
  }

  const data = Reflect.get(response, 'data');
  if (typeof data !== 'object' || data === null) {
    return undefined;
  }

  const retryAfterSeconds = Reflect.get(data, 'retryAfterSeconds');
  return typeof retryAfterSeconds === 'number' &&
    Number.isInteger(retryAfterSeconds) &&
    retryAfterSeconds > 0
    ? retryAfterSeconds
    : undefined;
}

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
