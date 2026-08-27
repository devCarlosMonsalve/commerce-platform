'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition, useState } from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import LanguageIcon from '@mui/icons-material/Language';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const locales = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

function stripLocale(path: string): string {
  for (const l of locales) {
    if (path === '/' + l.code || path.startsWith('/' + l.code + '/')) {
      return path.slice(l.code.length + 1) || '/';
    }
  }
  return path;
}

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const current = locales.find((l) => l.code === locale) ?? locales[0];

  const handleSwitch = (newLocale: string) => {
    setAnchorEl(null);
    const basePath = stripLocale(pathname);
    const newPath = newLocale === 'es' ? basePath : '/' + newLocale + (basePath === '/' ? '' : basePath);
    startTransition(() => {
      router.push(newPath);
      router.refresh();
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
          color: '#5C6B40',
          borderColor: 'rgba(92,107,64,0.3)',
          border: '1px solid',
          borderRadius: 2,
          px: 1.5,
          py: 0.5,
          fontSize: '0.8rem',
          '&:hover': { borderColor: 'rgba(92,107,64,0.6)', bgcolor: 'rgba(92,107,64,0.06)' },
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
              bgcolor: '#F5F0E8',
              border: '1px solid rgba(92,107,64,0.15)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
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
              color: '#3a3a2e',
              '&.Mui-selected': { bgcolor: 'rgba(92,107,64,0.12)', color: '#5C6B40', fontWeight: 600 },
              '&:hover': { bgcolor: 'rgba(92,107,64,0.06)' },
            }}
          >
            {l.flag} {l.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}