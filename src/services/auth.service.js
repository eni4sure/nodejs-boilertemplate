const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");

const UserService = require("./user.service");

const User = require("../models/user.model");
const Token = require("../models/token.model");

const CustomError = require("../utils/custom-error");
const MailService = require("../services/mail.service");
const { JWT_SECRET, BCRYPT_SALT, URL } = require("../config");

class AuthService {
    async register(data) {
        // Create new user
        const user = await UserService.create(data);

        // Generate token
        const token = JWT.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: 60 * 60 });

        // Request email verification
        await this.requestEmailVerification(user.email, true);

        return { user, token: token };
    }

    async login(req) {
        const data = req.body;

        if (!data.email) throw new CustomError("email is required");
        if (!data.password) throw new CustomError("Password is required");

        // Check if user exist
        const user = await User.findOne({ email: data.email }).select("+password");
        if (!user) throw new CustomError("incorrect email or password");

        // Check if user password is correct
        const isCorrect = await bcrypt.compare(data.password, user.password);
        if (!isCorrect) throw new CustomError("incorrect email or password");

        if (data.mode === "admin") {
            // if loginMode is admin, confirm the user role is admin
            if (user.role !== "admin") throw new CustomError("incorrect email or password");
        } else {
            // if loginMode is not admin, don't allow the user to login here
            if (user.role === "admin") throw new CustomError("admin account cannot be used to login here");
        }

        const token = JWT.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: 60 * 60 });

        // Remove password field
        delete user.password;

        return { user, token: token };
    }

    async verifyEmail(data) {
        if (!data.userId) throw new CustomError("userId is required");
        if (!data.verifyToken) throw new CustomError("verifyToken is required");

        const user = await User.findOne({ _id: data.userId });
        if (!user) throw new CustomError("User does not exist");
        if (user.isEmailVerified) throw new CustomError("email is already verified");

        const VToken = await Token.findOne({ userId: data.userId }).lean(false);
        if (!VToken) throw new CustomError("invalid or expired password reset token");

        const isValid = await bcrypt.compare(data.verifyToken, VToken.token);
        if (!isValid) throw new CustomError("invalid or expired password reset token");

        await User.updateOne({ _id: data.userId }, { $set: { isEmailVerified: true } }, { new: true });

        await VToken.deleteOne();

        return;
    }

    async requestEmailVerification(email, isNewUser) {
        if (!email) throw new CustomError("email is required");

        const user = await User.findOne({ email });
        if (!user) throw new CustomError("email does not exist");
        if (user.isEmailVerified) throw new CustomError("email is already verified");

        const token = await Token.findOne({ userId: user._id }).lean(false);
        if (token) await token.deleteOne();

        const verifyToken = crypto.randomBytes(32).toString("hex");
        const hash = await bcrypt.hash(verifyToken, BCRYPT_SALT);

        await new Token({
            userId: user._id,
            token: hash,
            createdAt: Date.now()
        }).save();

        const link = `${URL.DASHBOARD_URL}/auth/email-verification?uid=${user._id}&verifyToken=${verifyToken}`;

        if (isNewUser) {
            // Send New Account Email + Verification Link Mail
            await new MailService(user).sendNewAccountEmail(link);
        } else {
            // Send New Verification Link Mail
            await new MailService(user).sendVerificationLinkEmail(link);
        }

        return;
    }

    async requestPasswordReset(email) {
        if (!email) throw new CustomError("email is required");

        const user = await User.findOne({ email });
        // Don't throw error if user doesn't exist, just return null - so spammers don't use this route to know emails on the platform
        if (!user) return;

        const token = await Token.findOne({ userId: user._id }).lean(false);
        if (token) await token.deleteOne();

        const resetToken = crypto.randomBytes(32).toString("hex");
        const hash = await bcrypt.hash(resetToken, BCRYPT_SALT);

        await new Token({
            userId: user._id,
            token: hash,
            createdAt: Date.now()
        }).save();

        const link = `${URL.DASHBOARD_URL}/auth/reset-password?uid=${user._id}&resetToken=${resetToken}`;

        // Send Mail
        await new MailService(user).sendPasswordResetEmail(link);

        return;
    }

    async resetPassword(data) {
        if (!data.userId) throw new CustomError("userId is required");
        if (!data.password) throw new CustomError("password is required");
        if (!data.resetToken) throw new CustomError("resetToken is required");

        const RToken = await Token.findOne({ userId: data.userId }).lean(false);
        if (!RToken) throw new CustomError("invalid or expired password reset token");

        const isValid = await bcrypt.compare(data.resetToken, RToken.token);
        if (!isValid) throw new CustomError("invalid or expired password reset token");

        const hash = await bcrypt.hash(data.password, BCRYPT_SALT);

        await User.updateOne({ _id: data.userId }, { $set: { password: hash } }, { new: true });

        await RToken.deleteOne();

        return;
    }

    async updatePassword(userId, data) {
        if (!data.currentPassword) throw new CustomError("current Password is required");
        if (!data.newPassword) throw new CustomError("new Password is required");

        const user = await User.findOne({ _id: userId }).select("+password");
        if (!user) throw new CustomError("user does not exist");

        // check if user password is correct
        const isCorrect = await bcrypt.compare(data.currentPassword, user.password);
        if (!isCorrect) throw new CustomError("incorrect password");

        const hash = await bcrypt.hash(data.newPassword, BCRYPT_SALT);

        await User.updateOne({ _id: userId }, { $set: { password: hash } }, { new: true });

        return;
    }
}

module.exports = new AuthService();
