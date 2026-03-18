import React from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline, ThemeProvider } from "@mui/material";
import App from "./App";
import "./index.css";
import { appTheme } from "./theme/theme";
import AppSnackbarProvider from "./app/AppSnackbarProvider";
import AppConfirmDialogProvider from "./app/AppConfirmDialogProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <AppSnackbarProvider>
        <AppConfirmDialogProvider>
          <App />
        </AppConfirmDialogProvider>
      </AppSnackbarProvider>
    </ThemeProvider>
  </React.StrictMode>
);