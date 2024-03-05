import Joi from "joi";
import bcryptjs from "bcryptjs";
import { Request } from "express";
import { CONFIGS } from "@/configs";
import * as Sentry from "@sentry/node";
import { isValidObjectId } from "mongoose";

import UserModel from "@/models/user.model";
import mailService from "@/services/mail.service";
import CustomError from "@/utilities/custom-error";
import { TOKEN_TYPES } from "@/models/token.model";
import TokenService from "@/services/token.service";

class AuthService {
    async register({ body }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                first_name: Joi.string().trim().required().label("first name"),
                last_name: Joi.string().trim().required().label("last name"),
                email: Joi.string().trim().email().lowercase().required().label("email"),
                password: Joi.string().required().label("password"),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body });
        if (error) throw new CustomError(error.message, 400);

        const emailExist = await UserModel.findOne({ email: data.body.email });
        if (emailExist) throw new CustomError("email already exists", 400);

        const passwordHash = await bcryptjs.hash(data.body.password, CONFIGS.BCRYPT_SALT);

        const context = {
            first_name: data.body.first_name,
            last_name: data.body.last_name,
            email: data.body.email,
            password: passwordHash,
        };

        // Create new user
        const user = await new UserModel(context).save();

        // Generate token
        const token = await TokenService.generateAuthTokens({ _id: user._id });

        // Remove password from response
        user.password = undefined;

        // Send email verification code
        await this.requestEmailVerification({ body: { user_id: user._id } });

        return { user, token };
    }

    async login({ body }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                email: Joi.string().trim().email().lowercase().required().label("email"),
                password: Joi.string().required().label("password"),
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

        // check if account is disabled
        if (user.account_disabled === true) throw new CustomError("account has been disabled, if you believe this is a mistake kindly contact support", 409);

        // Generate token
        const token = await TokenService.generateAuthTokens({ _id: user._id });

        // Remove password from response
        user.password = undefined;

        return { user, token };
    }

    async verifyEmail({ body }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                user_id: Joi.string().required().label("user id"),
                verification_otp: Joi.string().trim().label("verification otp"), // can either be a token or a code
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body });
        if (error) throw new CustomError(error.message, 400);

        // Check if user exists
        const user = await UserModel.findOne({ _id: data.body.user_id });
        if (!user) throw new CustomError("invalid user id", 400);

        // Check if email is already verified
        if (user.email_verified) throw new CustomError("email is already verified", 400);

        const isValidToken = await TokenService.verifyOtpToken({
            userId: user._id,
            deleteIfValidated: true,
            code: data.body.verification_otp,
            token: data.body.verification_otp,
            tokenType: TOKEN_TYPES.EMAIL_VERIFICATION,
        });
        if (!isValidToken) throw new CustomError("invalid or expired token. Kindly request a new verification link", 400);

        // Update user
        await UserModel.updateOne({ _id: user._id }, { $set: { email_verified: true } });

        return;
    }

    async requestEmailVerification({ body }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                user_id: Joi.required().label("user id"),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body });
        if (error) throw new CustomError(error.message, 400);

        // Check if user exists
        const user = await UserModel.findOne({ _id: data.body.user_id });
        if (!user) throw new CustomError("invalid user id", 400);

        // Check if email is already verified
        if (user.email_verified) throw new CustomError("email is already verified", 400);

        // Create new otp (code and token)
        const verificationOtp = await TokenService.generateOtpToken({ userId: user._id, tokenType: TOKEN_TYPES.EMAIL_VERIFICATION });

        // send new verification link email
        await mailService.sendVerificationLinkEmail({ user: { _id: user._id, first_name: user.first_name, email: user.email }, verificationToken: verificationOtp.token });

        return;
    }

    async requestPasswordReset({ body }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                email: Joi.string().trim().email().lowercase().required().label("email"),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body });
        if (error) throw new CustomError(error.message, 400);

        // Check if email exists by a user
        const user = await UserModel.findOne({ email: data.body.email });
        // Don't throw error if user doesn't exist, just return null - so hackers don't exploit this route to know emails on the platform
        if (!user) return;

        // Create new otp (code and token)
        const resetOtp = await TokenService.generateOtpToken({ userId: user._id, tokenType: TOKEN_TYPES.PASSWORD_RESET });

        // send password reset email
        await mailService.sendPasswordResetLinkEmail({ user: { _id: user._id, first_name: user.first_name, email: user.email }, resetToken: resetOtp.token });

        return {
            user_id: user._id,
        };
    }

    async confirmPasswordResetOtp({ body }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                user_id: Joi.string().required().label("user id"),
                reset_otp: Joi.string().required().label("otp"),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body });
        if (error) throw new CustomError(error.message, 400);

        if (isValidObjectId(data.body.user_id) !== true) throw new CustomError("invalid user id", 400);

        // Check if user exists
        const user = await TokenService.verifyOtpToken({
            userId: data.body.user_id,
            deleteIfValidated: false,
            code: data.body.reset_otp,
            token: data.body.reset_otp,
            tokenType: TOKEN_TYPES.PASSWORD_RESET,
        });
        if (!user) throw new CustomError("invalid or expired token. Kindly make a new password reset request", 400);

        return true;
    }

    async resetPassword({ body }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                user_id: Joi.string().required().label("user id"),
                reset_otp: Joi.string().required().label("reset otp"),
                new_password: Joi.string().required().label("new password"),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body });
        if (error) throw new CustomError(error.message, 400);

        // Check if user exists
        const user = await UserModel.findOne({ _id: data.body.user_id });
        if (!user) throw new CustomError("invalid user id", 400);

        const isValidToken = await TokenService.verifyOtpToken({
            userId: user._id,
            deleteIfValidated: true,
            code: data.body.reset_otp,
            token: data.body.reset_otp,
            tokenType: TOKEN_TYPES.PASSWORD_RESET,
        });
        if (!isValidToken) throw new CustomError("invalid or expired token. Kindly make a new password reset request", 400);

        // Hash new password and update user
        const passwordHash = await bcryptjs.hash(data.body.new_password, CONFIGS.BCRYPT_SALT);
        await UserModel.updateOne({ _id: user._id }, { $set: { password: passwordHash } });

        return;
    }

    async refreshTokens({ body }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                refresh_token: Joi.required().label("refresh token"),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body });
        if (error) throw new CustomError(error.message, 400);

        // verify and refresh tokens
        const refreshedTokens = await TokenService.refreshAuthTokens(data.body.refresh_token);

        return refreshedTokens;
    }

    async logout({ body }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                refresh_token: Joi.string().allow("", null).optional().label("refresh token"),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body });
        if (error) throw new CustomError(error.message, 400);

        if (!data.body.refresh_token) return true;

        // revoke refresh token
        await TokenService.revokeRefreshToken(data.body.refresh_token).catch((error) => {
            Sentry.captureException(new Error(error), { extra: { body: data.body } });
        });

        return true;
    }
}

export default new AuthService();
