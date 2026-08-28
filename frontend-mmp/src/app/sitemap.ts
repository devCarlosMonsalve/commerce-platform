import type { MetadataRoute } from 'next';
import { defaultLocale, locales } from '@/i18n/routing';
import { getSiteUrl } from '@/lib/site';

const publicPaths = ['/', '/login', '/register'] as const;

function localizePath(locale: string, pathname: string) {
  if (locale === defaultLocale) {
    return pathname;
  }

  return pathname === '/' ? `/${locale}` : `/${locale}${pathname}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();

  return locales.flatMap((locale) =>
    publicPaths.map((path) => ({
      url: new URL(localizePath(locale, path), siteUrl).toString(),
      lastModified,
      changeFrequency: path === '/' ? 'weekly' : 'monthly',
      priority: path === '/' ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          locales.map((alternateLocale) => [
            alternateLocale,
            new URL(localizePath(alternateLocale, path), siteUrl).toString(),
          ]),
        ),
      },
    })),
  );
}
