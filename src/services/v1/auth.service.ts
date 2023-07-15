import Joi from "joi";
import bcryptjs from "bcryptjs";
import { Request } from "express";
import { CONFIGS } from "@/configs";
import * as Sentry from "@sentry/node";

import UserModel from "@/models/user.model";
import mailService from "@/services/mail.service";
import CustomError from "@/utilities/custom-error";
import TokenService from "@/services/token.service";

class AuthService {
    async register({ body }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                firstName: Joi.string().required(),
                lastName: Joi.string().required(),
                email: Joi.string().email().required(),
                password: Joi.string().required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body });
        if (error) throw new CustomError(error.message, 400);

        const emailExist = await UserModel.findOne({ email: data.body.email });
        if (emailExist) throw new CustomError("email already exists", 400);

        const passwordHash = await bcryptjs.hash(data.body.password, CONFIGS.BCRYPT_SALT);

        const context = {
            firstName: data.body.firstName,
            lastName: data.body.lastName,
            email: data.body.email,
            password: passwordHash,
        };

        // Create new user
        const user = await new UserModel(context).save();

        // Generate token
        const token = await TokenService.generateAuthTokens({ _id: user._id, role: user.role, email: user.email });

        // Send email verification
        await this.requestEmailVerification(user._id, true);

        return { user, token };
    }

    async login({ body }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                email: Joi.string().email().required(),
                password: Joi.string().required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body });
        if (error) throw new CustomError(error.message, 400);

        // Check if email exists
        const user = await UserModel.findOne({ email: data.body.email }).select("+password");
        if (!user) throw new CustomError("incorrect email or password", 400);

        // Check if password is correct
        const validPassword = await bcryptjs.compare(data.body.password, user.password || "");
        if (!validPassword) throw new CustomError("incorrect email or password", 400);

        // check if acount is disabled
        if (user.accountDisabled === true) throw new CustomError("account has been disabled, if you believe this is a mistake kindly contact support", 409);

        // Generate token
        const token = await TokenService.generateAuthTokens({ _id: user._id, role: user.role, email: user.email });

        // Remove password from response
        delete user.password;

        return { user, token };
    }

    async verifyEmail({ body }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                userId: Joi.string().required(),
                // verificationToken is required if code is not provided
                verificationToken: Joi.string(),
                // verificationCode is required if token is not provided
                verificationCode: Joi.string(),
            }).xor("verificationToken", "verificationCode"),
        })
            .options({ stripUnknown: true })
            .validate({ body });
        if (error) throw new CustomError(error.message, 400);

        // Check if user exists
        const user = await UserModel.findOne({ _id: data.body.userId });
        if (!user) throw new CustomError("user does not exist", 400);

        // Check if email is already verified
        if (user.emailVerified) throw new CustomError("email is already verified", 400);

        const isValidToken = await TokenService.verifyToken({ token: data.body.verificationToken, code: data.body.verificationCode, userId: user._id, tokenType: "email-verification" });
        if (!isValidToken) throw new CustomError("invalid or expired token. Kindly request a new verification link", 400);

        // Update user
        await UserModel.updateOne({ _id: user._id }, { $set: { emailVerified: true } });

        return;
    }

    async requestEmailVerification(userId: string, isNewUser: boolean) {
        const { error, value: data } = Joi.object({
            userId: Joi.required(),
            isNewUser: Joi.boolean().required(),
        })
            .options({ stripUnknown: true })
            .validate({ userId, isNewUser });
        if (error) throw new CustomError(error.message, 400);

        // Check if user exists
        const user = await UserModel.findOne({ _id: data.userId });
        if (!user) throw new CustomError("user does not exist", 400);

        // Check if email is already verified
        if (user.emailVerified) throw new CustomError("email is already verified", 400);

        // Create new token
        const verificationToken = await TokenService.generateToken({ userId: user._id, tokenType: "email-verification" });

        if (isNewUser) {
            // send welcome user email
            await mailService.sendWelcomeUserEmail({ user, verificationToken: verificationToken.token });
        } else {
            // send new verification link email
            await mailService.sendVerificationLinkEmail({ user, verificationToken: verificationToken.token });
        }

        return;
    }

    async requestPasswordReset({ body }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                email: Joi.string().email().required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body });
        if (error) throw new CustomError(error.message, 400);

        // Check if email exists by a user
        const user = await UserModel.findOne({ email: data.body.email });
        // Don't throw error if user doesn't exist, just return null - so hackers don't exploit this route to know emails on the platform
        if (!user) return;

        const resetToken = await TokenService.generateToken({ userId: user._id, tokenType: "password-reset" });

        // send password reset email
        await mailService.sendPasswordResetEmail({ user, resetToken: resetToken.token });

        return;
    }

    async refreshTokens({ body }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                refreshToken: Joi.required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body });
        if (error) throw new CustomError(error.message, 400);

        // verify and refresh tokens
        const refreshedTokens = await TokenService.refreshAuthTokens(data.body.refreshToken);

        return refreshedTokens;
    }

    async logout({ body }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                refreshToken: Joi.string().allow(null).optional(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body });
        if (error) throw new CustomError(error.message, 400);

        // revoke refresh token
        await TokenService.revokeRefreshToken(data.body.refreshToken).catch((error) => {
            Sentry.captureException(new Error(error), { extra: { body: data.body } });
        });

        return true;
    }

    async resetPassword({ body }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                userId: Joi.string().required(),
                resetToken: Joi.string().required(),
                newPassword: Joi.string().required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body });
        if (error) throw new CustomError(error.message, 400);

        // Check if user exists
        const user = await UserModel.findOne({ _id: data.body.userId });
        if (!user) throw new CustomError("user does not exist", 400);

        const isValidToken = await TokenService.verifyToken({ token: data.body.resetToken, userId: user._id, tokenType: "password-reset" });
        if (!isValidToken) throw new CustomError("invalid or expired token. Kindly make a new password reset request", 400);

        // Hash new password and update user
        const passwordHash = await bcryptjs.hash(data.body.newPassword, CONFIGS.BCRYPT_SALT);
        await UserModel.updateOne({ _id: user._id }, { $set: { password: passwordHash } });

        return;
    }
}

export default new AuthService();
