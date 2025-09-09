'use client';
import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

export default function ThemeProviderClient({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<'dark' | 'light'>('dark');
  const colorMode = React.useMemo(() => ({
    toggleColorMode: () => setMode(prev => prev === 'light' ? 'dark' : 'light')
  }), []);

  const theme = React.useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: '#7C3AED', contrastText: '#FFFFFF' }, // purple
      background: {
        default: mode === 'dark' ? '#0B0B0F' : '#fafafa',
        paper: mode === 'dark' ? '#12121A' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? '#FFFFFF' : '#111827',
        secondary: mode === 'dark' ? '#C7C7D1' : '#4B5563',
      },
    },
    shape: { borderRadius: 16 },
    typography: { fontFamily: `'Inter', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif` },
  }), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
