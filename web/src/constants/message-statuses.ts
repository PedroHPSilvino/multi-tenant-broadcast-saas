export const MESSAGE_STATUSES = {
  draft: "draft",
  scheduled: "scheduled",
  sent: "sent",
} as const;

export type MessageStatus =
  (typeof MESSAGE_STATUSES)[keyof typeof MESSAGE_STATUSES];