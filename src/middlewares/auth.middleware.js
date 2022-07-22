const JWT = require("jsonwebtoken");
const User = require("./../models/user.model");
const { role, JWT_SECRET } = require("./../config");
const CustomError = require("./../utils/custom-error");

/**
 * If no role is passed the default role is user
 *
 * @param  {any[]} roles List of roles allowed to access the route
 */
function auth(roles = []) {
    roles = roles.length > 0 ? roles : role.USER;

    return async (req, res, next) => {
        if (!req.headers.authorization) throw new CustomError("unauthorized access: Token not found", 401);

        const token = req.headers.authorization.split(" ")[1];
        const decoded = JWT.verify(token, JWT_SECRET);

        const user = await User.findOne({ _id: decoded.id });

        if (!user) throw new CustomError("-middleware/user-not-found", 401);
        // if (!user) throw new CustomError("unauthorized access: User does not exist", 401);

        if (!user.is_active) throw new CustomError("-middleware/user-deactivated", 401);
        // if (!user.is_active) throw new CustomError("unauthorized access: User has been deactivated", 401);

        if (!user.is_verified) throw new CustomError("-middleware/user-not-verified", 401);
        // if (!user.is_verified) throw new CustomError("unauthorized access: Please verify email address", 401);

        if (!roles.includes(user.role)) throw new CustomError("-middleware/user-not-authorized", 401);
        // if (!roles.includes(user.role)) throw new CustomError("unauthorized access", 401);

        req.$user = user;

        next();
    };
}

module.exports = auth;
