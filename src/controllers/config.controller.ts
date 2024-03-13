import { Request, Response } from "express";

import response from "@/utilities/response";
import ConfigService from "@/services/config.service";

class ConfigController {
    async getConfig(req: Request, res: Response) {
        const result = await ConfigService.getConfig(req);
        res.status(200).send(response(`${req.params.key} retrieved`, result));
    }
}

export default new ConfigController();
