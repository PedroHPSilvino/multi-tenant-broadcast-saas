import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { COLLECTIONS } from "../../constants/collections";
import type { Message } from "../../types/message";

type SubscribeToTenantMessagesParams = {
  tenantId: string;
  onData: (messages: Message[]) => void;
  onError?: (error: Error) => void;
};

export function subscribeToTenantMessages({
  tenantId,
  onData,
  onError,
}: SubscribeToTenantMessagesParams): () => void {
  const messagesQuery = query(
    collection(db, COLLECTIONS.messages),
    where("tenantId", "==", tenantId)
  );

  return onSnapshot(
    messagesQuery,
    (snapshot) => {
      const messages: Message[] = snapshot.docs.map((document) => ({
        id: document.id,
        ...(document.data() as Omit<Message, "id">),
      }));

      onData(messages);
    },
    (firestoreError) => {
      if (onError) {
        onError(firestoreError);
      }
    }
  );
}