import { Router, type IRouter } from "express";
import { db, videosTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CreateVideoBody, UpdateVideoBody, GetVideoParams, UpdateVideoParams, DeleteVideoParams } from "@workspace/api-zod";

const router: IRouter = Router();

function serializeVideo(v: typeof videosTable.$inferSelect) {
  return {
    ...v,
    scheduledDate: v.scheduledDate ?? null,
    publishedDate: v.publishedDate ?? null,
    folderLink: v.folderLink ?? null,
    platform: v.platform ?? null,
    tags: v.tags ?? null,
    views: v.views ?? 0,
    likes: v.likes ?? 0,
    comments: v.comments ?? 0,
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
  };
}

router.get("/videos", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = req.user.id;
  const videos = await db.select().from(videosTable)
    .where(eq(videosTable.userId, userId))
    .orderBy(videosTable.createdAt);
  res.json(videos.map(serializeVideo));
});

router.post("/videos", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = req.user.id;
  const body = CreateVideoBody.parse(req.body);
  const videoType = req.body.videoType ?? null;
  const [video] = await db.insert(videosTable).values({
    userId,
    title: body.title,
    description: body.description,
    status: body.status,
    videoType,
    scheduledDate: body.scheduledDate ?? null,
    folderLink: body.folderLink ?? null,
    platform: body.platform ?? null,
    tags: body.tags ?? null,
  }).returning();
  res.status(201).json(serializeVideo(video));
});

router.get("/videos/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = req.user.id;
  const { id } = GetVideoParams.parse({ id: Number(req.params.id) });
  const [video] = await db.select().from(videosTable)
    .where(and(eq(videosTable.id, id), eq(videosTable.userId, userId)));
  if (!video) return res.status(404).json({ error: "Video not found" });
  res.json(serializeVideo(video));
});

router.put("/videos/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = req.user.id;
  const { id } = UpdateVideoParams.parse({ id: Number(req.params.id) });
  const body = UpdateVideoBody.parse(req.body);
  const videoType = req.body.videoType !== undefined ? (req.body.videoType ?? null) : undefined;
  const [video] = await db.update(videosTable)
    .set({ ...body, ...(videoType !== undefined ? { videoType } : {}), updatedAt: new Date() })
    .where(and(eq(videosTable.id, id), eq(videosTable.userId, userId)))
    .returning();
  if (!video) return res.status(404).json({ error: "Video not found" });
  res.json(serializeVideo(video));
});

router.delete("/videos/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = req.user.id;
  const { id } = DeleteVideoParams.parse({ id: Number(req.params.id) });
  await db.delete(videosTable)
    .where(and(eq(videosTable.id, id), eq(videosTable.userId, userId)));
  res.status(204).send();
});

export default router;
