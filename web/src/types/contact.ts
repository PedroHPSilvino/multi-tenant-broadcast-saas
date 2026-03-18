import type { BaseEntity, ID } from "./common";

export interface Contact extends BaseEntity {
  tenantId: ID;
  connectionId: ID;
  name: string;
  phone: string;
  createdBy: ID;
}