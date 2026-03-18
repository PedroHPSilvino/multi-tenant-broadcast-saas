import { Alert, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";

import { ROUTES } from "../../constants/routes";
import { MESSAGE_STATUSES } from "../../constants/message-statuses";
import { useConnections } from "../../hooks/useConnections";
import { useTenant } from "../../hooks/useTenant";
import { useTenantContacts } from "../../hooks/useTenantContacts";
import { useTenantDetails } from "../../hooks/useTenantDetails";
import { useTenantMessages } from "../../hooks/useTenantMessages";

function DashboardPage() {
  const { tenantId, membership } = useTenant();
  const {
    tenant,
    error: tenantError,
  } = useTenantDetails({ tenantId });
  const {
    connections,
    error: connectionsError,
  } = useConnections({ tenantId });
  const {
    contacts,
    error: contactsError,
  } = useTenantContacts({ tenantId });
  const {
    messages,
    error: messagesError,
  } = useTenantMessages({ tenantId });

  const sentMessagesCount = messages.filter(
    (message) => message.status === MESSAGE_STATUSES.sent
  ).length;

  const scheduledMessagesCount = messages.filter(
    (message) => message.status === MESSAGE_STATUSES.scheduled
  ).length;

  return (
    <div>
      <Typography variant="h4">Dashboard</Typography>
      <Typography variant="body1" className="mt-2 text-slate-600">
        Welcome to your tenant workspace.
      </Typography>

      {(tenantError || connectionsError || contactsError || messagesError) && (
        <Alert severity="error" className="mt-4">
          {tenantError || connectionsError || contactsError || messagesError}
        </Alert>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardContent>
            <Typography variant="subtitle2" className="text-slate-500">
              Tenant Name
            </Typography>
            <Typography variant="h6" className="mt-2">
              {tenant?.name ?? "-"}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="subtitle2" className="text-slate-500">
              Tenant ID
            </Typography>
            <Typography variant="body1" className="mt-2 break-all">
              {tenantId}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="subtitle2" className="text-slate-500">
              Membership Role
            </Typography>
            <Typography variant="h6" className="mt-2">
              {membership?.role ?? "-"}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="subtitle2" className="text-slate-500">
              Total Connections
            </Typography>
            <Typography variant="h4" className="mt-2">
              {connections.length}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="subtitle2" className="text-slate-500">
              Total Contacts
            </Typography>
            <Typography variant="h4" className="mt-2">
              {contacts.length}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="subtitle2" className="text-slate-500">
              Total Messages
            </Typography>
            <Typography variant="h4" className="mt-2">
              {messages.length}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="subtitle2" className="text-slate-500">
              Scheduled Messages
            </Typography>
            <Typography variant="h4" className="mt-2">
              {scheduledMessagesCount}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="subtitle2" className="text-slate-500">
              Sent Messages
            </Typography>
            <Typography variant="h4" className="mt-2">
              {sentMessagesCount}
            </Typography>
          </CardContent>
        </Card>
      </div>

      <Stack direction="row" spacing={2} className="mt-6">
        <Button component={Link} to={ROUTES.connections} variant="contained">
          Open Connections
        </Button>
      </Stack>
    </div>
  );
}

export default DashboardPage;