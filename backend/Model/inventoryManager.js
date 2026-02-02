const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const inventoryManagerSchema = new Schema({
  firstName: {
    type: String,
    required: true, // ✅ inventory manager must have a first name
  },
  lastName: {
    type: String,
    required: true, // ✅ last name is required
  },
  managerPhone: {
    type: String,
    required: true,
  },
  managerEmail: {
    type: String,
    required: true,
    unique: true, // ✅ each inventory manager should have a unique email
  },
  managerPassword: {
    type: String,
    required: true,
  },
  nic: {
    type: String,
    required: true,
    unique: true, // ✅ each manager must have unique NIC
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('InventoryManager', inventoryManagerSchema);