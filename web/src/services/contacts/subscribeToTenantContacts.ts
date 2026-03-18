import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { COLLECTIONS } from "../../constants/collections";
import type { Contact } from "../../types/contact";

type SubscribeToTenantContactsParams = {
  tenantId: string;
  onData: (contacts: Contact[]) => void;
  onError?: (error: Error) => void;
};

export function subscribeToTenantContacts({
  tenantId,
  onData,
  onError,
}: SubscribeToTenantContactsParams): () => void {
  const contactsQuery = query(
    collection(db, COLLECTIONS.contacts),
    where("tenantId", "==", tenantId)
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