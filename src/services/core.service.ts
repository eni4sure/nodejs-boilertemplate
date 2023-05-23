import Joi from "joi";
import { Request } from "express";

import CoreModel from "@/models/core.model";
import CustomError from "@/utilities/custom-error";

class CoreService {
    async getConfig({ params }: Partial<Request>) {
        const { error, value: data } = Joi.object({
            params: Joi.object({
                key: Joi.string().required(),
            }),
        })
            .options({ stripUnknown: true })
            .validate({ params });
        if (error) throw new CustomError(error.message, 400);

        const config = await CoreModel.findOne({ key: data.params.key });
        if (!config) throw new CustomError(`${data.params.key} not found`, 404);

        return config.value;
    }
}

export default new CoreService();
