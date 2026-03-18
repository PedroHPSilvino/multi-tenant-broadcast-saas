import { addDoc, collection, Timestamp } from "firebase/firestore";
import { COLLECTIONS } from "../../constants/collections";
import { MESSAGE_STATUSES } from "../../constants/message-statuses";
import { db } from "../../lib/firebase";

type CreateMessageParams = {
  tenantId: string;
  connectionId: string;
  content: string;
  contactIds: string[];
  scheduledAt: Date | null;
  userId: string;
};

export async function createMessage({
  tenantId,
  connectionId,
  content,
  contactIds,
  scheduledAt,
  userId,
}: CreateMessageParams): Promise<void> {
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    throw new Error("Message content is required.");
  }

  if (!connectionId) {
    throw new Error("Connection is required.");
  }

  if (contactIds.length === 0) {
    throw new Error("At least one contact must be selected.");
  }

  const now = Timestamp.now();
  const isScheduled = scheduledAt !== null;

  await addDoc(collection(db, COLLECTIONS.messages), {
    tenantId,
    connectionId,
    content: trimmedContent,
    contactIds,
    scheduledAt: scheduledAt ? Timestamp.fromDate(scheduledAt) : null,
    status: isScheduled ? MESSAGE_STATUSES.scheduled : MESSAGE_STATUSES.sent,
    sentAt: isScheduled ? null : now,
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
  });
}