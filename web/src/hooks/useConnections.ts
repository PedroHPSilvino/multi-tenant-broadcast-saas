import { useEffect, useState } from "react";
import type { Connection } from "../types/connection";
import { subscribeToConnections } from "../services/connections/subscribeToConnections";

type UseConnectionsParams = {
  tenantId: string | null;
};

type UseConnectionsResult = {
  connections: Connection[];
  loading: boolean;
  error: string | null;
};

export function useConnections({
  tenantId,
}: UseConnectionsParams): UseConnectionsResult {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) {
      setConnections([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToConnections({
      tenantId,
      onData: (nextConnections) => {
        setConnections(nextConnections);
        setLoading(false);
      },
      onError: (nextError) => {
        console.error(nextError);
        setError("Failed to load connections.");
        setLoading(false);
      },
    });

    return () => unsubscribe();
  }, [tenantId]);

  return {
    connections,
    loading,
    error,
  };
}