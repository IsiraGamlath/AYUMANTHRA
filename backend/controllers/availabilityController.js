import Availability from "../model/availabilityModel.js";
import Appointment from "../model/appointmentModel.js";

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
    
    // Only remove slots if it's the current date and after 5:30 PM
    if (date === today && isAfter530PM()) {
      const availability = await Availability.findOne({ doctorId, date });
      if (availability) {
        // Remove all slots that are not booked
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
export const getWeekAvailability = async (req, res) => {
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
        // Remove current day slots if after 5:30 PM
        await removeCurrentDaySlots(doctorId, date);
        
        let availability = await Availability.findOne({ doctorId, date });
        if (!availability) {
          // Don't create slots for today if after 5:30 PM
          const today = new Date().toISOString().split('T')[0];
          if (date === today && isAfter530PM()) {
            availability = await Availability.create({ doctorId, date, slots: [] });
          } else {
            availability = await Availability.create({ doctorId, date, slots: generateSlots() });
          }
        }
        
        // Mark past slots as unavailable
        const now = new Date();
        let slotsUpdated = false;
        const updatedSlots = availability.slots.map(slot => {
          // Convert Mongoose subdocument to plain object
          const plainSlot = slot.toObject ? slot.toObject() : slot;
          const slotTime = plainSlot.time;
          
          // Convert slot time to 24-hour format for comparison
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
          
          // Log for debugging
          console.log(`Slot ${slotTime} on ${date}: isPast=${isPast}, now=${now}, slotDateTime=${slotDateTime}`);
          
          // If slot is past and not booked, mark it as booked by 'past' to prevent booking
          if (isPast && !plainSlot.isBooked) {
            // Update the actual slot in the availability document
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
        
        // Save the availability document if any slots were updated
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
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, patientId, patientName, patientAge, date, time, doctorFee, appointmentMode } = req.body;

    // Find availability
    let availability = await Availability.findOne({ doctorId, date });
    if (!availability) availability = await Availability.create({ doctorId, date, slots: generateSlots() });

    const slot = availability.slots.find((s) => s.time === time);
    if (!slot) return res.status(404).json({ message: "Slot not found" });
    if (slot.isBooked) return res.status(400).json({ message: "Slot already booked" });

    // Mark slot as booked
    slot.isBooked = true;
    slot.bookedBy = patientId;
    await availability.save();

    // Create appointment
    const appointment = await Appointment.create({
      doctorId,
      patientId,
      patientName,
      patientAge,
      date,
      time,
      doctorFee,
      appointmentMode: appointmentMode || "digital" // Default to digital if not provided
    });

    res.status(200).json({ message: "Appointment booked", appointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET patient-specific appointments
export const getAppointments = async (req, res) => {
  try {
    const { patientId } = req.query;

    const appointments = await Appointment.find({ patientId }).populate("doctorId", "name specialization");

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT reschedule appointment
export const rescheduleAppointment = async (req, res) => {
  try {
    const { doctorId, patientId, oldDate, oldTime, newDate, newTime } = req.body;

    // Free old slot
    const oldAvailability = await Availability.findOne({ doctorId, date: oldDate });
    if (!oldAvailability) return res.status(404).json({ message: "Old availability not found" });

    const oldSlot = oldAvailability.slots.find(s => s.time === oldTime && s.bookedBy === patientId);
    if (!oldSlot) return res.status(404).json({ message: "Old slot not found" });

    oldSlot.isBooked = false;
    oldSlot.bookedBy = null;
    await oldAvailability.save();

    // Book new slot
    let newAvailability = await Availability.findOne({ doctorId, date: newDate });
    if (!newAvailability) newAvailability = await Availability.create({ doctorId, date: newDate, slots: generateSlots() });

    const newSlot = newAvailability.slots.find(s => s.time === newTime);
    if (!newSlot || newSlot.isBooked) return res.status(400).json({ message: "New slot unavailable" });

    newSlot.isBooked = true;
    newSlot.bookedBy = patientId;
    await newAvailability.save();

    // Update appointment
    const appointment = await Appointment.findOneAndUpdate(
      { doctorId, patientId, date: oldDate, time: oldTime },
      { date: newDate, time: newTime },
      { new: true }
    );

    res.status(200).json({ message: "Appointment rescheduled", appointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE cancel appointment
export const cancelAppointment = async (req, res) => {
  try {
    const { doctorId, patientId, date, time } = req.body;

    const availability = await Availability.findOne({ doctorId, date });
    if (!availability) return res.status(404).json({ message: "Availability not found" });

    const slot = availability.slots.find(s => s.time === time && s.bookedBy === patientId);
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    // Free slot
    slot.isBooked = false;
    slot.bookedBy = null;
    await availability.save();

    // Delete appointment
    await Appointment.findOneAndDelete({ doctorId, patientId, date, time });

    res.status(200).json({ message: "Appointment cancelled" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST add single time slot
export const addTimeSlot = async (req, res) => {
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
      // Check if slot already exists
      const existingSlot = availability.slots.find(s => s.time === time);
      if (existingSlot) {
        return res.status(400).json({ message: "Time slot already exists" });
      }
      
      // Add new slot and sort by time
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
export const removeTimeSlot = async (req, res) => {
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

    // Remove the slot
    availability.slots.splice(slotIndex, 1);
    await availability.save();

    res.status(200).json({ message: `Time slot removed successfully for doctor ${doctorId}`, availability });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST remove all available slots for current day after 5:30 PM
export const removeCurrentDaySlotsEndpoint = async (req, res) => {
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
export const getReminderStatus = async (req, res) => {
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
export const getUpcomingDigitalAppointments = async (req, res) => {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Find all appointments from today onwards that are digital and booked
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
