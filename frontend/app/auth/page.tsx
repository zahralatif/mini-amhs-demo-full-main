'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Paper,
} from '@mui/material';
import NextLink from 'next/link';
import { Login, PersonAdd } from '@mui/icons-material';

export default function AuthPage() {
  const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && token) {
      router.push('/');
    }
  }, [isLoading, token, router]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (token) {
    return null; // Will redirect to home
  }

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h3" sx={{ mb: 2, textAlign: 'center' }}>
          Welcome to Mini AMHS
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
          A modern messaging system demo
        </Typography>
        
        <Grid container spacing={3} sx={{ maxWidth: 600 }}>
          <Grid item xs={12} md={6}>
            <Card 
              elevation={3}
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
                <Login sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" component="h2" gutterBottom>
                  Login
                </Typography>
                <Typography color="text.secondary">
                  Already have an account? Sign in to access your messages.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button
                  component={NextLink}
                  href="/login"
                  variant="contained"
                  size="large"
                  startIcon={<Login />}
                  sx={{ minWidth: 150 }}
                >
                  Login
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card 
              elevation={3}
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
                <PersonAdd sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h5" component="h2" gutterBottom>
                  Register
                </Typography>
                <Typography color="text.secondary">
                  New to Mini AMHS? Create an account to start messaging.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button
                  component={NextLink}
                  href="/register"
                  variant="contained"
                  color="secondary"
                  size="large"
                  startIcon={<PersonAdd />}
                  sx={{ minWidth: 150 }}
                >
                  Register
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>

        <Paper 
          elevation={1} 
          sx={{ 
            mt: 4, 
            p: 3, 
            maxWidth: 600, 
            textAlign: 'center',
            backgroundColor: 'grey.50'
          }}
        >
          <Typography variant="body2" color="text.primary">
            <strong>Demo Features:</strong> User authentication, real-time messaging, 
            responsive design with Material-UI, and PostgreSQL backend.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
