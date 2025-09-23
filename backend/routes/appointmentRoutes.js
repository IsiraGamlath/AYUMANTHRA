import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Appointment from "../model/appointmentModel.js";
import Availability from "../model/availabilityModel.js";
import { triggerReminders } from "../services/reminderService.js";
import { sendBookingConfirmation, sendCancellationNotification, sendRescheduleNotification } from "../services/autoNotificationService.js";
import { getUpcomingDigitalAppointments } from "../controllers/availabilityController.js";

const router = express.Router();

// Configure multer for PDF upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/consultation-pdfs';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'consultation-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// GET all appointments (optionally filter by patientId or doctorId)
router.get("/", async (req, res) => {
  try {
    const { patientId, doctorId } = req.query;
    let filter = {};
    
    // Ensure that if doctorId is provided, only that doctor's appointments are returned
    if (patientId) {
      filter.patientId = patientId;
    } else if (doctorId) {
      filter.doctorId = doctorId;
    }
    
    const appointments = await Appointment.find(filter);
    console.log('📅 Fetched appointments:', appointments.length, 'items');
    if (appointments.length > 0) {
      console.log('First appointment time field:', appointments[0].time);
    }
    res.status(200).json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Generate 30-min slots from 9AM to 5PM (helper function)
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

// POST create a new appointment
router.post("/", async (req, res) => {
  try {
    const {
      doctorId,
      patientId,
      patientName,
      patientAge,
      phoneNumber,
      appointmentMode, // New field
      date,
      time,
      doctorFee,
      doctorName,
      doctorSpecialization
    } = req.body;

    if (!doctorId || !patientId || !patientName || !patientAge || !phoneNumber || !date || !time || !doctorFee || !doctorName || !doctorSpecialization) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 🔒 CRITICAL: Check availability and mark slot as booked
    let availability = await Availability.findOne({ doctorId, date });
    if (!availability) {
      availability = await Availability.create({ doctorId, date, slots: generateSlots() });
    }

    const slot = availability.slots.find((s) => s.time === time);
    if (!slot) {
      return res.status(404).json({ message: "Time slot not found" });
    }
    if (slot.isBooked) {
      return res.status(400).json({ message: "Time slot already booked" });
    }

    // Mark slot as booked BEFORE creating appointment
    slot.isBooked = true;
    slot.bookedBy = patientId;
    await availability.save();

    console.log(`✅ Marked slot ${time} on ${date} as booked for doctor ${doctorId}`);

    // Create appointment record
    const newAppointment = new Appointment({
      doctorId,
      patientId,
      patientName,
      patientAge,
      phoneNumber,
      appointmentMode: appointmentMode || "digital", // Default to digital if not provided
      date,
      time,
      doctorFee,
      doctorName,
      doctorSpecialization
    });

    await newAppointment.save();
    
    // Auto-send booking confirmation notification immediately
    try {
      await sendBookingConfirmation(newAppointment);
    } catch (smsError) {
      console.error('Auto-notification failed, but appointment was saved:', smsError);
    }
    
    res.status(201).json({ message: "Appointment booked successfully", appointment: newAppointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT reschedule an appointment
router.put("/:id/reschedule", async (req, res) => {
  try {
    const { date, time } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    const oldDate = appointment.date;
    const oldTime = appointment.time;
    
    // 🔒 CRITICAL: Handle availability slot changes
    
    // 1. Free up old slot
    const oldAvailability = await Availability.findOne({ 
      doctorId: appointment.doctorId, 
      date: oldDate 
    });
    
    if (oldAvailability) {
      const oldSlot = oldAvailability.slots.find(s => 
        s.time === oldTime && s.bookedBy === appointment.patientId
      );
      
      if (oldSlot) {
        oldSlot.isBooked = false;
        oldSlot.bookedBy = null;
        await oldAvailability.save();
        console.log(`✅ Freed up old slot ${oldTime} on ${oldDate}`);
      }
    }
    
    // 2. Book new slot
    let newAvailability = await Availability.findOne({ 
      doctorId: appointment.doctorId, 
      date: date 
    });
    
    if (!newAvailability) {
      newAvailability = await Availability.create({ 
        doctorId: appointment.doctorId, 
        date: date, 
        slots: generateSlots() 
      });
    }
    
    const newSlot = newAvailability.slots.find(s => s.time === time);
    if (!newSlot) {
      return res.status(404).json({ message: "New time slot not found" });
    }
    if (newSlot.isBooked) {
      return res.status(400).json({ message: "New time slot already booked" });
    }
    
    newSlot.isBooked = true;
    newSlot.bookedBy = appointment.patientId;
    await newAvailability.save();
    console.log(`✅ Booked new slot ${time} on ${date}`);
    
    // 3. Update appointment record
    appointment.date = date;
    appointment.time = time;
    appointment.reminderSent = false; // Reset reminder flag for new date
    appointment.twoHourReminderSent = false; // Reset 2-hour reminder flag
    await appointment.save();
    
    // Auto-send reschedule notification SMS
    try {
      await sendRescheduleNotification(appointment, oldDate, oldTime);
    } catch (smsError) {
      console.error('Auto-notification failed, but appointment was updated:', smsError);
    }
    
    res.status(200).json({ message: "Appointment rescheduled", appointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT cancel an appointment
router.put("/:id/cancel", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    // Free up the availability slot
    const availability = await Availability.findOne({ 
      doctorId: appointment.doctorId, 
      date: appointment.date 
    });
    
    if (availability) {
      const slot = availability.slots.find(s => 
        s.time === appointment.time && s.bookedBy === appointment.patientId
      );
      
      if (slot) {
        slot.isBooked = false;
        slot.bookedBy = null;
        await availability.save();
        console.log(`✅ Freed up slot ${appointment.time} on ${appointment.date} for doctor ${appointment.doctorId}`);
      }
    }

    appointment.status = "cancelled";
    await appointment.save();
    
    // Auto-send cancellation notification SMS
    try {
      await sendCancellationNotification(appointment);
    } catch (smsError) {
      console.error('Auto-notification failed, but appointment was cancelled:', smsError);
    }
    
    res.status(200).json({ message: "Appointment cancelled", appointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST manually trigger reminders (for testing)
router.post("/trigger-reminders", async (req, res) => {
  try {
    console.log('🔔 Manual reminder trigger requested');
    const summary = await triggerReminders();
    res.status(200).json({ 
      message: "Reminders processed successfully", 
      summary 
    });
  } catch (err) {
    console.error('Manual reminder trigger failed:', err);
    res.status(500).json({ message: "Failed to process reminders" });
  }
});

// GET reminder status for appointments
router.get("/reminder-status", async (req, res) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    console.log('Querying appointments for:', tomorrowStr);
    
    const appointments = await Appointment.find({
      date: tomorrowStr,
      status: "booked"
    }).select('_id patientName date time reminderSent consultationLink consultationSummaryPdf consultationSummaryFilename appointmentMode');
    
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
});

// GET all upcoming digital appointments
router.get("/upcoming-digital", getUpcomingDigitalAppointments);

// GET digital appointments for a specific date
router.get("/digital-by-date", async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ message: "Date parameter is required" });
    }

    // Find all digital appointments for the specified date that are booked
    const appointments = await Appointment.find({
      date: date,
      status: "booked",
      appointmentMode: "digital"
    }).select('_id patientName date time reminderSent consultationLink consultationSummaryPdf consultationSummaryFilename appointmentMode doctorName doctorId')
    .sort({ time: 1 });
    
    console.log('Found digital appointments for date:', date, appointments.length);
    
    const stats = {
      totalAppointments: appointments.length,
      appointments: appointments
    };
    
    res.status(200).json(stats);
  } catch (err) {
    console.error('Error getting digital appointments by date:', err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT update consultation link
router.put("/:id/consultation-link", async (req, res) => {
  try {
    const { consultationLink } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    // Check if appointment is in the past
    try {
      const appointmentDate = new Date(appointment.date);
      const [timeStr, period] = appointment.time.split(' ');
      const [hours, minutes] = timeStr.split(':').map(Number);
      
      let hour24 = hours;
      if (period === 'PM' && hours !== 12) {
        hour24 = hours + 12;
      } else if (period === 'AM' && hours === 12) {
        hour24 = 0;
      }
      
      appointmentDate.setHours(hour24, minutes, 0, 0);
      const isPastAppointment = appointmentDate <= new Date();
      
      if (isPastAppointment) {
        return res.status(400).json({ message: "Cannot update consultation link for past appointments" });
      }
    } catch (error) {
      console.error('Error parsing appointment date/time:', error);
      // If there's an error parsing, we'll allow the update to maintain backward compatibility
    }

    appointment.consultationLink = consultationLink;
    await appointment.save();
    
    // Select the same fields as other appointment endpoints for consistency
    const updatedAppointment = await Appointment.findById(appointment._id)
      .select('_id patientName date time reminderSent consultationLink consultationSummaryPdf consultationSummaryFilename appointmentMode doctorName doctorId');
    
    res.status(200).json({ message: "Consultation link updated", appointment: updatedAppointment });
  } catch (err) {
    console.error('Error updating consultation link:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST upload consultation summary PDF
router.post("/:id/upload-pdf", upload.single('consultationPdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No PDF file uploaded" });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      // Delete uploaded file if appointment not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Delete old file if exists
    if (appointment.consultationSummaryPdf && fs.existsSync(appointment.consultationSummaryPdf)) {
      fs.unlinkSync(appointment.consultationSummaryPdf);
    }

    appointment.consultationSummaryPdf = req.file.path;
    appointment.consultationSummaryFilename = req.file.originalname;
    await appointment.save();
    
    res.status(200).json({ 
      message: "Consultation summary PDF uploaded successfully", 
      appointment,
      filename: req.file.originalname
    });
  } catch (err) {
    console.error(err);
    // Delete uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: "Server error" });
  }
});

// GET download consultation summary PDF
router.get("/:id/download-pdf", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    
    if (!appointment.consultationSummaryPdf || !fs.existsSync(appointment.consultationSummaryPdf)) {
      return res.status(404).json({ message: "Consultation summary PDF not found" });
    }

    const filename = appointment.consultationSummaryFilename || 'consultation-summary.pdf';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.sendFile(path.resolve(appointment.consultationSummaryPdf));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE remove consultation summary PDF
router.delete("/:id/remove-pdf", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    
    if (!appointment.consultationSummaryPdf) {
      return res.status(404).json({ message: "No consultation summary PDF to remove" });
    }

    // Delete the file from filesystem
    if (fs.existsSync(appointment.consultationSummaryPdf)) {
      fs.unlinkSync(appointment.consultationSummaryPdf);
    }

    // Clear PDF fields in database
    appointment.consultationSummaryPdf = "";
    appointment.consultationSummaryFilename = "";
    await appointment.save();
    
    res.status(200).json({ message: "Consultation summary PDF removed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST sync existing appointments with availability (fix data)
router.post("/sync-availability", async (req, res) => {
  try {
    console.log('🔄 Starting appointment-availability sync...');
    
    // Get all active appointments
    const appointments = await Appointment.find({ status: { $ne: 'cancelled' } });
    let syncedCount = 0;
    
    for (const appointment of appointments) {
      // Find or create availability for this doctor/date
      let availability = await Availability.findOne({ 
        doctorId: appointment.doctorId, 
        date: appointment.date 
      });
      
      if (!availability) {
        availability = await Availability.create({ 
          doctorId: appointment.doctorId, 
          date: appointment.date, 
          slots: generateSlots() 
        });
      }
      
      // Find the slot for this appointment
      const slot = availability.slots.find(s => s.time === appointment.time);
      
      if (slot && !slot.isBooked) {
        // Mark slot as booked
        slot.isBooked = true;
        slot.bookedBy = appointment.patientId;
        await availability.save();
        syncedCount++;
        console.log(`✅ Synced: ${appointment.patientName} - ${appointment.date} ${appointment.time}`);
      }
    }
    
    console.log(`🎉 Sync completed! Updated ${syncedCount} availability slots.`);
    res.status(200).json({ 
      message: `Sync completed successfully. Updated ${syncedCount} availability slots.`,
      syncedCount 
    });
  } catch (err) {
    console.error('Sync failed:', err);
    res.status(500).json({ message: "Sync failed", error: err.message });
  }
});

export default router;
