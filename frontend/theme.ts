'use client';
import { createTheme, ThemeOptions } from '@mui/material/styles';
import type { ColorMode } from '@/lib/types';

declare module '@mui/material/styles' {
  interface Palette {
    brand: Palette['primary'];
  }
  interface PaletteOptions {
    brand?: PaletteOptions['primary'];
  }
}

const createAppTheme = (mode: ColorMode) => {
  const isDark = mode === 'dark';
  
  const themeOptions: ThemeOptions = {
    palette: {
      mode,
      primary: {
        main: '#7C3AED', // purple
        light: '#9F67FF',
        dark: '#5B21B6',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#10B981', // emerald
        light: '#34D399',
        dark: '#059669',
        contrastText: '#FFFFFF',
      },
      background: {
        default: isDark ? '#0B0B0F' : '#FAFAFA',
        paper: isDark ? '#12121A' : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#FFFFFF' : '#111827',
        secondary: isDark ? '#C7C7D1' : '#4B5563',
      },
      brand: {
        main: '#7C3AED',
        light: '#9F67FF',
        dark: '#5B21B6',
        contrastText: '#FFFFFF',
      },
      error: {
        main: '#EF4444',
        light: '#F87171',
        dark: '#DC2626',
      },
      warning: {
        main: '#F59E0B',
        light: '#FBBF24',
        dark: '#D97706',
      },
      success: {
        main: '#10B981',
        light: '#34D399',
        dark: '#059669',
      },
    },
    shape: {
      borderRadius: 16,
    },
    typography: {
      fontFamily: `'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif`,
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
      },
      h2: {
        fontWeight: 600,
        fontSize: '2rem',
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.5rem',
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.25rem',
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.125rem',
      },
      h6: {
        fontWeight: 600,
        fontSize: '1rem',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 14,
            fontWeight: 500,
            padding: '8px 16px',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 18,
            backgroundImage: 'none',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: 'none',
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
};

export default createAppTheme;
