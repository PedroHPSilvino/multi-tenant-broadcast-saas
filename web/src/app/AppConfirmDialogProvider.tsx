import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

type ConfirmDialogOptions = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
};

type AppConfirmDialogContextValue = {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
};

const AppConfirmDialogContext = createContext<
  AppConfirmDialogContextValue | undefined
>(undefined);

type ConfirmDialogState = ConfirmDialogOptions & {
  open: boolean;
  resolver: ((value: boolean) => void) | null;
};

type AppConfirmDialogProviderProps = {
  children: ReactNode;
};

function AppConfirmDialogProvider({
  children,
}: AppConfirmDialogProviderProps) {
  const [dialogState, setDialogState] = useState<ConfirmDialogState>({
    open: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    resolver: null,
  });

  const confirm = useCallback((options: ConfirmDialogOptions) => {
    return new Promise<boolean>((resolve) => {
      setDialogState({
        open: true,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText ?? "Confirm",
        cancelText: options.cancelText ?? "Cancel",
        resolver: resolve,
      });
    });
  }, []);

  function handleClose(result: boolean) {
    if (dialogState.resolver) {
      dialogState.resolver(result);
    }

    setDialogState({
      open: false,
      title: "",
      message: "",
      confirmText: "Confirm",
      cancelText: "Cancel",
      resolver: null,
    });
  }

  const contextValue = useMemo(
    () => ({
      confirm,
    }),
    [confirm]
  );

  return (
    <AppConfirmDialogContext.Provider value={contextValue}>
      {children}

      <Dialog
        open={dialogState.open}
        onClose={() => handleClose(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>{dialogState.title}</DialogTitle>

        <DialogContent>
          <Typography variant="body1">{dialogState.message}</Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => handleClose(false)}>
            {dialogState.cancelText}
          </Button>

          <Button
            onClick={() => handleClose(true)}
            variant="contained"
            color="error"
          >
            {dialogState.confirmText}
          </Button>
        </DialogActions>
      </Dialog>
    </AppConfirmDialogContext.Provider>
  );
}

export function useAppConfirmDialogContext() {
  const context = useContext(AppConfirmDialogContext);

  if (!context) {
    throw new Error(
      "useAppConfirmDialogContext must be used inside AppConfirmDialogProvider."
    );
  }

  return context;
}

export default AppConfirmDialogProvider;