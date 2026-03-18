import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { COLLECTIONS } from "../../constants/collections";

type CreateContactParams = {
  tenantId: string;
  connectionId: string;
  name: string;
  phone: string;
  userId: string;
};

export async function createContact({
  tenantId,
  connectionId,
  name,
  phone,
  userId,
}: CreateContactParams): Promise<void> {
  const trimmedName = name.trim();
  const trimmedPhone = phone.trim();

  if (!trimmedName) {
    throw new Error("Contact name is required.");
  }

  if (!trimmedPhone) {
    throw new Error("Contact phone is required.");
  }

  const now = Timestamp.now();

  await addDoc(collection(db, COLLECTIONS.contacts), {
    tenantId,
    connectionId,
    name: trimmedName,
    phone: trimmedPhone,
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
  });
}