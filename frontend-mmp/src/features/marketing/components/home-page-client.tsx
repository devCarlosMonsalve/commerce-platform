'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/language-switcher';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import NorthEastIcon from '@mui/icons-material/NorthEast';

export default function HomePage() {
  const t = useTranslations('home');
  const common = useTranslations('common');

  const metrics = [
    [t('statOrgs'), t('statOrgsLabel')],
    [t('statOrders'), t('statOrdersLabel')],
    [t('statAccess'), t('statAccessLabel')],
  ];

  return (
    <Box sx={{ minHeight: '100vh', overflow: 'hidden', color: '#163529', bgcolor: '#F7F8F5' }}>
      <Box component="header" sx={{ width: '100%', maxWidth: 1360, mx: 'auto', px: { xs: 2.5, sm: 4, md: 6 }, pt: { xs: 2.5, md: 4 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box sx={{ width: 38, height: 38, display: 'grid', placeItems: 'center', borderRadius: '50%', color: '#E8F6DB', bgcolor: '#193B2C' }}>
            <StorefrontOutlinedIcon fontSize="small" />
          </Box>
          <Typography sx={{ fontWeight: 750, letterSpacing: '-0.04em', fontSize: '1.08rem' }}>Commerce</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1.5 } }}>
          <LanguageSwitcher />
          <Link href="/login" style={{ textDecoration: 'none' }}>
            <Button color="inherit" sx={{ display: { xs: 'none', sm: 'inline-flex' }, fontWeight: 650 }}>{t('signIn')}</Button>
          </Link>
          <Link href="/register" style={{ textDecoration: 'none' }}>
            <Button variant="contained" endIcon={<NorthEastIcon />} sx={{ px: { xs: 1.75, sm: 2.25 }, bgcolor: '#193B2C', '&:hover': { bgcolor: '#285441' } }}>{common('getStarted')}</Button>
          </Link>
        </Box>
      </Box>

      <Box component="main" sx={{ width: '100%', maxWidth: 1360, mx: 'auto', px: { xs: 2.5, sm: 4, md: 6 }, pt: { xs: 7, md: 11 }, pb: { xs: 5, md: 7 } }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 0.9fr) minmax(500px, 1.1fr)' }, alignItems: 'center', gap: { xs: 7, lg: 8 } }}>
          <Box sx={{ maxWidth: 630 }}>
            <Chip label={t('badge')} sx={{ color: '#26533E', bgcolor: '#E3F1D3', fontWeight: 700, borderRadius: 1.5 }} />
            <Typography component="h1" sx={{ mt: 3, fontSize: { xs: '3.35rem', sm: '4.8rem', xl: '5.9rem' }, lineHeight: 0.92, letterSpacing: '-0.075em', fontWeight: 750 }}>
              {t('title')}<br />
              <Box component="span" sx={{ color: '#568B5E' }}>{t('titleAccent')}</Box>
            </Typography>
            <Typography sx={{ mt: 3.5, maxWidth: 500, color: '#587064', fontSize: { xs: '1rem', md: '1.15rem' }, lineHeight: 1.7 }}>{t('description')}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mt: 4.5 }}>
              <Link href="/register" style={{ textDecoration: 'none' }}>
                <Button variant="contained" size="large" endIcon={<ArrowForwardIcon />} sx={{ minHeight: 54, px: 3, bgcolor: '#193B2C', '&:hover': { bgcolor: '#285441' } }}>{common('getStarted')}</Button>
              </Link>
              <Typography sx={{ color: '#6E8278', fontSize: '0.84rem', fontWeight: 600 }}>{t('featureRoles')}</Typography>
            </Box>
          </Box>

          <Box sx={{ position: 'relative', maxWidth: 650, justifySelf: { lg: 'end' } }}>
            <Box sx={{ position: 'absolute', width: '84%', height: '84%', right: '-11%', top: '-9%', borderRadius: '50%', bgcolor: '#E3F1D3', zIndex: 0 }} />
            <Box sx={{ position: 'relative', overflow: 'hidden', p: { xs: 2.25, sm: 3.5 }, border: '1px solid rgba(22,53,41,0.12)', borderRadius: 4, bgcolor: '#FFF', boxShadow: '0 28px 70px rgba(24, 64, 46, 0.16)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 3, borderBottom: '1px solid #E8EEE9' }}>
                <Box>
                  <Typography sx={{ color: '#6A8074', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em' }}>{t('workspace')}</Typography>
                  <Typography sx={{ mt: 0.4, fontWeight: 720, letterSpacing: '-0.025em' }}>{t('dashboardTitle')}</Typography>
                </Box>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#86BF68', boxShadow: '0 0 0 5px #E5F3DB' }} />
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: { xs: 1, sm: 1.5 }, py: 3 }}>
                {metrics.map(([value, label]) => (
                  <Box key={label} sx={{ p: { xs: 1.25, sm: 1.75 }, borderRadius: 2.5, bgcolor: '#F4F7F3' }}>
                    <Typography sx={{ fontWeight: 780, fontSize: { xs: '1.4rem', sm: '1.85rem' }, lineHeight: 1, letterSpacing: '-0.055em' }}>{value}</Typography>
                    <Typography sx={{ mt: 0.5, color: '#6B8175', fontSize: { xs: '0.65rem', sm: '0.72rem' }, lineHeight: 1.3 }}>{label}</Typography>
                  </Box>
                ))}
              </Box>
              <Box sx={{ p: 2.25, borderRadius: 2.5, color: '#EFF8E7', background: 'linear-gradient(118deg, #183D2D, #347052)' }}>
                <Typography sx={{ color: '#BDE5A2', fontFamily: 'var(--font-geist-mono)', fontSize: '0.68rem', letterSpacing: '0.09em' }}>{t('organizationName')}</Typography>
                <Typography sx={{ mt: 1, fontSize: { xs: '1.15rem', sm: '1.4rem' }, letterSpacing: '-0.04em', fontWeight: 700 }}>{t('readyToStart')}</Typography>
                <Typography sx={{ mt: 0.75, color: 'rgba(239,248,231,0.72)', fontSize: '0.86rem', lineHeight: 1.55 }}>{t('readyDescription')}</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
