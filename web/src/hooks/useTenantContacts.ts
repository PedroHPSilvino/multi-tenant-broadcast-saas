import { useEffect, useState } from "react";
import type { Contact } from "../types/contact";
import { subscribeToTenantContacts } from "../services/contacts/subscribeToTenantContacts";

type UseTenantContactsParams = {
  tenantId: string | null;
};

type UseTenantContactsResult = {
  contacts: Contact[];
  loading: boolean;
  error: string | null;
};

export function useTenantContacts({
  tenantId,
}: UseTenantContactsParams): UseTenantContactsResult {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) {
      setContacts([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToTenantContacts({
      tenantId,
      onData: (nextContacts) => {
        setContacts(nextContacts);
        setLoading(false);
      },
      onError: (nextError) => {
        console.error(nextError);
        setError("Failed to load tenant contacts.");
        setLoading(false);
      },
    });

    return () => unsubscribe();
  }, [tenantId]);

  return {
    contacts,
    loading,
    error,
  };
}