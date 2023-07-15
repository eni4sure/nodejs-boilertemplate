import express, { Router } from "express";

import authRoutes from "@/routes/v1/auth.route";
import userRoutes from "@/routes/v1/user.route";

const router: Router = express.Router();

router.use("/auth", authRoutes);

router.use("/users", userRoutes);

export default router;
