import { Router } from "express";
import { CONFIGS } from "@/configs";
import UserCtrl from "@/controllers/user.controller";
import authGuard from "@/middlewares/auth.middleware";

const router: Router = Router();

router.get("/get-current", authGuard(CONFIGS.ROLES.USER), UserCtrl.getCurrentUser);

router.patch("/update-profile", authGuard(CONFIGS.ROLES.USER), UserCtrl.updateProfile);

router.patch("/update-password", authGuard(CONFIGS.ROLES.USER), UserCtrl.updatePassword);

export default router;
