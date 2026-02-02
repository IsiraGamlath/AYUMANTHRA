const Availability = require("../Model/availabilityModel");
const Appointment = require("../Model/appointmentModel");
const Notification = require("../Model/notificationModel");
const DoctorNotification = require("../Model/doctorNotificationModel");
const Doctor = require("../Model/doctorModel");

// Generate 30-min slots from 9AM to 5PM
const generateSlots = () => {
  const slots = [];
  let hour = 9;
  let minute = 0;
  while (hour < 17 || (hour === 17 && minute === 0)) {
    const ampm = hour < 12 ? "AM" : "PM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const timeStr = `${displayHour.toString().padStart(2,"0")}:${minute === 0 ? "00" : minute} ${ampm}`;
    slots.push({ time: timeStr, isBooked: false, bookedBy: null });
    minute += 30;
    if (minute === 60) { hour++; minute = 0; }
  }
  return slots;
};

// Helper function to check if current time is after 5:30 PM
const isAfter530PM = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  return hours > 17 || (hours === 17 && minutes >= 30);
};

// Helper function to remove all available slots for today after 5:30 PM
const removeCurrentDaySlots = async (doctorId, date) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    if (date === today && isAfter530PM()) {
      const availability = await Availability.findOne({ doctorId, date });
      if (availability) {
        availability.slots = availability.slots.filter(slot => slot.isBooked);
        await availability.save();
        console.log(`Removed all available slots for ${date} after 5:30 PM`);
      }
    }
  } catch (error) {
    console.error('Error removing current day slots:', error);
  }
};

