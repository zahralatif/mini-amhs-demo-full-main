'use client';
import * as React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import createAppTheme from '../theme';
import type { ColorMode } from '@/lib/types';

interface ColorModeContextType {
  toggleColorMode: () => void;
  mode: ColorMode;
}

export const ColorModeContext = React.createContext<ColorModeContextType>({
  toggleColorMode: () => {},
  mode: 'dark',
});

export default function ThemeProviderClient({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<ColorMode>('dark');

  // Load theme preference from localStorage on mount
  React.useEffect(() => {
    const savedMode = localStorage.getItem('theme-mode') as ColorMode;
    if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
      setMode(savedMode);
    }
  }, []);

  const colorMode = React.useMemo(() => ({
    toggleColorMode: () => {
      setMode(prevMode => {
        const newMode = prevMode === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme-mode', newMode);
        return newMode;
      });
    },
    mode,
  }), [mode]);

  const theme = React.useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
