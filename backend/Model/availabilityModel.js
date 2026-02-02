const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  time: { type: String, required: true },
  isBooked: { type: Boolean, default: false },
  bookedBy: { type: String, default: null }
});

const availabilitySchema = new mongoose.Schema({
  doctorId: { type: String, required: true },
  date: { type: String, required: true },
  slots: [slotSchema]
});

const Availability = mongoose.models.Availability || mongoose.model("Availability", availabilitySchema);
module.exports = Availability;
