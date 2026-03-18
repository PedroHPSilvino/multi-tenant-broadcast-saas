import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import { ROUTES } from "../../constants/routes";
import { MESSAGE_STATUSES } from "../../constants/message-statuses";
import type { MessageStatus } from "../../constants/message-statuses";
import { useAuth } from "../../hooks/useAuth";
import { useContacts } from "../../hooks/useContacts";
import { useMessages } from "../../hooks/useMessages";
import { useTenant } from "../../hooks/useTenant";
import { useAppSnackbar } from "../../hooks/useAppSnackbar";
import { useAppConfirmDialog } from "../../hooks/useAppConfirmDialog";
import { createMessage } from "../../services/messages/createMessage";
import { deleteMessage } from "../../services/messages/deleteMessage";
import { updateMessage } from "../../services/messages/updateMessage";
import type { Message } from "../../types/message";

type FormMode = "create" | "edit";

const STATUS_FILTER_OPTIONS: Array<{
  label: string;
  value: "all" | MessageStatus;
}> = [
  { label: "All", value: "all" },
  { label: "Sent", value: MESSAGE_STATUSES.sent },
  { label: "Scheduled", value: MESSAGE_STATUSES.scheduled },
];

function formatDateTimeLocalInput(timestamp: Message["scheduledAt"]): string {
  if (!timestamp) {
    return "";
  }

  const date = timestamp;
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatDisplayDate(
  timestamp: Message["scheduledAt"] | Message["sentAt"]
): string {
  if (!timestamp) {
    return "-";
  }

  return timestamp.toLocaleString();
}

function getStatusColor(
  status: MessageStatus
): "success" | "warning" | "default" {
  if (status === MESSAGE_STATUSES.sent) {
    return "success";
  }

  if (status === MESSAGE_STATUSES.scheduled) {
    return "warning";
  }

  return "default";
}

function MessagesPage() {
  const { connectionId } = useParams<{ connectionId: string }>();
  const { user } = useAuth();
  const { tenantId } = useTenant();
  const { contacts } = useContacts({
    tenantId,
    connectionId: connectionId ?? null,
  });
  const { showSnackbar } = useAppSnackbar();
  const { confirm } = useAppConfirmDialog();

  const [statusFilter, setStatusFilter] = useState<"all" | MessageStatus>(
    "all"
  );
  const { messages, loading, error } = useMessages({
    tenantId,
    connectionId: connectionId ?? null,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [content, setContent] = useState("");
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [shouldSchedule, setShouldSchedule] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const dialogTitle = useMemo(() => {
    return formMode === "create" ? "New Message" : "Edit Message";
  }, [formMode]);

  function openCreateDialog() {
    setFormMode("create");
    setSelectedMessage(null);
    setContent("");
    setSelectedContactIds([]);
    setShouldSchedule(false);
    setScheduledAt("");
    setPageError(null);
    setIsDialogOpen(true);
  }

  function openEditDialog(message: Message) {
    setFormMode("edit");
    setSelectedMessage(message);
    setContent(message.content);
    setSelectedContactIds(message.contactIds);
    setShouldSchedule(message.status === MESSAGE_STATUSES.scheduled);
    setScheduledAt(formatDateTimeLocalInput(message.scheduledAt));
    setPageError(null);
    setIsDialogOpen(true);
  }

  function closeDialog() {
    if (isSaving) {
      return;
    }

    setIsDialogOpen(false);
    setSelectedMessage(null);
    setContent("");
    setSelectedContactIds([]);
    setShouldSchedule(false);
    setScheduledAt("");
    setPageError(null);
  }

  async function handleSave() {
    if (!tenantId || !user || !connectionId) {
      setPageError("User, tenant, or connection not available.");
      return;
    }

    try {
      setIsSaving(true);
      setPageError(null);

      const parsedScheduledAt =
        shouldSchedule && scheduledAt ? new Date(scheduledAt) : null;

      if (shouldSchedule && !scheduledAt) {
        throw new Error("Scheduled date is required.");
      }

      if (parsedScheduledAt && Number.isNaN(parsedScheduledAt.getTime())) {
        throw new Error("Scheduled date is invalid.");
      }

      if (formMode === "create") {
        await createMessage({
          tenantId,
          connectionId,
          content,
          contactIds: selectedContactIds,
          scheduledAt: parsedScheduledAt,
          userId: user.uid,
        });

        showSnackbar("Message saved successfully.", "success");
      } else if (selectedMessage) {
        await updateMessage({
          messageId: selectedMessage.id,
          content,
          contactIds: selectedContactIds,
          scheduledAt: parsedScheduledAt,
        });

        showSnackbar("Message updated successfully.", "success");
      }

      closeDialog();
    } catch (saveError) {
      console.error(saveError);

      if (saveError instanceof Error) {
        setPageError(saveError.message);
        showSnackbar(saveError.message, "error");
      } else {
        setPageError("Failed to save message.");
        showSnackbar("Failed to save message.", "error");
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(messageId: string) {
    const confirmed = await confirm({
      title: "Delete message",
      message:
        "Are you sure you want to delete this message? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteMessage({ messageId });
      showSnackbar("Message deleted successfully.", "success");
    } catch (deleteError) {
      console.error(deleteError);
      setPageError("Failed to delete message.");
      showSnackbar("Failed to delete message.", "error");
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
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            component={Link}
            to={ROUTES.connections}
            variant="outlined"
            startIcon={<ArrowBackIcon />}
          >
            Back
          </Button>

          <Typography variant="h4">Messages</Typography>
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
          <Select
            size="small"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "all" | MessageStatus)
            }
          >
            {STATUS_FILTER_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>

          <Button variant="contained" onClick={openCreateDialog}>
            New Message
          </Button>
        </Stack>
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
      ) : messages.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="h6">No messages found</Typography>
            <Typography variant="body2" className="mt-2 text-slate-600">
              Create your first message for this connection.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {messages.map((message) => {
            const recipientNames = contacts
              .filter((contact) => message.contactIds.includes(contact.id))
              .map((contact) => contact.name);

            return (
              <Card key={message.id}>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="h6">Message</Typography>
                        <Chip
                          label={message.status}
                          color={getStatusColor(message.status)}
                          size="small"
                        />
                      </Stack>

                      <Stack direction="row" spacing={1}>
                        <IconButton
                          aria-label="edit message"
                          onClick={() => openEditDialog(message)}
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          aria-label="delete message"
                          onClick={() => handleDelete(message.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </Stack>

                    <Typography variant="body1">{message.content}</Typography>

                    <Typography variant="body2" className="text-slate-600">
                      Recipients:{" "}
                      {recipientNames.length > 0
                        ? recipientNames.join(", ")
                        : "No recipients found"}
                    </Typography>

                    <Typography variant="body2" className="text-slate-600">
                      Scheduled At: {formatDisplayDate(message.scheduledAt)}
                    </Typography>

                    <Typography variant="body2" className="text-slate-600">
                      Sent At: {formatDisplayDate(message.sentAt)}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
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
            label="Message Content"
            fullWidth
            multiline
            minRows={4}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            disabled={isSaving}
          />

          <Select
            multiple
            fullWidth
            displayEmpty
            value={selectedContactIds}
            onChange={(event) =>
              setSelectedContactIds(event.target.value as string[])
            }
            disabled={isSaving}
            renderValue={(selected) => {
              if ((selected as string[]).length === 0) {
                return "Select contacts";
              }

              return contacts
                .filter((contact) => (selected as string[]).includes(contact.id))
                .map((contact) => contact.name)
                .join(", ");
            }}
          >
            {contacts.map((contact) => (
              <MenuItem key={contact.id} value={contact.id}>
                <Checkbox checked={selectedContactIds.includes(contact.id)} />
                <ListItemText primary={contact.name} secondary={contact.phone} />
              </MenuItem>
            ))}
          </Select>

          <Box className="mt-4">
            <FormControlLabel
              control={
                <Checkbox
                  checked={shouldSchedule}
                  onChange={(event) => setShouldSchedule(event.target.checked)}
                  disabled={isSaving}
                />
              }
              label="Schedule message"
            />
          </Box>

          {shouldSchedule && (
            <TextField
              margin="normal"
              label="Scheduled At"
              type="datetime-local"
              fullWidth
              value={scheduledAt}
              onChange={(event) => setScheduledAt(event.target.value)}
              disabled={isSaving}
              InputLabelProps={{ shrink: true }}
            />
          )}

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

export default MessagesPage;