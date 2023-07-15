import { Router } from "express";
import ConfigCtrl from "@/controllers/config.controller";

const router: Router = Router();

router.get("/:key", ConfigCtrl.getConfig);

export default router;
