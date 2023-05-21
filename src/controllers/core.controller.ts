import { Request, Response } from "express";

import response from "@/utilities/response";
import CoreService from "@/services/core.service";

class CoreController {
    async getConfig(req: Request, res: Response) {
        const result = await CoreService.getConfig({ ...req });
        res.status(200).send(response(`${req.params.key} retrieved`, result));
    }
}

export default new CoreController();
