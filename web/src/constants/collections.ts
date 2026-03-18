export const COLLECTIONS = {
  tenants: "tenants",
  memberships: "memberships",
  connections: "connections",
  contacts: "contacts",
  messages: "messages",
} as const;

export type CollectionKey = keyof typeof COLLECTIONS;
export type CollectionName = (typeof COLLECTIONS)[CollectionKey];