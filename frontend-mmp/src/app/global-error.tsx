'use client';

import { getGlobalErrorCopy } from '@/i18n/global-error-copy';

const shellStyle = {
  minHeight: '100vh',
  display: 'grid',
  placeItems: 'center',
  padding: '24px',
  background: '#F5F0E8',
  color: '#0F172A',
  fontFamily: 'Arial, Helvetica, sans-serif',
} as const;

const panelStyle = {
  width: '100%',
  maxWidth: '560px',
  padding: '40px',
  borderRadius: '24px',
  background: '#FFFFFF',
  border: '1px solid rgba(15, 23, 42, 0.08)',
  boxShadow: '0 16px 40px rgba(15, 23, 42, 0.08)',
} as const;

const eyebrowStyle = {
  margin: 0,
  fontSize: '12px',
  letterSpacing: '0.16em',
  textTransform: 'uppercase' as const,
  color: '#475569',
} as const;

const titleStyle = {
  margin: '16px 0 12px',
  fontSize: '32px',
  lineHeight: 1.1,
} as const;

const descriptionStyle = {
  margin: 0,
  fontSize: '16px',
  lineHeight: 1.6,
  color: '#475569',
} as const;

const actionsStyle = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  gap: '12px',
  marginTop: '32px',
} as const;

const primaryButtonStyle = {
  border: 'none',
  borderRadius: '999px',
  padding: '12px 18px',
  background: '#0F172A',
  color: '#FFFFFF',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 600,
} as const;

const secondaryButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '999px',
  padding: '12px 18px',
  border: '1px solid rgba(15, 23, 42, 0.16)',
  color: '#0F172A',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: 600,
} as const;

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { locale, homeHref, messages } = getGlobalErrorCopy(
    typeof window === 'undefined' ? undefined : window.location.pathname,
  );

  return (
    <html lang={locale}>
      <body style={shellStyle}>
        <main style={panelStyle}>
          <p style={eyebrowStyle}>Commerce Platform</p>
          <h1 style={titleStyle}>{messages.title}</h1>
          <p style={descriptionStyle}>{messages.description}</p>

          <div style={actionsStyle}>
            <button type="button" onClick={() => reset()} style={primaryButtonStyle}>
              {messages.retry}
            </button>

            <a href={homeHref} style={secondaryButtonStyle}>
              {messages.goHome}
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
