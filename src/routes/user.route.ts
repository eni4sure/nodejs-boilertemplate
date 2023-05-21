import CONFIG from "@/configs";
import { Router } from "express";
import UserCtrl from "@/controllers/user.controller";
import authGuard from "@/middlewares/auth.middleware";

const router: Router = Router();

router.get("/get-current", authGuard(CONFIG.ROLES.USER), UserCtrl.getCurrentUser);

router.patch("/update-profile", authGuard(CONFIG.ROLES.USER), UserCtrl.updateProfile);

router.patch("/update-password", authGuard(CONFIG.ROLES.USER), UserCtrl.updatePassword);

export default router;
