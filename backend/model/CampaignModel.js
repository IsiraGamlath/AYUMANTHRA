const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const campaignSchema = new Schema({
    campaignName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: "active",
    },
    deadline: {
        type: Date,
        required: true,
    },
    participants: {
        type: Number,
        required: true,
        default: 0,
    },
    rating: {
        type: Number,
        required: true,
        default: 0,
    },
    discount: {
        type: Number,
        required: true,
        default: 0,
    },
    imageUrl: {
        type: String,
    },
}, { timestamps: true });

module.exports = mongoose.model("Campaign", campaignSchema);
