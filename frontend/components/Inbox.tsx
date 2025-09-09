'use client';
import { useState, useMemo, useEffect } from 'react';
import { useApi } from '@/lib/useApi';
import { useAuth } from '@/lib/auth';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { DataGrid, GridColDef, GridPaginationModel, GridValueFormatterParams } from '@mui/x-data-grid';

type Message = {
  id: number;
  sender: string;
  receiver: string;
  subject: string;
  body: string;
  created_at: string; // ISO string from backend
};

type PaginatedResponse = {
  data: Message[];
  pagination: {
    totalItems: number;
  };
};

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
      { field: 'id', headerName: 'ID', width: 80 },
      { field: 'subject', headerName: 'Subject', flex: 1, minWidth: 150 },
      { field: 'sender', headerName: 'From', width: 140 },
      {
        field: 'created_at',
        headerName: 'Time',
        width: 200,
        valueFormatter: (params: GridValueFormatterParams<string>) => {
          if (!params.value) return '';
          const d = new Date(params.value);
          return isNaN(d.getTime()) ? String(params.value) : d.toLocaleString();
        },
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
        const response = await getJSON<PaginatedResponse>(url);
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

  return (
    <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600 }}>
        Inbox for: <strong>{username}</strong>
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
        />
      </div>
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          sx={{ width: '100%' }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
