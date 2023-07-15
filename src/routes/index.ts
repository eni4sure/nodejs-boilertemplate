import express, { Router, Request, Response } from "express";

import v1Routes from "@/routes/v1";
import configRoutes from "@/routes/config.route";

const router: Router = express.Router();

router.use("/v1", v1Routes);

router.use("/config", configRoutes);

router.get("/", (_req: Request, res: Response) => {
    return res.status(200).json({ message: "Hello world from nodejs-boilertemplate !!" });
});

export default router;
