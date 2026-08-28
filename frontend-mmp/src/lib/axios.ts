import axios from 'axios';

const supportedLocales = new Set(['es', 'en', 'fr']);
let unauthorizedHandler: (() => void) | null = null;

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipAuthRedirect?: boolean;
  }

  export interface InternalAxiosRequestConfig {
    skipAuthRedirect?: boolean;
  }
}

function resolveLoginPath(): string {
  if (typeof window === 'undefined') {
    return '/login';
  }

  const [maybeLocale] = window.location.pathname.split('/').filter(Boolean);

  if (maybeLocale && supportedLocales.has(maybeLocale)) {
    return `/${maybeLocale}/login`;
  }

  return '/login';
}

function isAuthRoute(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];

  return lastSegment === 'login' || lastSegment === 'register';
}

export function registerUnauthorizedHandler(handler: (() => void) | null): () => void {
  unauthorizedHandler = handler;

  return () => {
    if (unauthorizedHandler === handler) {
      unauthorizedHandler = null;
    }
  };
}

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      unauthorizedHandler?.();

      if (!error.config?.skipAuthRedirect && !isAuthRoute(window.location.pathname)) {
        window.location.href = resolveLoginPath();
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
