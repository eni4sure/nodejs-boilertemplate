import type { Request, Response, NextFunction } from "express";
import { trimObjectStrings } from "@/utilities/helpful-methods";

const trimIncomingRequests = (req: Request, _res: Response, next: NextFunction) => {
    if (req.body) {
        req.body = trimObjectStrings(req.body);
    }

    if (req.query) {
        req.query = trimObjectStrings(req.query);
    }

    if (req.params) {
        req.params = trimObjectStrings(req.params);
    }

    next();
};

export default trimIncomingRequests;
