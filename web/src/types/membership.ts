import type { ID, TimestampValue } from "./common";
import type { MembershipRole } from "../constants/membership-roles";

export interface Membership {
  id: ID;
  tenantId: ID;
  userId: ID;
  role: MembershipRole;
  createdAt: TimestampValue;
}