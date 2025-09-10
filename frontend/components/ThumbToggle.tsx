'use client';
import { useContext } from 'react';
import { ColorModeContext } from '@/theme/ThemeProviderClient';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import Box from '@mui/material/Box';

export default function ThumbToggle() {
  const { toggleColorMode } = useContext(ColorModeContext);
  return (
    <Tooltip title="Toggle theme">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <DarkModeIcon fontSize="small" sx={{ opacity: 0.7 }} />
        <Switch onChange={toggleColorMode} color="primary" />
        <LightModeIcon fontSize="small" sx={{ opacity: 0.7 }} />
      </Box>
    </Tooltip>
  );
}
