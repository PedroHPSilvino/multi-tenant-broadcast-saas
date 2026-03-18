import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { COLLECTIONS } from "../../constants/collections";

type DeleteContactParams = {
  contactId: string;
};

export async function deleteContact({
  contactId,
}: DeleteContactParams): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.contacts, contactId));
}