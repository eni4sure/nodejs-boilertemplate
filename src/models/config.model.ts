import mongoose from "mongoose";

export interface IConfig extends mongoose.Document {
    key: string;
    value: mongoose.Schema.Types.Mixed;
}

const configSchema = new mongoose.Schema<IConfig>(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            collation: {
                locale: "en",
                strength: 2,
            },
        },
        value: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
    },
    {
        timestamps: false,
    }
);

export default mongoose.model<IConfig>("configs", configSchema);
