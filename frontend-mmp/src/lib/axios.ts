import axios from 'axios';

const supportedLocales = new Set(['es', 'en', 'fr']);

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

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = resolveLoginPath();
    }

    return Promise.reject(error);
  },
);

export default apiClient;
