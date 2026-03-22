import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const shootsTable = pgTable("shoots", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  title: text("title").notNull(),
  description: text("description"),
  shootDate: text("shoot_date").notNull(),
  location: text("location"),
  status: text("status").notNull().default("scheduled"),
  videoId: integer("video_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertShootSchema = createInsertSchema(shootsTable).omit({ id: true, createdAt: true });
export type InsertShoot = z.infer<typeof insertShootSchema>;
export type Shoot = typeof shootsTable.$inferSelect;
