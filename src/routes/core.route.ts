import { Router } from "express";
import CoreCtrl from "@/controllers/core.controller";

const router: Router = Router();

router.get("/:key", CoreCtrl.getConfig);

export default router;
