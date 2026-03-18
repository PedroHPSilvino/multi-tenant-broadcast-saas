import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { COLLECTIONS } from "../../constants/collections";
import type { MessageStatus } from "../../constants/message-statuses";
import { db } from "../../lib/firebase";
import type { Message } from "../../types/message";

type SubscribeToMessagesParams = {
  tenantId: string;
  connectionId: string;
  status?: MessageStatus;
  onData: (messages: Message[]) => void;
  onError?: (error: Error) => void;
};

export function subscribeToMessages({
  tenantId,
  connectionId,
  status,
  onData,
  onError,
}: SubscribeToMessagesParams): () => void {
  const constraints = [
    where("tenantId", "==", tenantId),
    where("connectionId", "==", connectionId),
    orderBy("createdAt", "desc"),
  ];

  if (status) {
    constraints.splice(2, 0, where("status", "==", status));
  }

  const messagesQuery = query(
    collection(db, COLLECTIONS.messages),
    ...constraints
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