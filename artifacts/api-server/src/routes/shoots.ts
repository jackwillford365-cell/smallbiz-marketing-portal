import { Router, type IRouter } from "express";
import { db, shootsTable, videosTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CreateShootBody, UpdateShootBody, UpdateShootParams, DeleteShootParams } from "@workspace/api-zod";

const router: IRouter = Router();

async function getVideoTitle(videoId: number | null): Promise<string | null> {
  if (!videoId) return null;
  const [v] = await db.select({ title: videosTable.title }).from(videosTable).where(eq(videosTable.id, videoId));
  return v?.title ?? null;
}

function serializeShoot(s: typeof shootsTable.$inferSelect, videoTitle: string | null) {
  return {
    ...s,
    description: s.description ?? null,
    location: s.location ?? null,
    videoId: s.videoId ?? null,
    videoTitle,
    notes: s.notes ?? null,
    createdAt: s.createdAt.toISOString(),
  };
}

router.get("/shoots", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = req.user.id;
  const shoots = await db.select().from(shootsTable)
    .where(eq(shootsTable.userId, userId))
    .orderBy(shootsTable.shootDate);

  const results = await Promise.all(
    shoots.map(async (s) => serializeShoot(s, await getVideoTitle(s.videoId)))
  );
  res.json(results);
});

router.post("/shoots", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = req.user.id;
  const body = CreateShootBody.parse(req.body);
  const [shoot] = await db.insert(shootsTable).values({
    userId,
    title: body.title,
    description: body.description ?? null,
    shootDate: body.shootDate,
    location: body.location ?? null,
    status: body.status,
    videoId: body.videoId ?? null,
    notes: body.notes ?? null,
  }).returning();

  res.status(201).json(serializeShoot(shoot, await getVideoTitle(shoot.videoId)));
});

router.put("/shoots/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = req.user.id;
  const { id } = UpdateShootParams.parse({ id: Number(req.params.id) });
  const body = UpdateShootBody.parse(req.body);
  const [shoot] = await db.update(shootsTable)
    .set({ ...body, videoId: body.videoId ?? null })
    .where(and(eq(shootsTable.id, id), eq(shootsTable.userId, userId)))
    .returning();
  if (!shoot) return res.status(404).json({ error: "Shoot not found" });
  res.json(serializeShoot(shoot, await getVideoTitle(shoot.videoId)));
});

router.delete("/shoots/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = req.user.id;
  const { id } = DeleteShootParams.parse({ id: Number(req.params.id) });
  await db.delete(shootsTable)
    .where(and(eq(shootsTable.id, id), eq(shootsTable.userId, userId)));
  res.status(204).send();
});

export default router;
