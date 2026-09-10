import { createInsertSchema } from "drizzle-zod";
import { date, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const safeReportsTable = pgTable("safe_reports", {
  id: text("id").primaryKey(),
  trackingId: text("tracking_id").notNull().unique(),
  typeId: text("type_id").notNull(),
  incidentDate: date("incident_date", { mode: "string" }).notNull(),
  location: text("location").notNull().default(""),
  summary: text("summary").notNull(),
  evidence: text("evidence").notNull().default(""),
  language: text("language").notNull().default("en"),
  status: text("status").notNull().default("Received"),
  priority: text("priority").notNull().default("Standard"),
  actionNote: text("action_note").notNull(),
  nextStep: text("next_step").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertSafeReportSchema = createInsertSchema(safeReportsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSafeReport = z.infer<typeof insertSafeReportSchema>;
export type SafeReport = typeof safeReportsTable.$inferSelect;