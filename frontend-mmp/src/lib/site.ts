const DEFAULT_SITE_URL = 'http://localhost:3000';
const DEFAULT_API_URL = 'http://localhost:3001/api';

function resolveUrl(value: string | undefined, fallback: string) {
  const candidate = (value?.trim() || fallback).replace(/\/+$/, '');

  try {
    return new URL(candidate);
  } catch {
    return new URL(fallback);
  }
}

export function getSiteUrl() {
  return resolveUrl(process.env.NEXT_PUBLIC_SITE_URL, DEFAULT_SITE_URL);
}

export function getApiOrigin() {
  return resolveUrl(process.env.NEXT_PUBLIC_API_URL, DEFAULT_API_URL).origin;
}
