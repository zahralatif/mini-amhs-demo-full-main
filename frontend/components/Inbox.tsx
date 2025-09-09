'use client';
import { useState, useMemo, useEffect } from 'react';
import { useApi } from '@/lib/useApi';
import { useAuth } from '@/lib/auth';
import type { Message, PaginatedResponse } from '@/lib/types';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import LoadingSpinner, { InboxSkeleton } from './LoadingSpinner';

export default function Inbox({ refreshKey }: { refreshKey: number }) {
  const { getJSON } = useApi();
  const { username } = useAuth();
  const [rows, setRows] = useState<Message[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [snack, setSnack] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const columns: GridColDef<Message>[] = useMemo(
    () => [
      { 
        field: 'id', 
        headerName: 'ID', 
        width: 80,
        headerAlign: 'center',
        align: 'center',
      },
      { 
        field: 'subject', 
        headerName: 'Subject', 
        flex: 1, 
        minWidth: 150,
        renderCell: (params) => (
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 400,
              color: 'text.primary'
            }}
          >
            {params.value}
          </Typography>
        ),
      },
      { 
        field: 'sender', 
        headerName: 'From', 
        width: 140,
        renderCell: (params) => (
          <Typography variant="body2" color="text.secondary">
            {params.value}
          </Typography>
        ),
      },
      {
        field: 'created_at',
        headerName: 'Time',
        width: 200,
        valueFormatter: (value: string) => {
          if (!value) return '';
          const d = new Date(value);
          return isNaN(d.getTime()) ? String(value) : d.toLocaleString();
        },
        renderCell: (params) => (
          <Typography variant="body2" color="text.secondary">
            {params.formattedValue}
          </Typography>
        ),
      },
    ],
    []
  );

  useEffect(() => {
    async function load() {
      setLoading(true);
      setSnack((s) => ({ ...s, open: false }));
      const { page, pageSize } = paginationModel;
      try {
        const url = `/api/messages?page=${page + 1}&pageSize=${pageSize}`;
        const response = await getJSON<PaginatedResponse<Message>>(url);
        setRows(response.data);
        setRowCount(response.pagination.totalItems);
      } catch (e: any) {
        setSnack({
          open: true,
          message: e.message || 'Failed to load inbox',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [refreshKey, paginationModel, getJSON]);

  if (loading && rows.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
        <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600 }}>
          Inbox for: <strong>{username}</strong>
        </Typography>
        <InboxSkeleton />
      </Paper>
    );
  }

  return (
    <Paper 
      elevation={1} 
      sx={{ p: 3, height: '100%' }}
      role="region"
      aria-label="Message inbox"
    >
      <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600 }}>
        Inbox for: <strong>{username}</strong>
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {rowCount} message{rowCount !== 1 ? 's' : ''} total
      </Typography>
      <div style={{ height: 480, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
          pageSizeOptions={[5, 10, 25]}
          paginationMode="server"
          rowCount={rowCount}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          loading={loading}
          sx={{
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid',
              borderColor: 'divider',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'background.paper',
              borderBottom: '2px solid',
              borderColor: 'divider',
            },
          }}
          aria-label="Messages data grid"
        />
      </div>
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
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
