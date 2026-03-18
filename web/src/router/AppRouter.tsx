import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ROUTES } from "../constants/routes";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import ConnectionsPage from "../pages/connections/ConnectionsPage";
import ContactsPage from "../pages/contacts/ContactsPage";
import MessagesPage from "../pages/messages/MessagesPage";

import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import TenantRoute from "./TenantRoute";
import AppLayout from "../layouts/AppLayout";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path={ROUTES.login}
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        <Route
          path={ROUTES.register}
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        <Route
          path={ROUTES.dashboard}
          element={
            <ProtectedRoute>
              <TenantRoute>
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              </TenantRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.connections}
          element={
            <ProtectedRoute>
              <TenantRoute>
                <AppLayout>
                  <ConnectionsPage />
                </AppLayout>
              </TenantRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.contacts}
          element={
            <ProtectedRoute>
              <TenantRoute>
                <AppLayout>
                  <ContactsPage />
                </AppLayout>
              </TenantRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.messages}
          element={
            <ProtectedRoute>
              <TenantRoute>
                <AppLayout>
                  <MessagesPage />
                </AppLayout>
              </TenantRoute>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to={ROUTES.dashboard} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;