import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { COLLECTIONS } from "../../constants/collections";
import type { Connection } from "../../types/connection";

type SubscribeToConnectionsParams = {
  tenantId: string;
  onData: (connections: Connection[]) => void;
  onError?: (error: Error) => void;
};

export function subscribeToConnections({
  tenantId,
  onData,
  onError,
}: SubscribeToConnectionsParams): () => void {
  const connectionsQuery = query(
    collection(db, COLLECTIONS.connections),
    where("tenantId", "==", tenantId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    connectionsQuery,
    (snapshot) => {
      const connections: Connection[] = snapshot.docs.map((document) => ({
        id: document.id,
        ...(document.data() as Omit<Connection, "id">),
      }));

      onData(connections);
    },
    (firestoreError) => {
      if (onError) {
        onError(firestoreError);
      }
    }
  );
}