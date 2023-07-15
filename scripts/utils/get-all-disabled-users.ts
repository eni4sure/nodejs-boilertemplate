import UserModel from "@/models/user.model";
import { connectMongoDB } from "@/libraries/mongo";

export default async function handler() {
    await connectMongoDB();

    const users = await UserModel.find({ accountDisabled: true });

    return users;
}

// prettier-ignore
handler().then((response)=>{
    console.log(response);
    process.exit(0);
}).catch(console.error);
