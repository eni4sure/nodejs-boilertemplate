import Joi from "joi";
import bcryptjs from "bcryptjs";
import { Request } from "express";

import CONFIGS from "@/configs";
import UserModel from "@/models/user.model";
import CustomError from "@/utilities/custom-error";

class UserService {
    async getCurrentUser({ $currentUser }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            $currentUser: Joi.object({
                _id: Joi.required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ $currentUser });
        if (error) throw new CustomError(error.message, 400);

        return await UserModel.findOne({ _id: data.$currentUser._id });
    }

    async updateProfile({ body, $currentUser }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                firstName: Joi.string().required(),
                lastName: Joi.string().required(),
            }),
            $currentUser: Joi.object({
                _id: Joi.required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body, $currentUser });
        if (error) throw new CustomError(error.message, 400);

        // Check if user exists
        const user = await UserModel.findOneAndUpdate({ _id: data.$currentUser._id }, { $set: data.body }, { new: true });
        if (!user) throw new CustomError("user not found", 404);

        return user;
    }

    async updatePassword({ body, $currentUser }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            body: Joi.object({
                currentPassword: Joi.string().required(),
                newPassword: Joi.string().required(),
            }),
            $currentUser: Joi.object({
                _id: Joi.required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ body, $currentUser });
        if (error) throw new CustomError(error.message, 400);

        // Check if user exists
        const user = await UserModel.findOne({ _id: data.$currentUser._id }).select("+password");
        if (!user) throw new CustomError("user not found", 404);

        // Check if password is correct
        const isPasswordCorrect = await bcryptjs.compare(data.body.currentPassword, user.password || "");
        if (!isPasswordCorrect) throw new CustomError("incorrect password", 400);

        // Hash new password and update user
        const passwordHash = await bcryptjs.hash(data.body.newPassword, CONFIGS.BCRYPT_SALT);
        await UserModel.updateOne({ _id: user._id }, { $set: { password: passwordHash } });

        return;
    }
}

export default new UserService();
