import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { Providers } from '@/components/providers';
import { defaultLocale, isValidLocale, locales } from '@/i18n/routing';
import { getSiteUrl } from '@/lib/site';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: '#F5F0E8',
  colorScheme: 'light',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const resolvedLocale = isValidLocale(locale) ? locale : defaultLocale;
  const t = await getTranslations({ locale: resolvedLocale, namespace: 'metadata' });

  return {
    metadataBase: getSiteUrl(),
    applicationName: t('appName'),
    title: {
      default: t('title'),
      template: `%s | ${t('appName')}`,
    },
    description: t('description'),
    manifest: '/manifest.webmanifest',
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
        { url: '/icon', type: 'image/png' },
      ],
      apple: [{ url: '/apple-icon', sizes: '180x180', type: 'image/png' }],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages({ locale });

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full bg-[#F5F0E8] antialiased">
        <AppRouterCacheProvider>
          <NextIntlClientProvider messages={messages}>
            <Providers>{children}</Providers>
          </NextIntlClientProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
