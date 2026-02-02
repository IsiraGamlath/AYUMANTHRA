const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  doctorId: { type: String, required: true },
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  patientAge: { type: Number, required: true },
  phoneNumber: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  doctorFee: { type: Number, required: true },
  status: { type: String, default: "booked", enum: ["booked", "cancelled", "completed"] },
  doctorName: { type: String, required: true },
  doctorSpecialization: { type: String, required: true },
  reminderSent: { type: Boolean, default: false },
  twoHourReminderSent: { type: Boolean, default: false },
  // Consultation fields
  consultationLink: { type: String, default: "" },
  consultationSummaryPdf: { type: String, default: "" }, // File path or URL
  consultationSummaryFilename: { type: String, default: "" },
  // Appointment mode field
  appointmentMode: { type: String, default: "digital", enum: ["digital", "physical"] }
}, { timestamps: true });

// Add compound unique index to prevent duplicate appointments
// This ensures that a doctor cannot have multiple appointments with the same patient at the same date and time
appointmentSchema.index({ doctorId: 1, patientId: 1, date: 1, time: 1 }, { unique: true });

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;