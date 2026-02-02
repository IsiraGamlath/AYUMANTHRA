const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  doctorId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  specialization: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  consultationFee: {
    type: Number,
    required: true,
  },
  // New field to specify the appointment modes this doctor supports
  supportedAppointmentModes: {
    type: [String],
    enum: ['digital', 'physical'],
    default: ['digital', 'physical'] // By default, doctors support both modes
  }
}, { timestamps: true });

module.exports = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);