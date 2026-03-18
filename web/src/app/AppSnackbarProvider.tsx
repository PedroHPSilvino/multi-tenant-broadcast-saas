import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Alert, Snackbar } from "@mui/material";

type SnackbarSeverity = "success" | "error" | "info" | "warning";

type SnackbarState = {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
};

type AppSnackbarContextValue = {
  showSnackbar: (message: string, severity?: SnackbarSeverity) => void;
};

const AppSnackbarContext = createContext<AppSnackbarContextValue | undefined>(
  undefined
);

type AppSnackbarProviderProps = {
  children: ReactNode;
};

function AppSnackbarProvider({ children }: AppSnackbarProviderProps) {
  const [snackbarState, setSnackbarState] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "info",
  });

  const showSnackbar = useCallback(
    (message: string, severity: SnackbarSeverity = "info") => {
      setSnackbarState({
        open: true,
        message,
        severity,
      });
    },
    []
  );

  function handleClose() {
    setSnackbarState((currentValue) => ({
      ...currentValue,
      open: false,
    }));
  }

  const contextValue = useMemo(
    () => ({
      showSnackbar,
    }),
    [showSnackbar]
  );

  return (
    <AppSnackbarContext.Provider value={contextValue}>
      {children}

      <Snackbar
        open={snackbarState.open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleClose}
          severity={snackbarState.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarState.message}
        </Alert>
      </Snackbar>
    </AppSnackbarContext.Provider>
  );
}

export function useAppSnackbarContext() {
  const context = useContext(AppSnackbarContext);

  if (!context) {
    throw new Error(
      "useAppSnackbarContext must be used inside AppSnackbarProvider."
    );
  }

  return context;
}

export default AppSnackbarProvider;