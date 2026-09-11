import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const reportsTable = pgTable("reports", {
  id: text("id").primaryKey(),
  typeId: text("type_id").notNull(),
  date: text("date").notNull(),
  location: text("location"),
  summary: text("summary").notNull(),
  evidence: text("evidence"),
  status: text("status").notNull().default("Received"),
  priority: text("priority").notNull().default("Standard"),
  actionNote: text("action_note"),
  nextStep: text("next_step"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
