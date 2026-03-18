import { doc, Timestamp, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { COLLECTIONS } from "../../constants/collections";

type UpdateContactParams = {
  contactId: string;
  name: string;
  phone: string;
};

export async function updateContact({
  contactId,
  name,
  phone,
}: UpdateContactParams): Promise<void> {
  const trimmedName = name.trim();
  const trimmedPhone = phone.trim();

  if (!trimmedName) {
    throw new Error("Contact name is required.");
  }

  if (!trimmedPhone) {
    throw new Error("Contact phone is required.");
  }

  await updateDoc(doc(db, COLLECTIONS.contacts, contactId), {
    name: trimmedName,
    phone: trimmedPhone,
    updatedAt: Timestamp.now(),
  });
}