import type { BaseEntity, ID, Nullable } from "./common";
import type { MessageStatus } from "../constants/message-statuses";

export interface Message extends BaseEntity {
  tenantId: ID;
  connectionId: ID;
  content: string;
  contactIds: ID[];
  status: MessageStatus;
  scheduledAt: Nullable<Date>;
  sentAt: Nullable<Date>;
  createdBy: ID;
}