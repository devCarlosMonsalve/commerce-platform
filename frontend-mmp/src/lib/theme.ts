'use client';

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'light',
    primary: {
      main: '#285C42',
      light: '#D1F09B',
      dark: '#173528',
      contrastText: '#F2F9EF',
    },
    secondary: {
      main: '#57915E',
      light: '#E3F1D3',
      dark: '#326B4C',
      contrastText: '#F2F9EF',
    },
    background: {
      default: '#F5F7F4',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#173528',
      secondary: '#698074',
    },
    divider: 'rgba(23,53,40,0.1)',
    error: { main: '#b94040' },
    warning: { main: '#C49A6C' },
    success: { main: '#5C6B40' },
    info: { main: '#7A8F6E' },
  },
  typography: {
    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.02em', color: '#2C2C20' },
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
          '&:hover': { boxShadow: '0 4px 20px rgba(92,107,64,0.3)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#FDFAF4',
          border: '1px solid rgba(92,107,64,0.1)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: '#FDFAF4',
            '& fieldset': { borderColor: 'rgba(92,107,64,0.2)' },
            '&:hover fieldset': { borderColor: 'rgba(92,107,64,0.4)' },
            '&.Mui-focused fieldset': { borderColor: '#5C6B40' },
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
          backgroundColor: '#FDFAF4',
          border: '1px solid rgba(92,107,64,0.08)',
        },
      },
    },
  },
});
