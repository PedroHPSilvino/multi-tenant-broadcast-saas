import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { COLLECTIONS } from "../../constants/collections";

type CreateConnectionParams = {
  tenantId: string;
  name: string;
  userId: string;
};

export async function createConnection({
  tenantId,
  name,
  userId,
}: CreateConnectionParams): Promise<void> {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error("Connection name is required.");
  }

  const now = Timestamp.now();

  await addDoc(collection(db, COLLECTIONS.connections), {
    tenantId,
    name: trimmedName,
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
  });
}