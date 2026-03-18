export type ID = string;

export type TimestampValue = Date; // keep simple for now

export type Nullable<T> = T | null;

export interface BaseEntity {
  id: ID;
  createdAt: TimestampValue;
  updatedAt: TimestampValue;
}