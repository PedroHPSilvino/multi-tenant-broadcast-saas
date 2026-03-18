import type { ReactNode } from "react";
import { useTenant } from "../hooks/useTenant";

type Props = {
  children: ReactNode;
};

function TenantRoute({ children }: Props) {
  const { tenantId, loading, error } = useTenant();

  if (loading) {
    return <div className="p-6">Loading tenant...</div>;
  }

  if (error || !tenantId) {
    return (
      <div className="p-6">
        <h1 className="text-lg font-semibold">Tenant not available</h1>
        <p className="mt-2 text-sm text-slate-600">
          The current user does not have a valid tenant membership yet.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

export default TenantRoute;