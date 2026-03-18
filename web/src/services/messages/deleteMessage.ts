import { deleteDoc, doc } from "firebase/firestore";
import { COLLECTIONS } from "../../constants/collections";
import { db } from "../../lib/firebase";

type DeleteMessageParams = {
  messageId: string;
};

export async function deleteMessage({
  messageId,
}: DeleteMessageParams): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.messages, messageId));
}