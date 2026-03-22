import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import videosRouter from "./videos";
import shootsRouter from "./shoots";
import approvalsRouter from "./approvals";
import analyticsRouter from "./analytics";
import hubspotRouter from "./hubspot";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(videosRouter);
router.use(shootsRouter);
router.use(approvalsRouter);
router.use(analyticsRouter);
router.use(hubspotRouter);

export default router;
