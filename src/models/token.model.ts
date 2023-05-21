import crypto from "crypto";
import CONFIGS from "@/configs";
import mongoose from "mongoose";

export interface IToken extends mongoose.Document {
    code: string | null;
    token: string | null;
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
}

const tokenSchema: mongoose.Schema<IToken> = new mongoose.Schema<IToken>({
    code: {
        type: String,
        required: true,
        default: () => crypto.randomBytes(3).toString("hex").toUpperCase(),
    },
    token: {
        type: String,
        required: false,
        default: () => crypto.randomBytes(32).toString("hex"),
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user",
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
        expires: CONFIGS.TOKEN_EXPIRY_DURATION,
    },
});

// Set mongoose options to have lean turned on by default
mongoose.Query.prototype.setOptions = function () {
    if (this.mongooseOptions().lean == null) {
        this.mongooseOptions({ lean: true });
    }
    return this;
};

export default mongoose.model<IToken>("token", tokenSchema);
