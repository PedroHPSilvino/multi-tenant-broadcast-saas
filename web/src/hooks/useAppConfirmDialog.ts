import { useAppConfirmDialogContext } from "../app/AppConfirmDialogProvider";

export function useAppConfirmDialog() {
  return useAppConfirmDialogContext();
}