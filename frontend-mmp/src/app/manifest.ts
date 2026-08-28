import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Commerce Platform',
    short_name: 'Commerce',
    description: 'Multi-tenant commerce operations platform for products, customers, and orders.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#F5F0E8',
    theme_color: '#F5F0E8',
    lang: 'es',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
