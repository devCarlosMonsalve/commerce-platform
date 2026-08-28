'use client';

import Button from '@mui/material/Button';
import { useTranslations } from 'next-intl';
import { FeedbackScreen } from '@/components/feedback-screen';
import { Link } from '@/i18n/navigation';

export default function NotFound() {
  const t = useTranslations('routeStatus.notFound');

  return (
    <FeedbackScreen
      eyebrow={t('eyebrow')}
      title={t('title')}
      description={t('description')}
      actions={
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Button variant="contained">{t('goHome')}</Button>
        </Link>
      }
    />
  );
}
