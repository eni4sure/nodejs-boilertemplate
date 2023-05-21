import mongoose from "mongoose";
import CONFIG from "@/configs";

const connectMongoDB = async () => {
    try {
        mongoose.connect(CONFIG.MONGODB_URI);

        console.log(`:::> Connected to MongoDB database. ${CONFIG.MONGODB_URI}`);
    } catch (error) {
        console.error("<::: Couldn't connect to database", error);
    }
};

export { connectMongoDB };