// GET weekly availability for a doctor
const getWeekAvailability = async (req, res) => {
  try {
    const { doctorId, startDate } = req.query;
    const weekDates = [];
    const start = new Date(startDate);

    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      weekDates.push(d.toISOString().split("T")[0]);
    }

    const availabilityArray = await Promise.all(
      weekDates.map(async (date) => {
        await removeCurrentDaySlots(doctorId, date);
        
        let availability = await Availability.findOne({ doctorId, date });
        if (!availability) {
          const today = new Date().toISOString().split('T')[0];
          if (date === today && isAfter530PM()) {
            availability = await Availability.create({ doctorId, date, slots: [] });
          } else {
            availability = await Availability.create({ doctorId, date, slots: generateSlots() });
          }
        }
        
        const now = new Date();
        let slotsUpdated = false;
        const updatedSlots = availability.slots.map(slot => {
          const plainSlot = slot.toObject ? slot.toObject() : slot;
          const slotTime = plainSlot.time;
          
          let time24 = slotTime;
          if (slotTime.includes("AM") || slotTime.includes("PM")) {
            const [timePart, period] = slotTime.split(" ");
            const [hours, minutes] = timePart.split(":");
            let hour24 = parseInt(hours);
            if (period === "PM" && hour24 !== 12) hour24 += 12;
            else if (period === "AM" && hour24 === 12) hour24 = 0;
            time24 = `${hour24.toString().padStart(2, "0")}:${minutes}`;
          }
          
          const slotDateTime = new Date(`${date}T${time24}`);
          const isPast = slotDateTime < now;
          
          console.log(`Slot ${slotTime} on ${date}: isPast=${isPast}, now=${now}, slotDateTime=${slotDateTime}`);
          
          if (isPast && !plainSlot.isBooked) {
            slot.isBooked = true;
            slot.bookedBy = 'past';
            slotsUpdated = true;
            console.log(`Marked slot ${slotTime} as past`);
          }
          
          return {
            time: slotTime,
            isBooked: plainSlot.isBooked || isPast,
            bookedBy: isPast && !plainSlot.isBooked ? 'past' : plainSlot.bookedBy
          };
        });
        
        if (slotsUpdated) {
          await availability.save();
          console.log(`Saved availability document with updated past slots for ${date}`);
        }
        
        const result = {
          ...availability.toObject(),
          slots: updatedSlots
        };
        console.log("Returning availability for date:", date, "with slots:", result.slots);
        return result;
      })
    );

    res.status(200).json(availabilityArray);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST book appointment 
const bookAppointment = async (req, res) => {
  try {
    const { doctorId, patientId, patientName, patientAge, date, time, doctorFee, appointmentMode } = req.body;

    // Fetch doctor details
    const doctor = await Doctor.findOne({ doctorId });
    const doctorName = doctor ? doctor.name : 'Unknown Doctor';
    const doctorSpec = doctor ? doctor.specialization : 'Doctor';

    let availability = await Availability.findOne({ doctorId, date });
    if (!availability) availability = await Availability.create({ doctorId, date, slots: generateSlots() });

    const slot = availability.slots.find((s) => s.time === time);
    if (!slot) return res.status(404).json({ message: "Slot not found" });
    if (slot.isBooked) return res.status(400).json({ message: "Slot already booked" });

    slot.isBooked = true;
    slot.bookedBy = patientId;
    await availability.save();

    const appointment = await Appointment.create({
      doctorId,
      patientId,
      patientName,
      patientAge,
      date,
      time,
      doctorFee,
      appointmentMode: appointmentMode || "digital"
    });

    // CREATE PATIENT NOTIFICATION
    try {
      await Notification.create({
        patientId,
        appointmentId: appointment._id,
        type: 'booking_confirmation',
        title: '✅ Appointment Confirmed',
        message: `Your appointment with Dr. ${doctorName} (${doctorSpec}) on ${date} at ${time} has been successfully confirmed.`,
        phoneNumber: 'N/A'
      });
      console.log(`✅ Patient notification created for ${patientName}`);
    } catch (err) {
      console.error('Error creating patient notification:', err);
    }

    // CREATE DOCTOR NOTIFICATION
    try {
      await DoctorNotification.create({
        doctorId,
        appointmentId: appointment._id,
        type: 'booking_confirmation',
        title: '📅 New Appointment Booked',
        message: `New appointment with ${patientName} (Age: ${patientAge}) scheduled for ${date} at ${time}.`
      });
      console.log(`✅ Doctor notification created for Dr. ${doctorName}`);
    } catch (err) {
      console.error('Error creating doctor notification:', err);
    }

    res.status(200).json({ message: "Appointment booked", appointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET patient-specific appointments
const getAppointments = async (req, res) => {
  try {
    const { patientId } = req.query;
    const appointments = await Appointment.find({ patientId }).populate("doctorId", "name specialization");
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT reschedule appointment
const rescheduleAppointment = async (req, res) => {
  try {
    const { doctorId, patientId, oldDate, oldTime, newDate, newTime } = req.body;

    const oldAvailability = await Availability.findOne({ doctorId, date: oldDate });
    if (!oldAvailability) return res.status(404).json({ message: "Old availability not found" });

    const oldSlot = oldAvailability.slots.find(s => s.time === oldTime && s.bookedBy === patientId);
    if (!oldSlot) return res.status(404).json({ message: "Old slot not found" });

    oldSlot.isBooked = false;
    oldSlot.bookedBy = null;
    await oldAvailability.save();

    let newAvailability = await Availability.findOne({ doctorId, date: newDate });
    if (!newAvailability) newAvailability = await Availability.create({ doctorId, date: newDate, slots: generateSlots() });

    const newSlot = newAvailability.slots.find(s => s.time === newTime);
    if (!newSlot || newSlot.isBooked) return res.status(400).json({ message: "New slot unavailable" });

    newSlot.isBooked = true;
    newSlot.bookedBy = patientId;
    await newAvailability.save();

    const appointment = await Appointment.findOneAndUpdate(
      { doctorId, patientId, date: oldDate, time: oldTime },
      { date: newDate, time: newTime },
      { new: true }
    );

    // CREATE PATIENT NOTIFICATION
    try {
      await Notification.create({
        patientId,
        appointmentId: appointment._id,
        type: 'reschedule',
        title: '🔄 Appointment Rescheduled',
        message: `Your appointment has been rescheduled from ${oldDate} at ${oldTime} to ${newDate} at ${newTime}.`,
        phoneNumber: 'N/A'
      });
      console.log(`✅ Patient reschedule notification created`);
    } catch (err) {
      console.error('Error creating patient reschedule notification:', err);
    }

    // CREATE DOCTOR NOTIFICATION
    try {
      await DoctorNotification.create({
        doctorId,
        appointmentId: appointment._id,
        type: 'reschedule',
        title: '🔄 Appointment Rescheduled',
        message: `Appointment rescheduled from ${oldDate} at ${oldTime} to ${newDate} at ${newTime}.`
      });
      console.log(`✅ Doctor reschedule notification created`);
    } catch (err) {
      console.error('Error creating doctor reschedule notification:', err);
    }

    res.status(200).json({ message: "Appointment rescheduled", appointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { doctorId, patientId, date, time } = req.body;

    const availability = await Availability.findOne({ doctorId, date });
    if (!availability) return res.status(404).json({ message: "Availability not found" });

    const slot = availability.slots.find(s => s.time === time && s.bookedBy === patientId);
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    slot.isBooked = false;
    slot.bookedBy = null;
    await availability.save();

    const appointment = await Appointment.findOneAndDelete({ doctorId, patientId, date, time });

    // CREATE PATIENT NOTIFICATION
    try {
      await Notification.create({
        patientId,
        appointmentId: appointment ? appointment._id : null,
        type: 'cancellation',
        title: '❌ Appointment Cancelled',
        message: `Your appointment scheduled for ${date} at ${time} has been cancelled.`,
        phoneNumber: 'N/A'
      });
      console.log(`✅ Patient cancellation notification created`);
    } catch (err) {
      console.error('Error creating patient cancellation notification:', err);
    }

    // CREATE DOCTOR NOTIFICATION
    try {
      await DoctorNotification.create({
        doctorId,
        appointmentId: appointment ? appointment._id : null,
        type: 'cancellation',
        title: '❌ Appointment Cancelled',
        message: `Appointment scheduled for ${date} at ${time} has been cancelled.`
      });
      console.log(`✅ Doctor cancellation notification created`);
    } catch (err) {
      console.error('Error creating doctor cancellation notification:', err);
    }

    res.status(200).json({ message: "Appointment cancelled" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST add single time slot
const addTimeSlot = async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;

    if (!doctorId || !date || !time) {
      return res.status(400).json({ message: "All fields required" });
    }

    let availability = await Availability.findOne({ doctorId, date });
    if (!availability) {
      availability = await Availability.create({ 
        doctorId, 
        date, 
        slots: [{ time, isBooked: false, bookedBy: null }] 
      });
    } else {
      const existingSlot = availability.slots.find(s => s.time === time);
      if (existingSlot) {
        return res.status(400).json({ message: "Time slot already exists" });
      }
      
      availability.slots.push({ time, isBooked: false, bookedBy: null });
      availability.slots.sort((a, b) => {
        const timeA = new Date(`1970-01-01 ${a.time}`);
        const timeB = new Date(`1970-01-01 ${b.time}`);
        return timeA - timeB;
      });
      await availability.save();
    }

    res.status(200).json({ message: `Time slot added successfully for doctor ${doctorId}`, availability });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE remove single time slot
const removeTimeSlot = async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;

    if (!doctorId || !date || !time) {
      return res.status(400).json({ message: "All fields required" });
    }

    const availability = await Availability.findOne({ doctorId, date });
    if (!availability) {
      return res.status(404).json({ message: "Availability not found" });
    }

    const slotIndex = availability.slots.findIndex(s => s.time === time);
    if (slotIndex === -1) {
      return res.status(404).json({ message: "Time slot not found" });
    }

    const slot = availability.slots[slotIndex];
    if (slot.isBooked) {
      return res.status(400).json({ message: "Cannot remove booked time slot" });
    }

    availability.slots.splice(slotIndex, 1);
    await availability.save();

    res.status(200).json({ message: `Time slot removed successfully for doctor ${doctorId}`, availability });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST remove all available slots for current day after 5:30 PM
const removeCurrentDaySlotsEndpoint = async (req, res) => {
  try {
    const { doctorId } = req.body;
    
    if (!doctorId) {
      return res.status(400).json({ message: "Doctor ID is required" });
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    if (!isAfter530PM()) {
      return res.status(400).json({ 
        message: "Slots can only be removed after 5:30 PM" 
      });
    }
    
    await removeCurrentDaySlots(doctorId, today);
    
    res.status(200).json({ 
      message: "All available slots for today have been removed",
      date: today,
      removedAt: new Date().toLocaleTimeString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET reminder status for appointments
const getReminderStatus = async (req, res) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    console.log('Querying appointments for:', tomorrowStr);
    
    const appointments = await Appointment.find({
      date: tomorrowStr,
      status: "booked"
    }).select('patientName date time reminderSent consultationLink consultationSummaryPdf consultationSummaryFilename appointmentMode');
    
    console.log('Found appointments:', appointments.length);
    console.log('Sample appointment fields:', appointments.length > 0 ? Object.keys(appointments[0].toObject()) : 'No appointments');
    
    const stats = {
      totalAppointments: appointments.length,
      remindersSent: appointments.filter(app => app.reminderSent).length,
      remindersNeeded: appointments.filter(app => !app.reminderSent).length,
      appointments: appointments
    };
    
    res.status(200).json(stats);
  } catch (err) {
    console.error('Error getting reminder status:', err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET all upcoming digital appointments
const getUpcomingDigitalAppointments = async (req, res) => {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const appointments = await Appointment.find({
      date: { $gte: todayStr },
      status: "booked",
      appointmentMode: "digital"
    }).select('_id patientName date time reminderSent consultationLink consultationSummaryPdf consultationSummaryFilename appointmentMode doctorName doctorId')
    .sort({ date: 1, time: 1 });
    
    console.log('Found upcoming digital appointments:', appointments.length);
    
    const stats = {
      totalAppointments: appointments.length,
      appointments: appointments
    };
    
    res.status(200).json(stats);
  } catch (err) {
    console.error('Error getting upcoming digital appointments:', err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getWeekAvailability,
  bookAppointment,
  getAppointments,
  rescheduleAppointment,
  cancelAppointment,
  addTimeSlot,
  removeTimeSlot,
  removeCurrentDaySlotsEndpoint,
  getReminderStatus,
  getUpcomingDigitalAppointments
};