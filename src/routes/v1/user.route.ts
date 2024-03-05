import { Router } from "express";
import { CONFIGS } from "@/configs";
import authGuard from "@/middlewares/auth.middleware";
import UserCtrl from "@/controllers/v1/user.controller";

const router: Router = Router();

router.get("/session", authGuard(CONFIGS.APP_ROLES.USER), UserCtrl.getUserSession);

router.patch("/update-profile", authGuard(CONFIGS.APP_ROLES.USER), UserCtrl.updateProfile);

router.patch("/update-password", authGuard(CONFIGS.APP_ROLES.USER), UserCtrl.updatePassword);

export default router;
