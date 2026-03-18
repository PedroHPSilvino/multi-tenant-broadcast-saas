import { Timestamp } from "firebase/firestore";

export type Tenant = {
  id: string;
  name: string;
  ownerUserId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};