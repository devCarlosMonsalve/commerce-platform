import Button from '@mui/material/Button';
import { getTranslations } from 'next-intl/server';
import { FeedbackScreen } from '@/components/feedback-screen';
import { Link } from '@/i18n/navigation';

export default async function NotFound() {
  const t = await getTranslations('routeStatus.notFound');

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
