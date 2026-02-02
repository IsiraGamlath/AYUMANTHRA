const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Appointment = require("../Model/appointmentModel");
const Availability = require("../Model/availabilityModel");
const Notification = require("../Model/notificationModel");
const { triggerReminders } = require("../services/reminderService");
const { sendBookingConfirmation, sendCancellationNotification, sendRescheduleNotification } = require("../services/autoNotificationService");
const { getUpcomingDigitalAppointments } = require("../Controllers/availabilityController");
const { authenticateAdmin } = require("../middleware/authMiddleware");

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

// IMPORTANT: Notification routes must come BEFORE dynamic :id routes
// to avoid Express capturing 'notifications' as a param.

// GET patient notifications (uses req.query.patientId)
router.get("/patient/notifications", async (req, res) => {
  try {
    const { patientId } = req.query;
    console.log('🔍 Fetching patient notifications for patientId:', patientId);
    if (!patientId) {
      return res.status(400).json({ message: "Patient ID is required" });
    }
    const notifications = await Notification.find({ patientId })
      .sort({ createdAt: -1 });
    console.log('📋 Found notifications:', notifications.length);
    const unreadCount = notifications.filter(n => !n.isRead).length;
    return res.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Error fetching patient notifications:", error);
    return res.status(500).json({ message: "Server error while fetching notifications" });
  }
});

// GET doctor notifications (uses req.query.doctorId)
router.get("/doctor/notifications", async (req, res) => {
  try {
    const { doctorId } = req.query;
    console.log('🔍 Fetching doctor notifications for doctorId:', doctorId);
    if (!doctorId) {
      return res.status(400).json({ message: "Doctor ID is required" });
    }
    const DoctorNotification = require("../Model/doctorNotificationModel");
    const notifications = await DoctorNotification.find({ doctorId })
      .sort({ createdAt: -1 });
    console.log('📋 Found notifications for doctor:', notifications.length);
    const unreadCount = notifications.filter(n => !n.isRead).length;
    return res.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Error fetching doctor notifications:", error);
    return res.status(500).json({ message: "Server error while fetching notifications" });
  }
});

// GET appointments for a specific patient - Public route
router.get("/patient/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;
    
    if (!patientId) {
      return res.status(400).json({ message: "Patient ID is required" });
    }
    
    const appointments = await Appointment.find({ patientId })
      .sort({ date: -1, time: -1 });
    
    // Transform the data to match frontend expectations
    const transformedAppointments = appointments.map(appointment => ({
      _id: appointment._id,
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      doctorId: appointment.doctorId,
      doctorName: appointment.doctorName,
      doctorSpecialization: appointment.doctorSpecialization,
      doctorFee: appointment.doctorFee,
      date: appointment.date,
      time: appointment.time,
      appointmentMode: appointment.appointmentMode,
      status: appointment.status,
      consultationLink: appointment.consultationLink,
      consultationSummaryPdf: appointment.consultationSummaryPdf,
      consultationSummaryFilename: appointment.consultationSummaryFilename,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt
    }));
    
    res.json(transformedAppointments);
  } catch (error) {
    console.error("Error fetching patient appointments:", error);
    res.status(500).json({ message: "Server error while fetching appointments" });
  }
});

// GET appointments for a specific doctor - Public route
router.get("/doctor/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    if (!doctorId) {
      return res.status(400).json({ message: "Doctor ID is required" });
    }
    
    const appointments = await Appointment.find({ doctorId })
      .sort({ date: -1, time: -1 });
    
    // Transform the data to match frontend expectations
    const transformedAppointments = appointments.map(appointment => ({
      _id: appointment._id,
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      patientAge: appointment.patientAge,
      phoneNumber: appointment.phoneNumber,
      doctorId: appointment.doctorId,
      doctorName: appointment.doctorName,
      doctorSpecialization: appointment.doctorSpecialization,
      doctorFee: appointment.doctorFee,
      date: appointment.date,
      time: appointment.time,
      appointmentMode: appointment.appointmentMode,
      status: appointment.status,
      consultationLink: appointment.consultationLink,
      consultationSummaryPdf: appointment.consultationSummaryPdf,
      consultationSummaryFilename: appointment.consultationSummaryFilename,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt
    }));
    
    res.json(transformedAppointments);
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    res.status(500).json({ message: "Server error while fetching appointments" });
  }
});

