import { Router } from "express";
import issueRouter from "./issue";
import verifyRouter from "./verify";

const router = Router();

router.use("/issue", issueRouter);
router.use("/verify", verifyRouter);

export default router;
