'use client';
import { useState, useMemo, useEffect } from 'react';
import { useApi } from '@/lib/useApi';
import { useAuth } from '@/lib/auth';
import type { Message, PaginatedResponse } from '@/lib/types';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { DataGrid, GridColDef, GridPaginationModel, GridRowSelectionModel } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { deleteMessages, updateMessages } from '@/lib/api';
import LoadingSpinner, { InboxSkeleton } from './LoadingSpinner';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Divider from '@mui/material/Divider';

export default function Inbox({ refreshKey }: { refreshKey: number }) {
  const { getJSON } = useApi();
  const { username } = useAuth();
  const [rows, setRows] = useState<Message[] | null>([]);
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
  const [selection, setSelection] = useState<GridRowSelectionModel>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMessageDialog, setSelectedMessageDialog] = useState<Message | null>(null);
  const rowsArray: Message[] = Array.isArray(rows) ? rows : [];
  const selectedMessages: Message[] = useMemo(() => {
    const ids = new Set(selection.map((id) => Number(id)));
    return rowsArray.filter((m) => ids.has(Number(m.id)));
  }, [selection, rowsArray]);
  const allSelectedAreRead = selectedMessages.length > 0 && selectedMessages.every((m) => !!m.is_read);
  const allSelectedAreUnread = selectedMessages.length > 0 && selectedMessages.every((m) => !m.is_read);

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
              fontWeight: params.row.is_read ? 400 : 700,
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
        const url = `/api/messages?page=${page + 1}&pageSize=${pageSize}&archived=${showArchived}`;
        const response = await getJSON<PaginatedResponse<Message>>(url);
        const safeData = Array.isArray((response as any)?.data) ? (response as any).data as Message[] : [];
        const safeTotal = Number((response as any)?.pagination?.totalItems ?? safeData.length ?? 0);
        setRows(safeData);
        setRowCount(Number.isFinite(safeTotal) ? safeTotal : 0);
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
  }, [refreshKey, paginationModel, getJSON, showArchived]);

  const rowsLength = rowsArray.length;

  if (loading && rowsLength === 0) {
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
      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
        <Button
          variant={showArchived ? 'contained' : 'outlined'}
          color="inherit"
          size="small"
          onClick={() => setShowArchived((v) => !v)}
        >
          {showArchived ? 'Showing Archived' : 'Show Archived'}
        </Button>
        <Button
          variant="outlined"
          color="error"
          size="small"
          disabled={selection.length === 0 || loading}
          onClick={async () => {
            try {
              setLoading(true);
              const ids = selection.map((id) => Number(id)).filter((n) => Number.isFinite(n));
              if (ids.length === 0) return;
              await deleteMessages(localStorage.getItem('jwt_token') || '', ids);
              setSnack({ open: true, message: `Deleted ${ids.length} message(s)`, severity: 'success' });
              // Refresh
              setPaginationModel((pm) => ({ ...pm }));
            } catch (e: any) {
              setSnack({ open: true, message: e.message || 'Failed to delete', severity: 'error' });
            } finally {
              setLoading(false);
              setSelection([]);
            }
          }}
        >
          Delete Selected
        </Button>
        {showArchived && (
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            disabled={selection.length === 0 || loading}
            onClick={async () => {
              try {
                setLoading(true);
                const ids = selection.map((id) => Number(id)).filter((n) => Number.isFinite(n));
                if (ids.length === 0) return;
                await updateMessages(localStorage.getItem('jwt_token') || '', { ids, is_archived: false });
                setSnack({ open: true, message: `Unarchived ${ids.length} message(s)`, severity: 'success' });
                setPaginationModel((pm) => ({ ...pm }));
              } catch (e: any) {
                setSnack({ open: true, message: e.message || 'Failed to unarchive', severity: 'error' });
              } finally {
                setLoading(false);
                setSelection([]);
              }
            }}
          >
            Unarchive
          </Button>
        )}
        <Button
          variant="outlined"
          color="primary"
          size="small"
          disabled={selection.length === 0 || loading}
          onClick={async () => {
            try {
              setLoading(true);
              const ids = selection.map((id) => Number(id)).filter((n) => Number.isFinite(n));
              if (ids.length === 0) return;
              const targetIsRead = !allSelectedAreRead;
              await updateMessages(localStorage.getItem('jwt_token') || '', { ids, is_read: targetIsRead });
              setSnack({ open: true, message: targetIsRead ? `Marked ${ids.length} as read` : `Marked ${ids.length} as unread`, severity: 'success' });
              setPaginationModel((pm) => ({ ...pm }));
            } catch (e: any) {
              setSnack({ open: true, message: e.message || 'Failed to toggle read state', severity: 'error' });
            } finally {
              setLoading(false);
            }
          }}
        >
          {allSelectedAreRead ? 'Mark as Unread' : 'Mark as Read'}
        </Button>
        {!showArchived && (
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            disabled={selection.length === 0 || loading}
            onClick={async () => {
              try {
                setLoading(true);
                const ids = selection.map((id) => Number(id)).filter((n) => Number.isFinite(n));
                if (ids.length === 0) return;
                await updateMessages(localStorage.getItem('jwt_token') || '', { ids, is_archived: true });
                setSnack({ open: true, message: `Archived ${ids.length} message(s)`, severity: 'success' });
                setPaginationModel((pm) => ({ ...pm }));
              } catch (e: any) {
                setSnack({ open: true, message: e.message || 'Failed to archive', severity: 'error' });
              } finally {
                setLoading(false);
                setSelection([]);
              }
            }}
          >
            Archive
          </Button>
        )}
      </Stack>
      <div style={{ height: 480, width: '100%' }}>
        <DataGrid
          rows={rowsArray}
          columns={columns}
          disableRowSelectionOnClick
          onRowDoubleClick={async (params) => {
            const m = params.row as Message;
            setSelectedMessageDialog(m);
            setDialogOpen(true);
            try {
              if (!m.is_read) {
                await updateMessages(localStorage.getItem('jwt_token') || '', { ids: [Number(m.id)], is_read: true });
                setPaginationModel((pm) => ({ ...pm }));
              }
            } catch {}
          }}
          checkboxSelection
          rowSelectionModel={selection}
          onRowSelectionModelChange={setSelection}
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
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedMessageDialog?.subject || 'Message'}
        </DialogTitle>
        <DialogContent dividers>
          {selectedMessageDialog && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                From: <strong>{selectedMessageDialog.sender}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                To: <strong>{selectedMessageDialog.receiver}</strong>
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {selectedMessageDialog.body}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          {selectedMessageDialog && (
            <>
              <Button
                onClick={async () => {
                  try {
                    const target = !selectedMessageDialog.is_read;
                    await updateMessages(localStorage.getItem('jwt_token') || '', { ids: [Number(selectedMessageDialog.id)], is_read: target });
                    setPaginationModel((pm) => ({ ...pm }));
                    setSelectedMessageDialog({ ...selectedMessageDialog, is_read: target });
                  } catch {}
                }}
              >
                {selectedMessageDialog.is_read ? 'Mark as Unread' : 'Mark as Read'}
              </Button>
              {!showArchived ? (
                <Button
                  color="secondary"
                  onClick={async () => {
                    try {
                      await updateMessages(localStorage.getItem('jwt_token') || '', { ids: [Number(selectedMessageDialog.id)], is_archived: true });
                      setPaginationModel((pm) => ({ ...pm }));
                      setDialogOpen(false);
                    } catch {}
                  }}
                >
                  Archive
                </Button>
              ) : (
                <Button
                  color="secondary"
                  onClick={async () => {
                    try {
                      await updateMessages(localStorage.getItem('jwt_token') || '', { ids: [Number(selectedMessageDialog.id)], is_archived: false });
                      setPaginationModel((pm) => ({ ...pm }));
                      setDialogOpen(false);
                    } catch {}
                  }}
                >
                  Unarchive
                </Button>
              )}
            </>
          )}
        </DialogActions>
      </Dialog>
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
