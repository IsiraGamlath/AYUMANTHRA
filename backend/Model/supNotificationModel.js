// backend/Models/notificationModel.js
const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  stockId: { type: mongoose.Schema.Types.ObjectId, ref: "InventoryModel", required: true },
  type: { type: String, enum: ["low-stock", "expiring-soon"], required: true },
  message: { type: String, required: true },
  quantity: { type: Number },
  category: { type: String, required: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
  supplierName: { type: String },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("SupplierNotification", NotificationSchema);
