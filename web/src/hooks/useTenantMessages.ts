import { useEffect, useState } from "react";
import type { Message } from "../types/message";
import { subscribeToTenantMessages } from "../services/messages/subscribeToTenantMessages";

type UseTenantMessagesParams = {
  tenantId: string | null;
};

type UseTenantMessagesResult = {
  messages: Message[];
  loading: boolean;
  error: string | null;
};

export function useTenantMessages({
  tenantId,
}: UseTenantMessagesParams): UseTenantMessagesResult {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) {
      setMessages([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToTenantMessages({
      tenantId,
      onData: (nextMessages) => {
        setMessages(nextMessages);
        setLoading(false);
      },
      onError: (nextError) => {
        console.error(nextError);
        setError("Failed to load tenant messages.");
        setLoading(false);
      },
    });

    return () => unsubscribe();
  }, [tenantId]);

  return {
    messages,
    loading,
    error,
  };
}