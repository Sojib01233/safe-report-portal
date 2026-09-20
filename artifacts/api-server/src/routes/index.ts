import { Router, type IRouter } from "express";
import healthRouter from "./health";
import presenceRouter from "./presence";
import reportsRouter from "./reports";

const router: IRouter = Router();

router.use(healthRouter);
router.use(presenceRouter);
router.use(reportsRouter);

export default router;
