'use client';
import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    brand: Palette['primary'];
  }
  interface PaletteOptions {
    brand?: PaletteOptions['primary'];
  }
}

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7C3AED', // purple
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#0B0B0F',  // near-black
      paper: '#12121A',     // dark card
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#C7C7D1',
    },
    brand: {
      main: '#7C3AED',
      contrastText: '#FFFFFF',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: 'none', borderRadius: 14 } } },
    MuiPaper: { styleOverrides: { root: { borderRadius: 18 } } },
  },
  typography: {
    fontFamily: `'Inter', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`,
  },
});

export default theme;
