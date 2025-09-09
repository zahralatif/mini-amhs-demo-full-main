'use client';

import { useAuth } from '@/lib/auth';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import AirIcon from '@mui/icons-material/Air';
import ThumbToggle from '@/components/ThumbToggle';

export default function Navbar() {
  const { username, logout } = useAuth();

  return (
    <AppBar position="sticky" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #20202A', backdropFilter: 'blur(6px)' }}>
      <Toolbar sx={{ display: 'flex', gap: 2, py: 1.5 }}>
        <AirIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Mini AMHS
        </Typography>
        <Chip label="Demo" size="small" sx={{ ml: 1, bgcolor: 'primary.main', color: 'primary.contrastText' }} />
        <Box sx={{ flexGrow: 1 }} />
        {username && (
          <Typography variant="body2" sx={{ mr: 2 }}>
            Welcome, <strong>{username}</strong>
          </Typography>
        )}
        <ThumbToggle />
        <Button onClick={logout} color="inherit">
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}
