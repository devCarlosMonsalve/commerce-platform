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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '@/context/auth.context';

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
  const home = useTranslations('home');
  const auth = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const features = [home('featureTenants'), home('featureOrders'), home('featureRoles')];

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
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default' }}>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #8B5A35 0%, #C49A6C 100%)',
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 6,
          gap: 2,
        }}
      >
        <Typography variant="h3" sx={{ color: '#F5F0E8', fontWeight: 800 }}>
          Commerce Platform
        </Typography>
        <Typography sx={{ color: 'rgba(245,240,232,0.76)', textAlign: 'center', maxWidth: 280 }}>
          {home('description')}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2, width: '100%', maxWidth: 320 }}>
          {features.map((feature) => (
            <Box key={feature} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CheckCircleIcon sx={{ color: '#F5F0E8', fontSize: 20 }} />
              <Typography sx={{ color: '#F5F0E8' }}>{feature}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box
        sx={{
          bgcolor: 'background.default',
          flex: { xs: 1, md: '0 0 480px' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 3, sm: 4, md: 6 },
          py: 6,
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: '100%',
            maxWidth: 380,
            bgcolor: 'background.paper',
            borderRadius: 4,
            p: { xs: 3, sm: 4 },
            boxShadow: '0 24px 60px rgba(139,90,53,0.14)',
            border: '1px solid rgba(139,90,53,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" sx={{ color: 'secondary.main', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Commerce Platform
            </Typography>
            <Typography variant="h4" sx={{ color: 'text.primary' }}>
              {t('register')}
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              {t('hasAccount')}{' '}
              <Link href="/login" style={{ color: '#8B5A35', fontWeight: 600, textDecoration: 'none' }}>
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

          <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ minHeight: 48 }}>
            {loading ? <CircularProgress size={20} color="inherit" /> : t('register')}
          </Button>

          <Typography sx={{ color: 'text.secondary', textAlign: 'center' }}>
            {t('hasAccount')}{' '}
            <Link href="/login" style={{ color: '#8B5A35', fontWeight: 600, textDecoration: 'none' }}>
              {t('login')}
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
