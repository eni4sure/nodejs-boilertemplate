const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user"
    },
    token: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        required: true,
        default: Date.now,
        expires: 900
    }
});

module.exports = mongoose.model("token", tokenSchema);
