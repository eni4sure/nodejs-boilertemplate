import mongoose from "mongoose";

export interface ICore extends mongoose.Document {
    key: string;
    value: mongoose.Schema.Types.Mixed;
    createdAt?: Date;
    updatedAt?: Date;
}

const coreSchema = new mongoose.Schema<ICore>(
    {
        key: {
            type: String,
            unique: true,
            required: true,
        },
        value: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
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

export default mongoose.model<ICore>("core", coreSchema);
