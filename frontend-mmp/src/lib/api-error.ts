export function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null) {
    const response = Reflect.get(error, 'response');

    if (typeof response === 'object' && response !== null) {
      const data = Reflect.get(response, 'data');

      if (typeof data === 'object' && data !== null) {
        const message = Reflect.get(data, 'message');

        if (Array.isArray(message)) {
          return message.filter((item): item is string => typeof item === 'string').join(', ');
        }

        if (typeof message === 'string') {
          return message;
        }
      }
    }

    const message = Reflect.get(error, 'message');

    if (typeof message === 'string') {
      return message;
    }
  }

  return fallback;
}
