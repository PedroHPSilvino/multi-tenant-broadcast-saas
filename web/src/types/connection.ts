import type { BaseEntity, ID } from "./common";

export interface Connection extends BaseEntity {
  tenantId: ID;
  name: string;
  createdBy: ID;
}