const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = new Schema({
    quantity:{
        type:Number,//datatype
        required:true,//validation
    },
    weight:{
        type:Number,//datatype
        required:true,//validation
    },
    form:{
        type:String,//datatype
        required:true,//validation
    },
    notes:{
        type:String,//datatype
        required:true,//validation
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
    "CartModel",//fileName
    cartSchema//functionName
)
