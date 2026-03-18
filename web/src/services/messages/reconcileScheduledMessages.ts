import {
  collection,
  doc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { COLLECTIONS } from "../../constants/collections";
import { MESSAGE_STATUSES } from "../../constants/message-statuses";
import { db } from "../../lib/firebase";

type ReconcileScheduledMessagesParams = {
  tenantId: string;
  connectionId: string;
};

export async function reconcileScheduledMessages({
  tenantId,
  connectionId,
}: ReconcileScheduledMessagesParams): Promise<void> {
  const now = Timestamp.now();

  const messagesQuery = query(
    collection(db, COLLECTIONS.messages),
    where("tenantId", "==", tenantId),
    where("connectionId", "==", connectionId),
    where("status", "==", MESSAGE_STATUSES.scheduled)
  );

  const snapshot = await getDocs(messagesQuery);

  const updatePromises = snapshot.docs
    .filter((document) => {
      const data = document.data();
      const scheduledAt = data.scheduledAt as Timestamp | null;

      if (!scheduledAt) {
        return false;
      }

      return scheduledAt.toMillis() <= now.toMillis();
    })
    .map((document) =>
      updateDoc(doc(db, COLLECTIONS.messages, document.id), {
        status: MESSAGE_STATUSES.sent,
        sentAt: now,
        updatedAt: now,
      })
    );

  await Promise.all(updatePromises);
}