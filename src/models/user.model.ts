import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    emailVerified: boolean;
    accountDisabled: boolean;
    role: "user" | "admin";
    lastActive: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

const userSchema: mongoose.Schema<IUser> = new mongoose.Schema<IUser>(
    {
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            collation: {
                locale: "en",
                strength: 2,
            },
        },
        password: {
            type: String,
            required: true,
            select: false,
        },

        emailVerified: {
            type: Boolean,
            required: true,
            default: false,
        },
        accountDisabled: {
            type: Boolean,
            required: true,
            default: false,
        },

        role: {
            type: String,
            required: true,
            enum: ["user", "admin"],
            default: "user",
        },

        lastActive: {
            type: Date,
            required: true,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// set mongoose options to have lean turned on by default | ref: https://itnext.io/performance-tips-for-mongodb-mongoose-190732a5d382
mongoose.Query.prototype.setOptions = function () {
    if (this.mongooseOptions().lean == null) {
        this.mongooseOptions({ lean: true });
    }
    return this;
};

export default mongoose.model<IUser>("users", userSchema);
