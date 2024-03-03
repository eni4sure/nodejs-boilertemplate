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

export { connectMongoDB };
