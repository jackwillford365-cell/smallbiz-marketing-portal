import { Router, type IRouter } from "express";
import { db, videosTable, shootsTable, approvalsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/analytics", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = req.user.id;

  const [videosResult, shootsResult, approvalsResult] = await Promise.all([
    db.select().from(videosTable).where(eq(videosTable.userId, userId)),
    db.select().from(shootsTable).where(eq(shootsTable.userId, userId)),
    db.select().from(approvalsTable).where(eq(approvalsTable.userId, userId)),
  ]);

  const totalVideos = videosResult.length;
  const publishedVideos = videosResult.filter(v => v.status === "published").length;
  const pendingApprovals = approvalsResult.filter(a => a.status === "pending").length;

  const now = new Date();
  const upcomingShoots = shootsResult.filter(s => {
    return s.status === "scheduled" && new Date(s.shootDate) >= now;
  }).length;

  const totalViews = videosResult.reduce((sum, v) => sum + (v.views ?? 0), 0);
  const totalLikes = videosResult.reduce((sum, v) => sum + (v.likes ?? 0), 0);
  const totalComments = videosResult.reduce((sum, v) => sum + (v.comments ?? 0), 0);

  const statusCounts: Record<string, number> = {};
  for (const v of videosResult) {
    statusCounts[v.status] = (statusCounts[v.status] || 0) + 1;
  }
  const videosByStatus = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

  const monthlyData: Record<string, { views: number; likes: number }> = {};
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = months[d.getMonth()];
    monthlyData[key] = { views: 0, likes: 0 };
  }
  for (const v of videosResult) {
    if (v.publishedDate) {
      const month = months[new Date(v.publishedDate).getMonth()];
      if (monthlyData[month]) {
        monthlyData[month].views += v.views ?? 0;
        monthlyData[month].likes += v.likes ?? 0;
      }
    }
  }
  const viewsByMonth = Object.entries(monthlyData).map(([month, data]) => ({ month, ...data }));

  const recentVideos = videosResult
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)
    .map(v => ({
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
    }));

  res.json({
    totalVideos,
    publishedVideos,
    pendingApprovals,
    upcomingShoots,
    totalViews,
    totalLikes,
    totalComments,
    videosByStatus,
    viewsByMonth,
    recentVideos,
  });
});

export default router;
