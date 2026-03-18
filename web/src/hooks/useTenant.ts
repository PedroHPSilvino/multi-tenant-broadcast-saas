import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { getMembershipByUserId } from "../services/memberships/getMembershipByUserId";
import type { Membership } from "../types/membership";

type TenantState = {
  tenantId: string | null;
  membership: Membership | null;
  loading: boolean;
  error: string | null;
};

export function useTenant(): TenantState {
  const { user, loading: authLoading } = useAuth();
  const [membership, setMembership] = useState<Membership | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMembership() {
      if (authLoading) {
        return;
      }

      if (!user) {
        setMembership(null);
        setTenantId(null);
        setError(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const membershipResult = await getMembershipByUserId({
          userId: user.uid,
        });

        if (!membershipResult) {
          setMembership(null);
          setTenantId(null);
          setError("Membership not found for current user.");
          setLoading(false);
          return;
        }

        setMembership(membershipResult);
        setTenantId(membershipResult.tenantId);
      } catch (tenantError) {
        console.error("Failed to load tenant membership", tenantError);
        setMembership(null);
        setTenantId(null);
        setError("Failed to load tenant membership.");
      } finally {
        setLoading(false);
      }
    }

    loadMembership();
  }, [user, authLoading]);

  return {
    tenantId,
    membership,
    loading,
    error,
  };
}