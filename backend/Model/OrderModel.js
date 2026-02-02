const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    customerInfo: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        province: { type: String, required: true },
        country: { type: String, default: 'Sri Lanka' }
    },
    items: [{
        productId: { type: String, required: true },
        productName: String,
        productPrice: Number,
        quantity: { type: Number, required: true },
        weight: String,
        form: String,
        notes: String
    }],
    totals: {
        subtotal: { type: Number, required: true },
        shipping: { type: Number, required: true },
        tax: { type: Number, required: true },
        total: { type: Number, required: true }
    },
    paymentMethod: {
        type: String,
        enum: ['cash_on_delivery', 'bank_transfer'],
        required: true
    },
    orderNotes: { type: String, default: '' },
    orderStatus: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    trackingNumbers: [{ type: String }],
    orderDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model("OrderModel", orderSchema);