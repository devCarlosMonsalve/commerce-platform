import { defineRouting } from 'next-intl/routing';

export const locales = ['es', 'en', 'fr'] as const;
export type AppLocale = (typeof locales)[number];
export const defaultLocale: AppLocale = 'es';

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
  localeDetection: false, // siempre usa español por defecto
});

export function isValidLocale(locale: string): locale is AppLocale {
  return locales.includes(locale as AppLocale);
}
