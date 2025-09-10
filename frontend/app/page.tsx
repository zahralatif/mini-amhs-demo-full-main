'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Navbar from '@/components/Navbar';
import MessageForm from '@/components/MessageForm';
import Inbox from '@/components/Inbox';

export default function Page() {
  const { token, isLoading } = useAuth();
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!isLoading && !token) {
      router.push('/auth');
    }
  }, [isLoading, token, router]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!token) {
    return null; // Will redirect to /auth
  }

  const handleMessageSent = () => {
    setRefreshKey(oldKey => oldKey + 1);
  };

  return (
    <Box>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          Full‑Stack Messaging Demo
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Backend: Go + PostgreSQL · Frontend: Next.js + Material UI
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <MessageForm onSent={handleMessageSent} />
          </Grid>
          <Grid item xs={12} md={8}>
            <Inbox refreshKey={refreshKey} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
