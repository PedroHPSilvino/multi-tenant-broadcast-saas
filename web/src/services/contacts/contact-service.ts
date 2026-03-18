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
import type { Contact } from "../../types/contact";

interface CreateContactInput {
  tenantId: string;
  connectionId: string;
  name: string;
  phone: string;
  createdBy: string;
}

interface UpdateContactInput {
  contactId: string;
  name: string;
  phone: string;
}

export const createContact = async ({
  tenantId,
  connectionId,
  name,
  phone,
  createdBy,
}: CreateContactInput) => {
  const contactReference = await addDoc(collection(db, COLLECTIONS.contacts), {
    tenantId,
    connectionId,
    name: name.trim(),
    phone: phone.trim(),
    createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return contactReference.id;
};

export const subscribeToContacts = (
  tenantId: string,
  connectionId: string,
  callback: (contacts: Contact[]) => void
): Unsubscribe => {
  const contactsQuery = query(
    collection(db, COLLECTIONS.contacts),
    where("tenantId", "==", tenantId),
    where("connectionId", "==", connectionId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(contactsQuery, (snapshot) => {
    const contacts = snapshot.docs.map((documentSnapshot) => {
      const data = documentSnapshot.data();

      return {
        id: documentSnapshot.id,
        tenantId: data.tenantId,
        connectionId: data.connectionId,
        name: data.name,
        phone: data.phone,
        createdBy: data.createdBy,
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
        updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
      } satisfies Contact;
    });

    callback(contacts);
  });
};

export const updateContact = async ({
  contactId,
  name,
  phone,
}: UpdateContactInput) => {
  await updateDoc(doc(db, COLLECTIONS.contacts, contactId), {
    name: name.trim(),
    phone: phone.trim(),
    updatedAt: serverTimestamp(),
  });
};

export const deleteContact = async (contactId: string) => {
  await deleteDoc(doc(db, COLLECTIONS.contacts, contactId));
};