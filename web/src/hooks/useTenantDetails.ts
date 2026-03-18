import { useEffect, useState } from "react";
import { subscribeToTenant } from "../services/tenants/subscribeToTenant";
import type { Tenant } from "../types/tenant";

type UseTenantDetailsParams = {
  tenantId: string | null;
};

type UseTenantDetailsResult = {
  tenant: Tenant | null;
  loading: boolean;
  error: string | null;
};

export function useTenantDetails({
  tenantId,
}: UseTenantDetailsParams): UseTenantDetailsResult {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) {
      setTenant(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToTenant({
      tenantId,
      onData: (nextTenant) => {
        setTenant(nextTenant);
        setLoading(false);
      },
      onError: (nextError) => {
        console.error(nextError);
        setError("Failed to load tenant details.");
        setLoading(false);
      },
    });

    return () => unsubscribe();
  }, [tenantId]);

  return {
    tenant,
    loading,
    error,
  };
}