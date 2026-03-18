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
import { signInWithEmail } from "../../services/auth/signInWithEmail";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setPageError(null);

      await signInWithEmail({
        email,
        password,
      });

      navigate(ROUTES.dashboard, { replace: true });
    } catch (signInError) {
      console.error(signInError);

      if (signInError instanceof Error) {
        setPageError(signInError.message);
      } else {
        setPageError("Failed to sign in.");
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
              <Typography variant="h4">Login</Typography>
              <Typography variant="body2" className="mt-2 text-slate-600">
                Sign in to access your Broadcast SaaS workspace.
              </Typography>
            </Box>

            {pageError && <Alert severity="error">{pageError}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2}>
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

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CircularProgress size={18} color="inherit" />
                      <span>Signing in...</span>
                    </Stack>
                  ) : (
                    "Login"
                  )}
                </Button>
              </Stack>
            </Box>

            <Typography variant="body2" className="text-slate-600">
              Do not have an account?{" "}
              <Link to={ROUTES.register}>Create one</Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default LoginPage;