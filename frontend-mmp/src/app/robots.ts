import type { MetadataRoute } from 'next';
import { defaultLocale, locales } from '@/i18n/routing';
import { getSiteUrl } from '@/lib/site';

const publicPaths = ['/', '/login', '/register'] as const;
const privatePaths = [
  '/dashboard',
  '/products',
  '/customers',
  '/orders',
  '/suppliers',
  '/purchase-orders',
] as const;

function localizePath(locale: string, pathname: string) {
  if (locale === defaultLocale) {
    return pathname;
  }

  return pathname === '/' ? `/${locale}` : `/${locale}${pathname}`;
}

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  const allow = Array.from(new Set(locales.flatMap((locale) => publicPaths.map((path) => localizePath(locale, path)))));
  const disallow = Array.from(
    new Set(locales.flatMap((locale) => privatePaths.map((path) => localizePath(locale, path)))),
  );

  return {
    rules: [
      {
        userAgent: '*',
        allow,
        disallow,
      },
    ],
    sitemap: new URL('/sitemap.xml', siteUrl).toString(),
    host: siteUrl.origin,
  };
}
