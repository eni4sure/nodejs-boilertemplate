import { AnyBulkWriteOperation } from "mongodb";
import { connectMongoDB } from "@/libraries/mongodb";
import UserModel, { IUser } from "@/models/user.model";

// How to use this template:

// 1. Copy this file to a new file in the same folder
// 2. Rename the file to the name of the migration you want to perform
// 3. Find the // TODO and replace them with the appropriate code or value for your migration script.
// 4. Write & test using console.log the expected update for your migration, before running it on the database.
// 5. To run/test the migration, use the command: "yarn run:script scripts/migrations/<migration-name>"

// We use cursor to iterate over the documents to update. Learn more about cursor search:
// - https://thecodebarbarian.com/cursors-in-mongoose-45
// - https://mongoosejs.com/docs/api/querycursor.html

export default async function handler() {
    await connectMongoDB();

    // number of documents to update in a single batch
    const batchUpdateSize = 100;

    let updateCount = 0;
    let batchUpdates = [] as AnyBulkWriteOperation<IUser>[]; // update the type for intellisense

    // TODO: write the query to the find the documents to update (using cursor search)
    // - Update the model everywhere it is used to appropriate model
    const queryCursorSearch = UserModel.find({}).cursor();

    // iterate over the documents to update
    await queryCursorSearch.eachAsync(
        async (document, index) => {
            updateCount++;

            // TODO: write the update logic here (if code is needed)
            // const updatedDocument = document;
            console.log(`Processing document ${index + 1}`, document.email);

            // TODO: push an update query into the batchUpdates for later processing
            // batchUpdates.push({
            //     updateOne: {
            //         filter: { _id: document._id },
            //         update: {
            //             $set: { email: updatedDocument.email },
            //         },
            //     },
            // });

            // update the documents in batches
            if (updateCount % batchUpdateSize === 0) {
                await UserModel.bulkWrite(batchUpdates);
                batchUpdates = [];
            }
        },
        {
            parallel: 10, // number of documents to process in parallel
        }
    );

    // Process any remaining documents
    if (batchUpdates.length > 0) {
        await UserModel.bulkWrite(batchUpdates);
    }

    // Close the cursor
    await queryCursorSearch.close();

    return `Migration completed. Processed ${updateCount} documents.`;
}

// prettier-ignore
handler().then((response)=>{
    console.log(response);
    process.exit(0);
}).catch(console.error);
