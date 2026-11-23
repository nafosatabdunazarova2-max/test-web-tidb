import { integer, jsonb, pgTable, timestamp } from "drizzle-orm/pg-core";

export const records = pgTable("records", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  data: jsonb().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
