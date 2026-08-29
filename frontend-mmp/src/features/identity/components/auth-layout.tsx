'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/language-switcher';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';

export function AuthLayout({ children }: { children: ReactNode }) {
  const home = useTranslations('home');

  const operationalStates = [
    { label: home('statusCatalog'), icon: <Inventory2OutlinedIcon fontSize="small" /> },
    { label: home('statusCustomers'), icon: <GroupsOutlinedIcon fontSize="small" /> },
    { label: home('statusOrders'), icon: <ReceiptLongOutlinedIcon fontSize="small" /> },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.25fr) minmax(440px, 0.75fr)' },
        bgcolor: '#F7F8F5',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          display: { xs: 'none', lg: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: { lg: 5, xl: 7 },
          color: '#F8FAF5',
          background: 'linear-gradient(145deg, #15251E 0%, #204336 56%, #2F6752 100%)',
          '&::before': {
            content: '""',
            position: 'absolute',
            width: 580,
            height: 580,
            right: -220,
            top: -190,
            border: '1px solid rgba(224, 246, 214, 0.22)',
            borderRadius: '50%',
            boxShadow: '0 0 0 62px rgba(224, 246, 214, 0.05), 0 0 0 124px rgba(224, 246, 214, 0.035)',
          },
        }}
      >
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box sx={{ width: 36, height: 36, display: 'grid', placeItems: 'center', border: '1px solid rgba(255,255,255,0.35)', borderRadius: '50%' }}>
                <StorefrontOutlinedIcon sx={{ fontSize: 19 }} />
              </Box>
              <Typography sx={{ fontWeight: 750, letterSpacing: '-0.035em' }}>Commerce</Typography>
            </Box>
          </Link>
          <LanguageSwitcher />
        </Box>

        <Box sx={{ position: 'relative', maxWidth: 590, py: 6 }}>
          <Chip
            label={home('badge')}
            sx={{
              color: '#DDF4CC',
              bgcolor: 'rgba(220, 244, 204, 0.12)',
              border: '1px solid rgba(220, 244, 204, 0.22)',
              fontWeight: 650,
            }}
          />
          <Typography component="h1" sx={{ mt: 3, fontSize: { lg: '3.7rem', xl: '4.8rem' }, lineHeight: 0.96, letterSpacing: '-0.065em', fontWeight: 750 }}>
            {home('title')}<br />
            <Box component="span" sx={{ color: '#C9EF96' }}>{home('titleAccent')}</Box>
          </Typography>
          <Typography sx={{ mt: 3, maxWidth: 465, color: 'rgba(248,250,245,0.72)', fontSize: '1.05rem', lineHeight: 1.7 }}>
            {home('description')}
          </Typography>
        </Box>

        <Box sx={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
          {operationalStates.map(({ label, icon }) => (
            <Box key={label} sx={{ minHeight: 130, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 2, borderTop: '1px solid rgba(255,255,255,0.28)', bgcolor: 'rgba(5, 24, 16, 0.12)' }}>
              <Box sx={{ width: 32, height: 32, display: 'grid', placeItems: 'center', borderRadius: 1.5, color: '#C9EF96', bgcolor: 'rgba(201,239,150,0.12)' }}>{icon}</Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#9EDB76', boxShadow: '0 0 0 3px rgba(158,219,118,0.12)' }} />
                  <Typography sx={{ color: '#C9EF96', fontFamily: 'var(--font-geist-mono)', fontSize: '0.64rem', letterSpacing: '0.08em' }}>{home('readyToStart')}</Typography>
                </Box>
                <Typography sx={{ fontSize: '0.86rem', lineHeight: 1.45, color: 'rgba(248,250,245,0.82)' }}>{label}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, p: { xs: 2.5, sm: 4, lg: 5 } }}>
        <Box sx={{ display: { lg: 'none', xs: 'flex' }, alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ color: '#173528', textDecoration: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StorefrontOutlinedIcon fontSize="small" />
              <Typography sx={{ fontWeight: 750, letterSpacing: '-0.035em' }}>Commerce</Typography>
            </Box>
          </Link>
          <LanguageSwitcher />
        </Box>
        <Box sx={{ width: '100%', maxWidth: 408, mx: 'auto', my: 'auto' }}>{children}</Box>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 0.5, width: 'fit-content', color: '#527162', fontSize: '0.82rem', textDecoration: 'none' }}>
          <ArrowOutwardIcon sx={{ fontSize: 15 }} />
          Commerce Platform
        </Link>
      </Box>
    </Box>
  );
}
