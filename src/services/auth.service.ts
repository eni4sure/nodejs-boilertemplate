import Joi from "joi";
import JWT from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { Request } from "express";

import CONFIGS from "@/configs";
import UserModel from "@/models/user.model";
import TokenModel from "@/models/token.model";
import mailService from "@/services/mail.service";
import CustomError from "@/utilities/custom-error";

class AuthService {
    async register({ body }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                firstName: Joi.string().required(),
                lastName: Joi.string().required(),
                email: Joi.string().email().required(),
                password: Joi.string().required(),
            }),
        }).validate({ body });
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
        const token = JWT.sign({ _id: user._id, role: user.role, email: user.email }, CONFIGS.JWT_SECRET, { expiresIn: CONFIGS.JWT_EXPIRES_IN });

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
        }).validate({ body });
        if (error) throw new CustomError(error.message, 400);

        // Check if email exists
        const user = await UserModel.findOne({ email: data.body.email }).select("+password");
        if (!user) throw new CustomError("incorrect email or password", 400);

        // Check if password is correct
        const validPassword = await bcryptjs.compare(data.body.password, user.password || "");
        if (!validPassword) throw new CustomError("incorrect email or password", 400);

        // Generate token
        const token = JWT.sign({ _id: user._id, role: user.role, email: user.email }, CONFIGS.JWT_SECRET, { expiresIn: CONFIGS.JWT_EXPIRES_IN });

        // Remove password from response
        delete user.password;

        return { user, token };
    }

    async verifyEmail({ body }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                userId: Joi.string().required(),
                // verificationToken is required if code is not provided
                verificationToken: Joi.string().when("verificationCode", { is: Joi.exist(), then: Joi.optional(), otherwise: Joi.required() }),
                // verificationCode is required if token is not provided
                verificationCode: Joi.string().when("verificationToken", { is: Joi.exist(), then: Joi.required(), otherwise: Joi.optional() }),
            }),
        }).validate({ body });
        if (error) throw new CustomError(error.message, 400);

        // Check if user exists
        const user = await UserModel.findOne({ _id: data.body.userId });
        if (!user) throw new CustomError("user does not exist", 400);

        // Check if email is already verified
        if (user.emailVerified) throw new CustomError("email is already verified", 400);

        let validTokenCode = null;

        // if verificationCode, check if code is valid
        if (data.body.verificationCode) validTokenCode = await TokenModel.findOne({ code: data.body.verificationCode, userId: user._id });
        // if verificationToken, check if token is valid
        if (data.body.verificationToken) validTokenCode = await TokenModel.findOne({ token: data.body.verificationToken, userId: user._id });

        if (!validTokenCode) throw new CustomError("invalid or expired token code", 400);

        // Update user
        await UserModel.updateOne({ _id: user._id }, { $set: { emailVerified: true } });

        // Delete token
        await TokenModel.deleteOne({ _id: validTokenCode._id });

        return;
    }

    async requestEmailVerification(userId: string, isNewUser: boolean) {
        const { error, value: data } = Joi.object({
            userId: Joi.string().required(),
            isNewUser: Joi.boolean().required(),
        }).validate({ userId, isNewUser });
        if (error) throw new CustomError(error.message, 400);

        // Check if user exists
        const user = await UserModel.findOne({ _id: data.body.userId });
        if (!user) throw new CustomError("user does not exist", 400);

        // Check if email is already verified
        if (user.emailVerified) throw new CustomError("email is already verified", 400);

        // Create new token
        const verificationToken = await new TokenModel({ userId: user._id }).save();

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
        }).validate({ body });
        if (error) throw new CustomError(error.message, 400);

        // Check if email exists by a user
        const user = await UserModel.findOne({ email: data.body.email });
        // Don't throw error if user doesn't exist, just return null - so hackers don't exploit this route to know emails on the platform
        if (!user) return;

        // Delete any previous token
        await TokenModel.deleteOne({ userId: user._id });

        // Create new token
        const resetToken = await new TokenModel({ userId: user._id }).save();

        // send password reset email
        await mailService.sendPasswordResetEmail({ user, resetToken: resetToken.token });

        return;
    }

    async resetPassword({ body }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                userId: Joi.string().required(),
                resetToken: Joi.string().required(),
                newPassword: Joi.string().required(),
            }),
        }).validate({ body });
        if (error) throw new CustomError(error.message, 400);

        // Check if user exists
        const user = await UserModel.findOne({ _id: data.body.userId });
        if (!user) throw new CustomError("user does not exist", 400);

        // Check if token is valid
        const validResetToken = await TokenModel.findOne({ token: data.body.resetToken, userId: user._id });
        if (!validResetToken) throw new CustomError("invalid or expired password reset token", 400);

        // Hash new password and update user
        const passwordHash = await bcryptjs.hash(data.body.newPassword, CONFIGS.BCRYPT_SALT);
        await UserModel.updateOne({ _id: user._id }, { $set: { password: passwordHash } });

        // Delete token
        await TokenModel.deleteOne({ _id: validResetToken._id });

        return;
    }
}

export default new AuthService();
