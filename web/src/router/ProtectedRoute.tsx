import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../constants/routes";

type Props = {
  children: React.ReactNode;
};

function ProtectedRoute({ children }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!user) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;