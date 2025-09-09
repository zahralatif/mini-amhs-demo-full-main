'use client';
import { Box, CircularProgress, Typography, Skeleton } from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ 
  message = 'Loading...', 
  size = 40, 
  fullScreen = false 
}: LoadingSpinnerProps) {
  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <CircularProgress size={size} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100%',
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
}

// Skeleton components for better loading states
export function MessageSkeleton() {
  return (
    <Box sx={{ p: 2 }}>
      <Skeleton variant="text" width="60%" height={24} />
      <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
      <Skeleton variant="rectangular" height={60} sx={{ mt: 2, borderRadius: 1 }} />
    </Box>
  );
}

export function InboxSkeleton() {
  return (
    <Box sx={{ p: 3 }}>
      <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
      {Array.from({ length: 5 }).map((_, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
        </Box>
      ))}
    </Box>
  );
}
