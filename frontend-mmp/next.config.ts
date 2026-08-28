import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { getApiOrigin } from './src/lib/site';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const isDevelopment = process.env.NODE_ENV !== 'production';
const apiOrigin = getApiOrigin();

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' ${apiOrigin}${isDevelopment ? ' http: https: ws: wss:' : ''}`,
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  isDevelopment ? '' : 'upgrade-insecure-requests',
]
  .filter(Boolean)
  .join('; ');

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: contentSecurityPolicy,
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value:
      'accelerometer=(), autoplay=(), camera=(), display-capture=(), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=()',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
];

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
