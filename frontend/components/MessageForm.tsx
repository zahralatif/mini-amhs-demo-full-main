'use client';
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApi } from '@/lib/useApi';

import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const schema = z.object({
  receiver: z.string().min(2, 'Min 2 characters').max(40),
  subject: z.string().min(2, 'Please add a subject').max(100),
  body: z.string().min(1, 'Message body is required').max(5000),
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
      await postJSON('/api/messages', data);
      setSnack({ open: true, message: 'Message sent ✅', severity: 'success' });
      reset();
      onSent?.();
    } catch (e: any) {
      setSnack({ open: true, message: e.message || 'Failed to send', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={1} sx={{ p: 3 }} component="form" onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600 }}>Send Message</Typography>
      <Stack spacing={2}>
        <TextField label="Receiver" {...register('receiver')} error={!!errors.receiver} helperText={errors.receiver?.message} />
        <TextField label="Subject" {...register('subject')} error={!!errors.subject} helperText={errors.subject?.message} />
        <TextField label="Body" {...register('body')} error={!!errors.body} helperText={errors.body?.message} multiline minRows={4} />
        <Button type="submit" variant="contained" size="large" disabled={loading}>
          {loading ? 'Sending…' : 'Send'}
        </Button>
      </Stack>
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({...s, open:false}))}>
        <Alert onClose={() => setSnack(s => ({...s, open:false}))} severity={snack.severity} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
