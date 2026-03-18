import { doc, Timestamp, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { COLLECTIONS } from "../../constants/collections";

type UpdateConnectionParams = {
  connectionId: string;
  name: string;
};

export async function updateConnection({
  connectionId,
  name,
}: UpdateConnectionParams): Promise<void> {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error("Connection name is required.");
  }

  await updateDoc(doc(db, COLLECTIONS.connections, connectionId), {
    name: trimmedName,
    updatedAt: Timestamp.now(),
  });
}