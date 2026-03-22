import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const approvalsTable = pgTable("approvals", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  videoId: integer("video_id").notNull(),
  status: text("status").notNull().default("pending"),
  reviewerName: text("reviewer_name"),
  comments: text("comments"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
});

export const insertApprovalSchema = createInsertSchema(approvalsTable).omit({ id: true, submittedAt: true });
export type InsertApproval = z.infer<typeof insertApprovalSchema>;
export type Approval = typeof approvalsTable.$inferSelect;
