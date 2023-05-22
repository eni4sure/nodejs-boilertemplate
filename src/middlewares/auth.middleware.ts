import JWT from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import CONFIG from "@/configs";
import User from "@/models/user.model";
import CustomError from "@/utilities/custom-error";

/**
 * If no role is passed the default role is user
 *
 * @param  {any[]} roles List of roles allowed to access the route
 */
function auth(roles: string[] = []) {
    roles = roles.length > 0 ? roles : CONFIG.ROLES.USER;

    return async (req: Request, _res: Response, next: NextFunction) => {
        if (!req.headers.authorization) throw new CustomError("unauthorized access: token not found", 401);

        const token: string = req.headers.authorization.split(" ")[1] || "";

        const decoded: any = JWT.verify(token, CONFIG.JWT_SECRET, (err: any, decoded: any) => {
            if (err) throw new CustomError("-middleware/token-expired", 401);
            return decoded;
        });

        const user = await User.findOne({ _id: decoded._id });

        // user not found
        if (!user) throw new CustomError("-middleware/user-not-found", 401);

        // user is deactivated
        if (user.accountDisabled) throw new CustomError("-middleware/user-deactivated", 401);

        // If email address is not verified
        if (!user.emailVerified) throw new CustomError("-middleware/user-email-not-verified", 401);

        // If role is not authorized to access route
        if (!roles.includes(user.role)) throw new CustomError("-middleware/user-not-authorized", 401);

        // Log lastActive for every request
        await User.findByIdAndUpdate(user._id, { lastActive: new Date() });

        // Attach user to request
        req.$currentUser = user;

        next();
    };
}

export default auth;
