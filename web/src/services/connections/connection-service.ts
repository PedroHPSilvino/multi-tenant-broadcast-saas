import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { COLLECTIONS } from "../../constants/collections";
import type { Connection } from "../../types/connection";

interface CreateConnectionInput {
  tenantId: string;
  name: string;
  createdBy: string;
}

interface UpdateConnectionInput {
  connectionId: string;
  name: string;
}

export const createConnection = async ({
  tenantId,
  name,
  createdBy,
}: CreateConnectionInput) => {
  const connectionReference = await addDoc(collection(db, COLLECTIONS.connections), {
    tenantId,
    name: name.trim(),
    createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return connectionReference.id;
};

export const subscribeToConnections = (
  tenantId: string,
  callback: (connections: Connection[]) => void
): Unsubscribe => {
  const connectionsQuery = query(
    collection(db, COLLECTIONS.connections),
    where("tenantId", "==", tenantId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(connectionsQuery, (snapshot) => {
    const connections = snapshot.docs.map((documentSnapshot) => {
      const data = documentSnapshot.data();

      return {
        id: documentSnapshot.id,
        tenantId: data.tenantId,
        name: data.name,
        createdBy: data.createdBy,
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
        updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
      } satisfies Connection;
    });

    callback(connections);
  });
};

export const updateConnection = async ({
  connectionId,
  name,
}: UpdateConnectionInput) => {
  await updateDoc(doc(db, COLLECTIONS.connections, connectionId), {
    name: name.trim(),
    updatedAt: serverTimestamp(),
  });
};

export const deleteConnection = async (connectionId: string) => {
  await deleteDoc(doc(db, COLLECTIONS.connections, connectionId));
};