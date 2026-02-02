const mongoose = require("mongoose");

const doctorNotificationSchema = new mongoose.Schema({
  doctorId: { type: String, required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  type: { 
    type: String, 
    required: true,
    enum: ['booking_confirmation', 'reminder_1day', 'reminder_2hour', 'cancellation', 'reschedule']
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  sentViaConsole: { type: Boolean, default: true }
}, { timestamps: true });

// Index for faster queries
doctorNotificationSchema.index({ doctorId: 1, createdAt: -1 });
doctorNotificationSchema.index({ isRead: 1 });

const DoctorNotification = mongoose.model("DoctorNotification", doctorNotificationSchema);
module.exports = DoctorNotification;