'use client';

import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function DashboardPage() {
  const t = useTranslations('nav');

  return (
    <Box className="min-h-screen flex items-center justify-center" sx={{ bgcolor: 'background.default' }}>
      <Typography variant="h4" sx={{ color: 'text.primary' }}>
        {t('dashboard')} — coming soon
      </Typography>
    </Box>
  );
}
