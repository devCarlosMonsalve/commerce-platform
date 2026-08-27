'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useTransition } from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import LanguageIcon from '@mui/icons-material/Language';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useState } from 'react';

const locales = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const current = locales.find((l) => l.code === locale) ?? locales[0];

  const handleSwitch = (newLocale: string) => {
    setAnchorEl(null);

    // Reemplaza el prefijo del locale en la URL actual
    const segments = pathname.split('/');
    const isLocalePrefix = locales.some((l) => l.code === segments[1]);
    const pathWithoutLocale = isLocalePrefix ? '/' + segments.slice(2).join('/') : pathname;
    const newPath = newLocale === 'es' ? pathWithoutLocale || '/' : `/${newLocale}${pathWithoutLocale}`;

    startTransition(() => {
      router.push(newPath);
    });
  };

  return (
    <>
      <Button
        size="small"
        startIcon={<LanguageIcon sx={{ fontSize: 16 }} />}
        endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 16 }} />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        disabled={isPending}
        sx={{
          color: 'text.secondary',
          borderColor: 'rgba(168,192,144,0.2)',
          border: '1px solid',
          borderRadius: 2,
          px: 1.5,
          py: 0.5,
          fontSize: '0.8rem',
          gap: 0.5,
          '&:hover': { borderColor: 'rgba(168,192,144,0.4)', bgcolor: 'rgba(168,192,144,0.05)' },
        }}
      >
        {current.flag} {current.label}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 140,
              bgcolor: 'background.paper',
              border: '1px solid rgba(168,192,144,0.12)',
            },
          },
        }}
      >
        {locales.map((l) => (
          <MenuItem
            key={l.code}
            selected={l.code === locale}
            onClick={() => handleSwitch(l.code)}
            sx={{
              fontSize: '0.875rem',
              gap: 1,
              '&.Mui-selected': { bgcolor: 'rgba(168,192,144,0.1)', color: '#A8C090' },
            }}
          >
            {l.flag} {l.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
