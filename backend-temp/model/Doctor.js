const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const doctorSchema = new Schema({
  doctorName: {
    type: String,
    required: true,
  },
  doctorPhone: {
    type: String,
    required: true,
  },
  doctorEmail: {
    type: String,
    required: true,
    unique: true, // usually doctors will have unique email
  },
  doctorPassword: {
    type: String,
    required: true,
  },
  specialization: {
    type: String,
    required: true,
  },
  experienceYears: {
    type: Number,
    required: true,
  },
  available: {
    type: Boolean,
    default: true,
  },
  
});

module.exports = mongoose.model('Doctor', doctorSchema);
