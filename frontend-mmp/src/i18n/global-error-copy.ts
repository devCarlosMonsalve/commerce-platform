import { defaultLocale, isValidLocale, type AppLocale } from './routing';

type GlobalErrorCopy = {
  title: string;
  description: string;
  retry: string;
  goHome: string;
};

const copyByLocale: Record<AppLocale, GlobalErrorCopy> = {
  es: {
    title: 'Se produjo un error en la aplicación',
    description: 'Recarga la vista o vuelve al inicio para seguir trabajando.',
    retry: 'Reintentar',
    goHome: 'Ir al inicio',
  },
  en: {
    title: 'The application ran into an error',
    description: 'Reload this view or head back home to keep working.',
    retry: 'Try again',
    goHome: 'Go home',
  },
  fr: {
    title: "L'application a rencontré une erreur",
    description: "Rechargez cette vue ou revenez à l'accueil pour continuer.",
    retry: 'Réessayer',
    goHome: "Retour à l'accueil",
  },
};

export function resolveLocaleFromPathname(pathname: string | undefined): AppLocale {
  const segment = pathname?.split('/').filter(Boolean)[0];

  return segment && isValidLocale(segment) ? segment : defaultLocale;
}

export function getGlobalErrorCopy(pathname: string | undefined) {
  const locale = resolveLocaleFromPathname(pathname);

  return {
    locale,
    homeHref: locale === defaultLocale ? '/' : `/${locale}`,
    messages: copyByLocale[locale],
  };
}
