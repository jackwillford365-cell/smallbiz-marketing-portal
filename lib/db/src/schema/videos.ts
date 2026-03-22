import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const videosTable = pgTable("videos", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("planning"),
  videoType: text("video_type"),
  scheduledDate: text("scheduled_date"),
  publishedDate: text("published_date"),
  folderLink: text("folder_link"),
  platform: text("platform"),
  tags: text("tags"),
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertVideoSchema = createInsertSchema(videosTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videosTable.$inferSelect;
