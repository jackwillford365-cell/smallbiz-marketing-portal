import { Router, type IRouter } from "express";
import { db, approvalsTable, videosTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CreateApprovalBody, UpdateApprovalBody, UpdateApprovalParams } from "@workspace/api-zod";

const router: IRouter = Router();

function serializeApproval(a: typeof approvalsTable.$inferSelect, videoTitle: string) {
  return {
    ...a,
    videoTitle,
    reviewerName: a.reviewerName ?? null,
    comments: a.comments ?? null,
    submittedAt: a.submittedAt.toISOString(),
    reviewedAt: a.reviewedAt ? a.reviewedAt.toISOString() : null,
  };
}

router.get("/approvals", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = req.user.id;
  const approvals = await db.select().from(approvalsTable)
    .where(eq(approvalsTable.userId, userId))
    .orderBy(approvalsTable.submittedAt);

  const results = await Promise.all(
    approvals.map(async (a) => {
      const [video] = await db.select({ title: videosTable.title }).from(videosTable).where(eq(videosTable.id, a.videoId));
      return serializeApproval(a, video?.title ?? "Unknown");
    })
  );
  res.json(results);
});

router.post("/approvals", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = req.user.id;
  const body = CreateApprovalBody.parse(req.body);
  const [video] = await db.select({ title: videosTable.title }).from(videosTable)
    .where(and(eq(videosTable.id, body.videoId), eq(videosTable.userId, userId)));
  if (!video) return res.status(404).json({ error: "Video not found" });

  const [approval] = await db.insert(approvalsTable).values({
    userId,
    videoId: body.videoId,
    status: "pending",
    comments: body.comments ?? null,
  }).returning();

  res.status(201).json(serializeApproval(approval, video.title));
});

router.put("/approvals/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = req.user.id;
  const { id } = UpdateApprovalParams.parse({ id: Number(req.params.id) });
  const body = UpdateApprovalBody.parse(req.body);

  const [approval] = await db.update(approvalsTable)
    .set({
      status: body.status,
      reviewerName: body.reviewerName ?? null,
      comments: body.comments ?? null,
      reviewedAt: new Date(),
    })
    .where(and(eq(approvalsTable.id, id), eq(approvalsTable.userId, userId)))
    .returning();
  if (!approval) return res.status(404).json({ error: "Approval not found" });

  const [video] = await db.select({ title: videosTable.title }).from(videosTable).where(eq(videosTable.id, approval.videoId));
  res.json(serializeApproval(approval, video?.title ?? "Unknown"));
});

export default router;
