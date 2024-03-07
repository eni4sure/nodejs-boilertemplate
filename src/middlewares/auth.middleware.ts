import JWT from "jsonwebtoken";
import * as Sentry from "@sentry/node";
import { Request, Response, NextFunction } from "express";

import { CONFIGS } from "@/configs";
import User from "@/models/user.model";
import CustomError from "@/utilities/custom-error";

/**
 * If no role is passed the default role is user
 *
 * @param  {any[]} roles List of roles allowed to access the route
 */
function auth(roles: string[] = []) {
    roles = roles.length > 0 ? roles : CONFIGS.APP_ROLES.USER;

    return async (req: Request, _res: Response, next: NextFunction) => {
        if (!req.headers.authorization) throw new CustomError("unauthorized access: token not found", 401);

        const token: string = req.headers.authorization.split(" ")[1] || "";

        const decoded: any = JWT.verify(token, CONFIGS.JWT_SECRET, (err: any, decoded: any) => {
            if (err) throw new CustomError("-middleware/token-expired", 401);
            return decoded;
        });

        const user = await User.findOne({ _id: decoded._id });

        // user not found
        if (!user) throw new CustomError("-middleware/user-not-found", 401);

        // user is deactivated
        if (user.account_disabled) throw new CustomError("-middleware/user-deactivated", 401);

        // If email address is not verified
        if (!user.email_verified) throw new CustomError("-middleware/user-email-not-verified", 401);

        // If role is not authorized to access route
        if (!roles.includes(user.role)) throw new CustomError("-middleware/user-not-authorized", 401);

        // log lastActive for user request
        await User.findOneAndUpdate({ _id: user._id }, { last_active: new Date() });

        // Set user context for Sentry
        Sentry.setUser({ id: user._id.toString(), email: user.email });

        // Attach user to request
        req.$currentUser = user;

        next();
    };
}

export default auth;
