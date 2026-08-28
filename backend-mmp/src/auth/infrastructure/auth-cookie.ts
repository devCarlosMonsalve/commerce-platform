import type { CookieOptions } from 'express';

export const AUTH_COOKIE_NAME = 'access_token';
const AUTH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function buildAuthCookieOptions(isProduction: boolean): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: AUTH_COOKIE_MAX_AGE_MS,
    path: '/',
  };
}

export function buildClearAuthCookieOptions(isProduction: boolean): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  };
}
