import { Router } from "express";
import AuthCtrl from "@/controllers/v1/auth.controller";

const router: Router = Router();

router.post("/register", AuthCtrl.register);

router.post("/login", AuthCtrl.login);

router.post("/verify-email", AuthCtrl.verifyEmail);

router.post("/request-email-verification", AuthCtrl.requestEmailVerification);

router.post("/request-password-reset", AuthCtrl.requestPasswordReset);

router.patch("/reset-password", AuthCtrl.resetPassword);

router.post("/refresh-tokens", AuthCtrl.refreshTokens);

router.post("/logout", AuthCtrl.logout);

export default router;
