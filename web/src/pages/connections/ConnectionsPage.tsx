import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ContactsIcon from "@mui/icons-material/Contacts";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MessageIcon from "@mui/icons-material/Message";
import { Link } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { useTenant } from "../../hooks/useTenant";
import { useConnections } from "../../hooks/useConnections";
import { useAppSnackbar } from "../../hooks/useAppSnackbar";
import { useAppConfirmDialog } from "../../hooks/useAppConfirmDialog";
import { createConnection } from "../../services/connections/createConnection";
import { deleteConnection } from "../../services/connections/deleteConnection";
import { updateConnection } from "../../services/connections/updateConnection";
import type { Connection } from "../../types/connection";

type FormMode = "create" | "edit";

function ConnectionsPage() {
  const { user } = useAuth();
  const { tenantId } = useTenant();
  const { connections, loading, error } = useConnections({ tenantId });
  const { showSnackbar } = useAppSnackbar();
  const { confirm } = useAppConfirmDialog();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [name, setName] = useState("");
  const [selectedConnection, setSelectedConnection] =
    useState<Connection | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const dialogTitle = useMemo(() => {
    return formMode === "create" ? "New Connection" : "Edit Connection";
  }, [formMode]);

  function openCreateDialog() {
    setFormMode("create");
    setSelectedConnection(null);
    setName("");
    setPageError(null);
    setIsDialogOpen(true);
  }

  function openEditDialog(connection: Connection) {
    setFormMode("edit");
    setSelectedConnection(connection);
    setName(connection.name);
    setPageError(null);
    setIsDialogOpen(true);
  }

  function closeDialog() {
    if (isSaving) {
      return;
    }

    setIsDialogOpen(false);
    setSelectedConnection(null);
    setName("");
    setPageError(null);
  }

  async function handleSave() {
    if (!tenantId || !user) {
      setPageError("User or tenant not available.");
      return;
    }

    try {
      setIsSaving(true);
      setPageError(null);

      if (formMode === "create") {
        await createConnection({
          tenantId,
          name,
          userId: user.uid,
        });

        showSnackbar("Connection created successfully.", "success");
      } else if (selectedConnection) {
        await updateConnection({
          connectionId: selectedConnection.id,
          name,
        });

        showSnackbar("Connection updated successfully.", "success");
      }

      closeDialog();
    } catch (saveError) {
      console.error(saveError);

      if (saveError instanceof Error) {
        setPageError(saveError.message);
        showSnackbar(saveError.message, "error");
      } else {
        setPageError("Failed to save connection.");
        showSnackbar("Failed to save connection.", "error");
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(connectionId: string) {
    const confirmed = await confirm({
      title: "Delete connection",
      message:
        "Are you sure you want to delete this connection? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteConnection({ connectionId });
      showSnackbar("Connection deleted successfully.", "success");
    } catch (deleteError) {
      console.error(deleteError);
      setPageError("Failed to delete connection.");
      showSnackbar("Failed to delete connection.", "error");
    }
  }

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        className="mb-6"
      >
        <Typography variant="h4">Connections</Typography>
        <Button variant="contained" onClick={openCreateDialog}>
          New Connection
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      {pageError && (
        <Alert severity="error" className="mb-4">
          {pageError}
        </Alert>
      )}

      {loading ? (
        <Box className="flex justify-center py-10">
          <CircularProgress />
        </Box>
      ) : connections.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="h6">No connections found</Typography>
            <Typography variant="body2" className="mt-2 text-slate-600">
              Create your first connection to start organizing contacts and
              messages.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {connections.map((connection) => (
            <Card key={connection.id}>
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={2}
                >
                  <Box>
                    <Typography variant="h6">{connection.name}</Typography>
                    <Typography variant="body2" className="text-slate-500">
                      ID: {connection.id}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1}>
                    <IconButton
                      aria-label="view contacts"
                      component={Link}
                      to={`/connections/${connection.id}/contacts`}
                    >
                      <ContactsIcon />
                    </IconButton>

                    <IconButton
                      aria-label="view messages"
                      component={Link}
                      to={`/connections/${connection.id}/messages`}
                    >
                      <MessageIcon />
                    </IconButton>

                    <IconButton
                      aria-label="edit connection"
                      onClick={() => openEditDialog(connection)}
                    >
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      aria-label="delete connection"
                      onClick={() => handleDelete(connection.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Dialog
        open={isDialogOpen}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{dialogTitle}</DialogTitle>

        <DialogContent>
          <TextField
            autoFocus
            margin="normal"
            label="Connection Name"
            fullWidth
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={isSaving}
          />

          {pageError && (
            <Alert severity="error" className="mt-4">
              {pageError}
            </Alert>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={closeDialog} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ConnectionsPage;