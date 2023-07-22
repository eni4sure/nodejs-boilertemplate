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

// set mongoose options to have lean turned on by default | ref: https://itnext.io/performance-tips-for-mongodb-mongoose-190732a5d382
mongoose.Query.prototype.setOptions = function () {
    if (this.mongooseOptions().lean == null) {
        this.mongooseOptions({ lean: true });
    }
    return this;
};

export default mongoose.model<IConfig>("config", configSchema);
