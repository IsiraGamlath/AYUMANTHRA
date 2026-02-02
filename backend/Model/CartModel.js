const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = new Schema({
    productId: {
        type: String,
        required: true  // ✅ ADDED - Links to inventory item
    },
    quantity:{
        type:Number,
        required:true,
    },
    weight:{
        type:Number,
        required:true,
    },
    form:{
        type:String,
        required:true,
    },
    notes:{
        type:String,
        required:true,
    },
    currentStatus: {
        type: String,
        enum: ["placed", "packed", "shipped", "out_for_delivery", "delivered"],
        default: "placed"
    },
    trackingNumber: {
        type: String,
        default: ""
    },
    estimatedDelivery: {
        type: String,
        default: ""
    },
    address: {
        type: String,
        default: ""
    },
    statusHistory: [
        {
            status: { type: String, required: true },
            timestamp: { type: String, required: true },
            note: { type: String, default: "" }
        }
    ]
})

module.exports = mongoose.model(
    "CartModel",
    cartSchema
)