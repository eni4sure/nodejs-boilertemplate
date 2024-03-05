import mongoose from "mongoose";
import { CONFIGS, DEPLOYMENT_ENV } from "@/configs";

const connectMongoDB = async () => {
    try {
        await mongoose.connect(CONFIGS.MONGODB_URI);

        if (DEPLOYMENT_ENV !== "production") {
            console.log(`:::> Connected to mongoDB database. ${CONFIGS.MONGODB_URI}`);
        }
    } catch (error) {
        console.error("<::: Couldn't connect to database", error);
    }
};

// set mongoose options to have lean turned on by default | ref: https://itnext.io/performance-tips-for-mongodb-mongoose-190732a5d382
mongoose.Query.prototype.setOptions = function () {
    if (this.mongooseOptions().lean == null) {
        this.mongooseOptions({ lean: true });
    }

    return this;
};

export { connectMongoDB };
