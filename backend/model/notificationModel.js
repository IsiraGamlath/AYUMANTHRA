import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  type: { 
    type: String, 
    required: true,
    enum: ['booking_confirmation', 'reminder_1day', 'reminder_2hour', 'cancellation', 'reschedule']
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  sentViaConsole: { type: Boolean, default: true },
  phoneNumber: { type: String, required: true }
}, { timestamps: true });

// Index for faster queries
notificationSchema.index({ patientId: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;