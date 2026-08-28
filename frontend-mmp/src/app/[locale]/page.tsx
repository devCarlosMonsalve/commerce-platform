'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/language-switcher';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';

export default function HomePage() {
  const t = useTranslations('home');
  const common = useTranslations('common');

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#F5F0E8',
        color: '#2C2C20',
        display: 'flex',
        flexDirection: 'column',
        p: { xs: 2, md: 3 },
      }}
    >
      <Box
        component="header"
        sx={{
          width: '100%',
          maxWidth: 1180,
          mx: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 2.5,
              color: '#F5F0E8',
              bgcolor: '#5C6B40',
            }}
          >
            <StorefrontOutlinedIcon fontSize="small" />
          </Box>
          <Typography sx={{ fontWeight: 750, letterSpacing: '-0.03em' }}>Commerce</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LanguageSwitcher />
          <Link href="/login" style={{ textDecoration: 'none' }}>
            <Button color="inherit" sx={{ fontWeight: 650 }}>
              {t('signIn')}
            </Button>
          </Link>
        </Box>
      </Box>

      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 8, md: 12 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 840,
            p: { xs: 3.5, sm: 6, md: 8 },
            textAlign: 'center',
            borderRadius: { xs: 4, md: 6 },
            bgcolor: '#FDFAF4',
            border: '1px solid rgba(92,107,64,0.16)',
            boxShadow: '0 24px 70px rgba(74, 70, 49, 0.10)',
          }}
        >
          <Chip
            label={t('badge')}
            size="small"
            sx={{ bgcolor: 'rgba(168,192,144,0.25)', color: '#4B5A35', fontWeight: 700 }}
          />
          <Typography
            component="h1"
            sx={{
              mt: 3,
              fontSize: { xs: '2.4rem', sm: '3.6rem', md: '4.25rem' },
              lineHeight: 1.05,
              fontWeight: 800,
              letterSpacing: '-0.06em',
            }}
          >
            {t('title')} <Box component="span" sx={{ color: '#5C6B40' }}>{t('titleAccent')}</Box>
          </Typography>
          <Typography
            sx={{
              maxWidth: 590,
              mx: 'auto',
              mt: 3,
              color: '#676356',
              fontSize: { xs: '1rem', md: '1.125rem' },
              lineHeight: 1.65,
            }}
          >
            {t('description')}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Link href="/register" style={{ textDecoration: 'none' }}>
              <Button variant="contained" size="large" endIcon={<ArrowForwardIcon />} sx={{ px: 3, py: 1.3 }}>
                {common('getStarted')}
              </Button>
            </Link>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
