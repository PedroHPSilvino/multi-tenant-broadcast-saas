import { useEffect, useState } from "react";
import type { Contact } from "../types/contact";
import { subscribeToContacts } from "../services/contacts/subscribeToContacts";

type UseContactsParams = {
  tenantId: string | null;
  connectionId: string | null;
};

type UseContactsResult = {
  contacts: Contact[];
  loading: boolean;
  error: string | null;
};

export function useContacts({
  tenantId,
  connectionId,
}: UseContactsParams): UseContactsResult {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId || !connectionId) {
      setContacts([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToContacts({
      tenantId,
      connectionId,
      onData: (nextContacts) => {
        setContacts(nextContacts);
        setLoading(false);
      },
      onError: (nextError) => {
        console.error(nextError);
        setError("Failed to load contacts.");
        setLoading(false);
      },
    });

    return () => unsubscribe();
  }, [tenantId, connectionId]);

  return {
    contacts,
    loading,
    error,
  };
}