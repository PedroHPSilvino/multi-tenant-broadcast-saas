import { doc, Timestamp, updateDoc } from "firebase/firestore";
import { MESSAGE_STATUSES } from "../../constants/message-statuses";
import { COLLECTIONS } from "../../constants/collections";
import { db } from "../../lib/firebase";

type UpdateMessageParams = {
  messageId: string;
  content: string;
  contactIds: string[];
  scheduledAt: Date | null;
};

export async function updateMessage({
  messageId,
  content,
  contactIds,
  scheduledAt,
}: UpdateMessageParams): Promise<void> {
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    throw new Error("Message content is required.");
  }

  if (contactIds.length === 0) {
    throw new Error("At least one contact must be selected.");
  }

  const isScheduled = scheduledAt !== null;

  await updateDoc(doc(db, COLLECTIONS.messages, messageId), {
    content: trimmedContent,
    contactIds,
    scheduledAt: scheduledAt ? Timestamp.fromDate(scheduledAt) : null,
    status: isScheduled ? MESSAGE_STATUSES.scheduled : MESSAGE_STATUSES.sent,
    sentAt: isScheduled ? null : Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}