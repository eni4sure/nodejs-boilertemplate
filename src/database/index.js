const mongoose = require("mongoose");
const { MONGODB_URI } = require("../config");

mongoose.connect(
    MONGODB_URI,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },
    (err, data) => {
        if (err) {
            console.error("<::: Couldn't connect to database", err);
        } else {
            console.log(`:::> Connected to MongoDB database. ${MONGODB_URI}`);
        }
    }
);
