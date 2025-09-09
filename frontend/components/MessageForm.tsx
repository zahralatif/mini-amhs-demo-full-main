'use client';
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApi } from '@/lib/useApi';
import type { CreateMessageRequest } from '@/lib/types';

import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import LoadingSpinner from './LoadingSpinner';

const schema = z.object({
  receiver: z.string()
    .min(2, 'Receiver must be at least 2 characters')
    .max(40, 'Receiver must be less than 40 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Receiver can only contain letters, numbers, hyphens, and underscores'),
  subject: z.string()
    .min(2, 'Subject must be at least 2 characters')
    .max(100, 'Subject must be less than 100 characters'),
  body: z.string()
    .min(1, 'Message body is required')
    .max(5000, 'Message body must be less than 5000 characters'),
});

type FormData = z.infer<typeof schema>;

export default function MessageForm({ onSent }: { onSent?: () => void }) {
  const { postJSON } = useApi();
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState<{open: boolean; message: string; severity: 'success' | 'error'}>({open:false, message:'', severity:'success'});

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { receiver: '', subject: '', body: '' },
    mode: 'onTouched',
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const messageData: CreateMessageRequest = {
        receiver: data.receiver,
        subject: data.subject,
        body: data.body,
      };
      await postJSON('/api/messages', messageData);
      setSnack({ open: true, message: 'Message sent successfully! ✅', severity: 'success' });
      reset();
      onSent?.();
    } catch (e: any) {
      setSnack({ 
        open: true, 
        message: e.message || 'Failed to send message. Please try again.', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper 
      elevation={1} 
      sx={{ p: 3 }} 
      component="form" 
      onSubmit={handleSubmit(onSubmit)}
      role="form"
      aria-label="Send message form"
    >
      <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600 }}>
        Send Message
      </Typography>
      <Stack spacing={2}>
        <TextField 
          label="Receiver" 
          {...register('receiver')} 
          error={!!errors.receiver} 
          helperText={errors.receiver?.message}
          disabled={loading}
          inputProps={{ 'aria-describedby': 'receiver-helper-text' }}
        />
        <TextField 
          label="Subject" 
          {...register('subject')} 
          error={!!errors.subject} 
          helperText={errors.subject?.message}
          disabled={loading}
          inputProps={{ 'aria-describedby': 'subject-helper-text' }}
        />
        <TextField 
          label="Message Body" 
          {...register('body')} 
          error={!!errors.body} 
          helperText={errors.body?.message} 
          multiline 
          minRows={4}
          disabled={loading}
          inputProps={{ 'aria-describedby': 'body-helper-text' }}
        />
        <Button 
          type="submit" 
          variant="contained" 
          size="large" 
          disabled={loading}
          aria-label={loading ? 'Sending message' : 'Send message'}
        >
          {loading ? <LoadingSpinner message="Sending..." size={20} /> : 'Send Message'}
        </Button>
      </Stack>
      <Snackbar 
        open={snack.open} 
        autoHideDuration={4000} 
        onClose={() => setSnack(s => ({...s, open:false}))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnack(s => ({...s, open:false}))} 
          severity={snack.severity} 
          sx={{ width: '100%' }}
          role="alert"
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
