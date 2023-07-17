import mongoose from "mongoose";
import { CONFIGS } from "@/configs";

export interface IToken extends mongoose.Document {
    code: string | null;
    token: string | null;
    type: "email-verification" | "password-reset" | "refresh-token";
    userId: mongoose.Types.ObjectId;
    expiresAt: Date;
}

const tokenSchema: mongoose.Schema<IToken> = new mongoose.Schema<IToken>(
    {
        code: {
            type: String,
            required: false,
            default: null,
        },

        token: {
            type: String,
            required: false,
            default: null,
        },

        type: {
            type: String,
            required: true,
            enum: ["email-verification", "password-reset", "refresh-token"],
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "user",
        },

        expiresAt: {
            type: Date,
            required: true,
            default: Date.now,
            expires: CONFIGS.DEFAULT_DB_TOKEN_EXPIRY_DURATION,
        },
    },
    {
        timestamps: false,
    }
);

// Set mongoose options to have lean turned on by default
mongoose.Query.prototype.setOptions = function () {
    if (this.mongooseOptions().lean == null) {
        this.mongooseOptions({ lean: true });
    }
    return this;
};

export default mongoose.model<IToken>("token", tokenSchema);
