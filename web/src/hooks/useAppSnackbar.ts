import { useAppSnackbarContext } from "../app/AppSnackbarProvider";

export function useAppSnackbar() {
  return useAppSnackbarContext();
}