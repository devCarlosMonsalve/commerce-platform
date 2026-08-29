'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '@/context/auth.context';
import { AuthLayout } from './auth-layout';

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error !== null) {
    const response = Reflect.get(error, 'response');
    if (typeof response === 'object' && response !== null) {
      const data = Reflect.get(response, 'data');
      if (typeof data === 'object' && data !== null) {
        const message = Reflect.get(data, 'message');
        if (Array.isArray(message)) {
          return message.filter((item): item is string => typeof item === 'string').join(', ');
        }
        if (typeof message === 'string') {
          return message;
        }
      }
    }

    const message = Reflect.get(error, 'message');
    if (typeof message === 'string') {
      return message;
    }
  }

  return fallback;
}

export default function RegisterPage() {
  const t = useTranslations('auth');
  const auth = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.isLoading && auth.isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [auth.isAuthenticated, auth.isLoading, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await auth.register(email, password, name || undefined);
      router.replace('/dashboard');
    } catch (submitError) {
      setError(getErrorMessage(submitError, t('genericError')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: '100%',
            p: { xs: 0, sm: 1 },
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            <Typography variant="body2" sx={{ color: '#57915E', fontWeight: 750, letterSpacing: '0.12em', fontSize: '0.68rem', textTransform: 'uppercase' }}>
              Commerce Platform
            </Typography>
            <Typography component="h1" sx={{ color: '#173528', fontSize: { xs: '2.25rem', sm: '2.7rem' }, lineHeight: 1, fontWeight: 740, letterSpacing: '-0.055em' }}>
              {t('register')}
            </Typography>
            <Typography sx={{ color: '#71857B', lineHeight: 1.55 }}>
              {t('hasAccount')}{' '}
              <Link href="/login" style={{ color: '#326B4C', fontWeight: 700, textDecoration: 'none' }}>
                {t('login')}
              </Link>
            </Typography>
          </Box>

          <TextField
            label={t('name')}
            fullWidth
            autoComplete="name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (error) setError(null);
            }}
          />

          <TextField
            label={t('email')}
            type="email"
            fullWidth
            required
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (error) setError(null);
            }}
          />

          <TextField
            label={t('password')}
            type={showPassword ? 'text' : 'password'}
            fullWidth
            required
            autoComplete="new-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (error) setError(null);
            }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      edge="end"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          {error ? <Alert severity="error">{error}</Alert> : null}

          <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ minHeight: 54, bgcolor: '#193B2C', '&:hover': { bgcolor: '#285441' } }}>
            {loading ? <CircularProgress size={20} color="inherit" /> : t('register')}
          </Button>

          <Typography sx={{ color: '#71857B', textAlign: 'center', fontSize: '0.9rem' }}>
            {t('hasAccount')}{' '}
            <Link href="/login" style={{ color: '#326B4C', fontWeight: 700, textDecoration: 'none' }}>
              {t('login')}
            </Link>
          </Typography>
      </Box>
    </AuthLayout>
  );
}
