'use client';

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'dark',
    primary: {
      main: '#A8C090',      // Verde salvia
      light: '#C2D4AE',
      dark: '#5C6B40',      // Verde oliva
      contrastText: '#1a1f14',
    },
    secondary: {
      main: '#C49A6C',      // Caramelo
      light: '#D4B48A',
      dark: '#8B5A35',      // Marrón tostado
      contrastText: '#1a1510',
    },
    background: {
      default: '#111210',   // Casi negro cálido
      paper: '#1a1c18',     // Verde oscuro muy sutil
    },
    text: {
      primary: '#EDE8D8',   // Crema
      secondary: '#9E9588', // Gris cálido
    },
    divider: 'rgba(168,192,144,0.08)',
    error: { main: '#c0614e' },
    warning: { main: '#C49A6C' },
    success: { main: '#A8C090' },
    info: { main: '#8fa89e' },
  },
  typography: {
    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 600, letterSpacing: '-0.01em' },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, padding: '8px 20px', fontWeight: 500 },
        contained: {
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 0 24px rgba(168,192,144,0.3)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#1a1c18',
          border: '1px solid rgba(168,192,144,0.08)',
          backdropFilter: 'blur(12px)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            '& fieldset': { borderColor: 'rgba(168,192,144,0.15)' },
            '&:hover fieldset': { borderColor: 'rgba(168,192,144,0.3)' },
            '&.Mui-focused fieldset': { borderColor: '#A8C090' },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 500 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#1a1c18',
          border: '1px solid rgba(168,192,144,0.08)',
        },
      },
    },
  },
});
