import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { COLLECTIONS } from "../../constants/collections";

type DeleteConnectionParams = {
  connectionId: string;
};

export async function deleteConnection({
  connectionId,
}: DeleteConnectionParams): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.connections, connectionId));
}