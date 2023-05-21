import express, { Router, Request, Response } from "express";

import authRoutes from "@/routes/auth.route";
import coreRoutes from "@/routes/core.route";
import userRoutes from "@/routes/user.route";

const router: Router = express.Router();

router.use("/auth", authRoutes);

router.use("/core", coreRoutes);

router.use("/users", userRoutes);

router.get("/", (_req: Request, res: Response) => {
    return res.status(200).json({ message: "Hello world from nodejs-boilertemplate !!" });
});

// playground: can be used to test routes and other stuffs in development mode
if (process.env.NODE_ENV === "development") {
    router.use("/playground", async (_req: Request, res: Response) => {
        const results = {};

        res.json(results);
    });
}

export default router;
