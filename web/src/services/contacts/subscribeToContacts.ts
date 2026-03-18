import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { COLLECTIONS } from "../../constants/collections";
import type { Contact } from "../../types/contact";

type SubscribeToContactsParams = {
  tenantId: string;
  connectionId: string;
  onData: (contacts: Contact[]) => void;
  onError?: (error: Error) => void;
};

export function subscribeToContacts({
  tenantId,
  connectionId,
  onData,
  onError,
}: SubscribeToContactsParams): () => void {
  const contactsQuery = query(
    collection(db, COLLECTIONS.contacts),
    where("tenantId", "==", tenantId),
    where("connectionId", "==", connectionId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    contactsQuery,
    (snapshot) => {
      const contacts: Contact[] = snapshot.docs.map((document) => ({
        id: document.id,
        ...(document.data() as Omit<Contact, "id">),
      }));

      onData(contacts);
    },
    (firestoreError) => {
      if (onError) {
        onError(firestoreError);
      }
    }
  );
}