// GET all appointments (optionally filter by patientId or doctorId) - Admin only
router.get("/", authenticateAdmin, async (req, res) => {
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
    
    // Create notification records for patient and doctor
    try {
      console.log('🔔 Creating notifications for appointment:', newAppointment._id);
      console.log('🔔 Patient ID:', patientId);
      console.log('🔔 Doctor ID:', doctorId);
      
      // Upsert patient notification to avoid duplicates for same appointment/type
      const patientNotification = await Notification.findOneAndUpdate(
        {
          patientId: patientId,
          appointmentId: newAppointment._id,
          type: 'booking_confirmation'
        },
        {
          $set: {
            title: 'Appointment Confirmed',
            message: `Your appointment with ${doctorName} on ${date} at ${time} has been confirmed.`,
            phoneNumber: phoneNumber,
            isRead: false,
            sentViaConsole: true
          }
        },
        { upsert: true, new: true }
      );
      console.log('✅ Upserted patient notification:', patientNotification._id);

      // Create doctor notification using the doctor notification model
      const DoctorNotification = require("../Model/doctorNotificationModel");
      const doctorNotification = new DoctorNotification({
        doctorId: doctorId,
        appointmentId: newAppointment._id,
        type: 'booking_confirmation',
        title: 'New Appointment Booking',
        message: `New appointment booked by ${patientName} on ${date} at ${time}.`
      });
      await doctorNotification.save();
      console.log('✅ Created doctor notification:', doctorNotification._id);

      console.log('✅ Created notifications for patient and doctor');
    } catch (notificationError) {
      console.error('❌ Error creating notifications:', notificationError);
    }
    
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
    
    // Create notification records for rescheduling
    try {
      // Upsert patient notification to avoid duplicates for same appointment/type
      await Notification.findOneAndUpdate(
        {
          patientId: appointment.patientId,
          appointmentId: appointment._id,
          type: 'reschedule'
        },
        {
          $set: {
            title: 'Appointment Rescheduled',
            message: `Your appointment with ${appointment.doctorName} has been rescheduled from ${oldDate} ${oldTime} to ${date} ${time}.`,
            phoneNumber: appointment.phoneNumber,
            isRead: false,
            sentViaConsole: true
          }
        },
        { upsert: true, new: true }
      );

      // Create doctor notification
      const DoctorNotification = require("../Model/doctorNotificationModel");
      const doctorNotification = new DoctorNotification({
        doctorId: appointment.doctorId,
        appointmentId: appointment._id,
        type: 'reschedule',
        title: 'Appointment Rescheduled',
        message: `Appointment with ${appointment.patientName} has been rescheduled from ${oldDate} ${oldTime} to ${date} ${time}.`
      });
      await doctorNotification.save();

      console.log('✅ Created reschedule notifications for patient and doctor');
    } catch (notificationError) {
      console.error('Error creating reschedule notifications:', notificationError);
    }
    
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
    
    // Create notification records for cancellation
    try {
      // Upsert patient notification to avoid duplicates for same appointment/type
      await Notification.findOneAndUpdate(
        {
          patientId: appointment.patientId,
          appointmentId: appointment._id,
          type: 'cancellation'
        },
        {
          $set: {
            title: 'Appointment Cancelled',
            message: `Your appointment with ${appointment.doctorName} on ${appointment.date} at ${appointment.time} has been cancelled.`,
            phoneNumber: appointment.phoneNumber,
            isRead: false,
            sentViaConsole: true
          }
        },
        { upsert: true, new: true }
      );

      // Create doctor notification
      const DoctorNotification = require("../Model/doctorNotificationModel");
      const doctorNotification = new DoctorNotification({
        doctorId: appointment.doctorId,
        appointmentId: appointment._id,
        type: 'cancellation',
        title: 'Appointment Cancelled',
        message: `Appointment with ${appointment.patientName} on ${appointment.date} at ${appointment.time} has been cancelled.`
      });
      await doctorNotification.save();

      console.log('✅ Created cancellation notifications for patient and doctor');
    } catch (notificationError) {
      console.error('Error creating cancellation notifications:', notificationError);
    }
    
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
router.get("/upcoming-digital", authenticateAdmin, getUpcomingDigitalAppointments);

// GET digital appointments for a specific date - Admin only
router.get("/digital-by-date", authenticateAdmin, async (req, res) => {
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

// GET patient notifications
router.get("/patient/notifications", async (req, res) => {
  try {
    const { patientId } = req.query;
    
    console.log('🔍 Fetching patient notifications for patientId:', patientId);
    
    if (!patientId) {
      return res.status(400).json({ message: "Patient ID is required" });
    }
    
    const notifications = await Notification.find({ patientId })
      .sort({ createdAt: -1 });
    
    console.log('📋 Found notifications:', notifications.length);
    if (notifications.length > 0) {
      console.log('First notification:', notifications[0]);
    }
    
    const unreadCount = notifications.filter(n => !n.isRead).length;
    
    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Error fetching patient notifications:", error);
    res.status(500).json({ message: "Server error while fetching notifications" });
  }
});

// GET doctor notifications
router.get("/doctor/notifications", async (req, res) => {
  try {
    const { doctorId } = req.query;
    
    console.log('🔍 Fetching doctor notifications for doctorId:', doctorId);
    
    if (!doctorId) {
      return res.status(400).json({ message: "Doctor ID is required" });
    }
    
    // Use the DoctorNotification model directly
    const DoctorNotification = require("../Model/doctorNotificationModel");
    const notifications = await DoctorNotification.find({ doctorId })
      .sort({ createdAt: -1 });
    
    console.log('📋 Found notifications for doctor:', notifications.length);
    if (notifications.length > 0) {
      console.log('First notification:', notifications[0]);
    }
    
    const unreadCount = notifications.filter(n => !n.isRead).length;
    
    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Error fetching doctor notifications:", error);
    res.status(500).json({ message: "Server error while fetching notifications" });
  }
});

// Mark patient notification as read
router.put("/patient/notifications/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    res.json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark doctor notification as read
router.put("/doctor/notifications/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    
    const DoctorNotification = require("../Model/doctorNotificationModel");
    const notification = await DoctorNotification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    res.json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark all patient notifications as read
router.put("/patient/notifications/mark-all-read", async (req, res) => {
  try {
    const { patientId } = req.query;
    
    if (!patientId) {
      return res.status(400).json({ message: "Patient ID is required" });
    }
    
    await Notification.updateMany(
      { patientId, isRead: false },
      { isRead: true }
    );
    
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark all doctor notifications as read
router.put("/doctor/notifications/mark-all-read", async (req, res) => {
  try {
    const { doctorId } = req.query;
    
    if (!doctorId) {
      return res.status(400).json({ message: "Doctor ID is required" });
    }
    
    const DoctorNotification = require("../Model/doctorNotificationModel");
    await DoctorNotification.updateMany(
      { doctorId, isRead: false },
      { isRead: true }
    );
    
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
