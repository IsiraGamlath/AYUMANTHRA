const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const supplierSchema = new Schema({
  supplierName: { type: String, required: true },
  supplierPhone: { type: String, required: true },
  supplierEmail: { type: String, required: true, unique: true },
  supplierPassword: { type: String, required: true }, // plain password
  companyName: { type: String, required: true },
  address: { type: String, required: true },
  supplyCategory: { type: String, required: true },
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);