import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

import { ROUTES } from "../../constants/routes";
import { registerUser } from "../../services/auth/registerUser";

function RegisterPage() {
  const navigate = useNavigate();

  const [tenantName, setTenantName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmPassword) {
      setPageError("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      setPageError(null);

      await registerUser({
        tenantName,
        email,
        password,
      });

      navigate(ROUTES.dashboard, { replace: true });
    } catch (registerError) {
      console.error(registerError);

      if (registerError instanceof Error) {
        setPageError(registerError.message);
      } else {
        setPageError("Failed to create account.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Box className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <Card className="w-full max-w-md rounded-2xl">
        <CardContent className="p-8">
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4">Create Account</Typography>
              <Typography variant="body2" className="mt-2 text-slate-600">
                Register a user, create a tenant, and start using the platform.
              </Typography>
            </Box>

            {pageError && <Alert severity="error">{pageError}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  label="Tenant Name"
                  fullWidth
                  value={tenantName}
                  onChange={(event) => setTenantName(event.target.value)}
                  disabled={isSubmitting}
                />

                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isSubmitting}
                />

                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={isSubmitting}
                />

                <TextField
                  label="Confirm Password"
                  type="password"
                  fullWidth
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  disabled={isSubmitting}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CircularProgress size={18} color="inherit" />
                      <span>Creating account...</span>
                    </Stack>
                  ) : (
                    "Register"
                  )}
                </Button>
              </Stack>
            </Box>

            <Typography variant="body2" className="text-slate-600">
              Already have an account? <Link to={ROUTES.login}>Login</Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default RegisterPage;