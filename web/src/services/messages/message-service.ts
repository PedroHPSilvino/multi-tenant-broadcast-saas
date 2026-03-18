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
import { MESSAGE_STATUSES } from "../../constants/message-statuses";
import type { Message } from "../../types/message";

interface CreateMessageInput {
  tenantId: string;
  connectionId: string;
  content: string;
  contactIds: string[];
  status?: Message["status"];
  scheduledAt?: Date | null;
  createdBy: string;
}

interface UpdateMessageInput {
  messageId: string;
  content: string;
  contactIds: string[];
  status: Message["status"];
  scheduledAt: Date | null;
}

export const createMessage = async ({
  tenantId,
  connectionId,
  content,
  contactIds,
  status = MESSAGE_STATUSES.draft,
  scheduledAt = null,
  createdBy,
}: CreateMessageInput) => {
  const messageReference = await addDoc(collection(db, COLLECTIONS.messages), {
    tenantId,
    connectionId,
    content: content.trim(),
    contactIds,
    status,
    scheduledAt,
    sentAt: status === MESSAGE_STATUSES.sent ? serverTimestamp() : null,
    createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return messageReference.id;
};

export const subscribeToMessages = (
  tenantId: string,
  connectionId: string,
  callback: (messages: Message[]) => void
): Unsubscribe => {
  const messagesQuery = query(
    collection(db, COLLECTIONS.messages),
    where("tenantId", "==", tenantId),
    where("connectionId", "==", connectionId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(messagesQuery, (snapshot) => {
    const messages = snapshot.docs.map((documentSnapshot) => {
      const data = documentSnapshot.data();

      return {
        id: documentSnapshot.id,
        tenantId: data.tenantId,
        connectionId: data.connectionId,
        content: data.content,
        contactIds: data.contactIds ?? [],
        status: data.status,
        scheduledAt: data.scheduledAt?.toDate?.() ?? null,
        sentAt: data.sentAt?.toDate?.() ?? null,
        createdBy: data.createdBy,
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
        updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
      } satisfies Message;
    });

    callback(messages);
  });
};

export const updateMessage = async ({
  messageId,
  content,
  contactIds,
  status,
  scheduledAt,
}: UpdateMessageInput) => {
  await updateDoc(doc(db, COLLECTIONS.messages, messageId), {
    content: content.trim(),
    contactIds,
    status,
    scheduledAt,
    sentAt: status === MESSAGE_STATUSES.sent ? serverTimestamp() : null,
    updatedAt: serverTimestamp(),
  });
};

export const deleteMessage = async (messageId: string) => {
  await deleteDoc(doc(db, COLLECTIONS.messages, messageId));
};