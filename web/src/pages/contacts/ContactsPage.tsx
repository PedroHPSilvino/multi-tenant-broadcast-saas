import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import { useAuth } from "../../hooks/useAuth";
import { useTenant } from "../../hooks/useTenant";
import { useContacts } from "../../hooks/useContacts";
import { useAppSnackbar } from "../../hooks/useAppSnackbar";
import { useAppConfirmDialog } from "../../hooks/useAppConfirmDialog";
import { createContact } from "../../services/contacts/createContact";
import { updateContact } from "../../services/contacts/updateContact";
import { deleteContact } from "../../services/contacts/deleteContact";
import type { Contact } from "../../types/contact";
import { ROUTES } from "../../constants/routes";

type FormMode = "create" | "edit";

function ContactsPage() {
  const { connectionId } = useParams<{ connectionId: string }>();
  const { user } = useAuth();
  const { tenantId } = useTenant();
  const { contacts, loading, error } = useContacts({
    tenantId,
    connectionId: connectionId ?? null,
  });
  const { showSnackbar } = useAppSnackbar();
  const { confirm } = useAppConfirmDialog();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const dialogTitle = useMemo(() => {
    return formMode === "create" ? "New Contact" : "Edit Contact";
  }, [formMode]);

  function openCreateDialog() {
    setFormMode("create");
    setSelectedContact(null);
    setName("");
    setPhone("");
    setPageError(null);
    setIsDialogOpen(true);
  }

  function openEditDialog(contact: Contact) {
    setFormMode("edit");
    setSelectedContact(contact);
    setName(contact.name);
    setPhone(contact.phone);
    setPageError(null);
    setIsDialogOpen(true);
  }

  function closeDialog() {
    if (isSaving) {
      return;
    }

    setIsDialogOpen(false);
    setSelectedContact(null);
    setName("");
    setPhone("");
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

      if (formMode === "create") {
        await createContact({
          tenantId,
          connectionId,
          name,
          phone,
          userId: user.uid,
        });

        showSnackbar("Contact created successfully.", "success");
      } else if (selectedContact) {
        await updateContact({
          contactId: selectedContact.id,
          name,
          phone,
        });

        showSnackbar("Contact updated successfully.", "success");
      }

      closeDialog();
    } catch (saveError) {
      console.error(saveError);

      if (saveError instanceof Error) {
        setPageError(saveError.message);
        showSnackbar(saveError.message, "error");
      } else {
        setPageError("Failed to save contact.");
        showSnackbar("Failed to save contact.", "error");
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(contactId: string) {
    const confirmed = await confirm({
      title: "Delete contact",
      message:
        "Are you sure you want to delete this contact? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteContact({ contactId });
      showSnackbar("Contact deleted successfully.", "success");
    } catch (deleteError) {
      console.error(deleteError);
      setPageError("Failed to delete contact.");
      showSnackbar("Failed to delete contact.", "error");
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

          <Typography variant="h4">Contacts</Typography>
        </Stack>

        <Button variant="contained" onClick={openCreateDialog}>
          New Contact
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
      ) : contacts.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="h6">No contacts found</Typography>
            <Typography variant="body2" className="mt-2 text-slate-600">
              Create your first contact for this connection.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {contacts.map((contact) => (
            <Card key={contact.id}>
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={2}
                >
                  <Box>
                    <Typography variant="h6">{contact.name}</Typography>
                    <Typography variant="body2" className="text-slate-500">
                      {contact.phone}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1}>
                    <IconButton
                      aria-label="edit contact"
                      onClick={() => openEditDialog(contact)}
                    >
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      aria-label="delete contact"
                      onClick={() => handleDelete(contact.id)}
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
            label="Name"
            fullWidth
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={isSaving}
          />

          <TextField
            margin="normal"
            label="Phone"
            fullWidth
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
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

export default ContactsPage;