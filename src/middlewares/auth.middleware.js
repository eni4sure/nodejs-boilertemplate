const JWT = require("jsonwebtoken");
const User = require("../models/user.model");
const { role, JWT_SECRET } = require("../config");
const CustomError = require("../utils/custom-error");

/**
 * If no role is passed the default role is user
 *
 * @param  {any[]} roles List of roles allowed to access the route
 */
function auth(roles = []) {
    roles = roles.length > 0 ? roles : role.USER;

    return async (req, res, next) => {
        if (!req.headers.authorization) throw new CustomError("unauthorized access: token not found", 401);

        const token = req.headers.authorization.split(" ")[1];
        const decoded = JWT.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) throw new CustomError("-middleware/token-expired", 401);
            return decoded;
        });

        const user = await User.findOne({ _id: decoded.id });

        // If User does not exist
        if (!user) throw new CustomError("-middleware/user-not-found", 401);

        // If User has been deactivated
        if (!user.isActive) throw new CustomError("-middleware/user-deactivated", 401);

        // If email address is not verified
        if (!user.isEmailVerified) throw new CustomError("-middleware/user-email-not-verified", 401);

        // If role is not authorized to access route
        if (!roles.includes(user.role)) throw new CustomError("-middleware/user-not-authorized", 401);

        // Log lastActive for every request
        await User.findByIdAndUpdate(user._id, { lastActive: new Date() });

        req.$user = user;

        next();
    };
}

module.exports = auth;
