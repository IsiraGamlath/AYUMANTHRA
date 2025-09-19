//add mongoose
const mongoose = require("mongoose");
//assign mongoose to schema
const Schema = mongoose.Schema;

//making Schema function
//then inside that we call all the insert details
const inventorySchema = new Schema({
    name: { type: String, //data type
           required: true },//validate
    batchNumber: { type: String,//datatype
        required: true },//validate
    expiryDate: { type: Date,//data type
        required: true},//validate
    quantity: { type: Number, //data type
               required: true },//validate
    unit: { type: String,//data type
        required: true},//validate
    price: { type: Number, //data type
             required: true },//validate
    currency: { type: String,//data type
        default: "LKR" },//default value
    category: { type: String,//data type
        required: true },//validate
    supplier: { type: String,//data type
        required: true },//validate
    dateAdded: { type: Date, default: Date.now,//data type
        required: true },//validate
    description: { type: String },//data type
    image: { type: String }//data type
});

//to make table with this details
//export to database
module.exports = mongoose.model(
    "InventoryModel", //file name
    inventorySchema //function name
);