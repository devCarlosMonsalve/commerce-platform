'use client';

import { useEffect } from 'react';
import Button from '@mui/material/Button';
import { useTranslations } from 'next-intl';
import { FeedbackScreen } from '@/components/feedback-screen';
import { Link } from '@/i18n/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('routeStatus.error');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <FeedbackScreen
      eyebrow={t('eyebrow')}
      title={t('title')}
      description={t('description')}
      actions={
        <>
          <Button variant="contained" onClick={reset}>
            {t('retry')}
          </Button>

          <Link href="/" style={{ textDecoration: 'none' }}>
            <Button variant="outlined">{t('goHome')}</Button>
          </Link>
        </>
      }
    />
  );
}
