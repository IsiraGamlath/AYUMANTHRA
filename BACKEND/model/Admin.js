const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const adminSchema = new Schema({
  firstName: {
    type: String,
    required: true, // ✅ makes sure admin must have a first name
  },
  lastName: {
    type: String,
    required: true, // ✅ last name is also required
  },
  adminPhone: {
    type: String,
    required: true,
  },
  adminEmail: {
    type: String,
    required: true,
    unique: true, // ✅ usually admin emails should be unique
  },
  adminPassword: {
    type: String,
    required: true,
  },
  nic: {
    type: String,
    required: true,
    unique: true, // ✅ each admin must have a unique NIC
  },
  
  role: {
    type: String,
    default: 'admin', // ✅ useful if you want role-based access later
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Admin', adminSchema);
