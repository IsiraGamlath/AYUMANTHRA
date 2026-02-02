const cron = require('node-cron');
const Appointment = require('../Model/appointmentModel');
const Notification = require('../Model/notificationModel');
const DoctorNotification = require('../Model/doctorNotificationModel');
const Doctor = require('../Model/doctorModel');
const { createBookingReminderMessage } = require('./smsService');

/**
 * Send reminder for a specific appointment to the doctor
 * @param {Object} appointment - Appointment object
 * @param {string} reminderType - Type of reminder ('1day', '2hour')
 * @returns {Promise<boolean>} - Success status
 */
const sendDoctorAppointmentReminder = async (appointment, reminderType = '1day') => {
  try {
    // Get doctor information
    const doctor = await Doctor.findOne({ doctorId: appointment.doctorId });
    
    if (!doctor) {
      console.log(`❌ Doctor not found for appointment ${appointment._id}`);
      return false;
    }
    
    // Create reminder message for doctor
    const doctorMessage = reminderType === '1day' 
      ? `Reminder: You have an appointment with ${appointment.patientName} tomorrow at ${appointment.time}.`
      : `Urgent: Your appointment with ${appointment.patientName} is in 2 hours at ${appointment.time}.`;
    
    // Display reminder content in console for admin monitoring
    const reminderIcon = reminderType === '1day' ? '📅' : '⏰';
    console.log('='.repeat(60));
    console.log(`${reminderIcon} DOCTOR ${reminderType.toUpperCase()} REMINDER`);
    console.log(`TO: Dr. ${doctor.name} (${doctor.email})`);
    console.log(`MESSAGE:`);
    console.log(doctorMessage);
    console.log('='.repeat(60));
    
    // Save reminder notification to database for doctor
    const reminderTitle = reminderType === '1day' ? 'Appointment Tomorrow' : 'Appointment in 2 Hours';
    
    await DoctorNotification.create({
      doctorId: appointment.doctorId,
      appointmentId: appointment._id,
      type: reminderType === '1day' ? 'reminder_1day' : 'reminder_2hour',
      title: reminderTitle,
      message: doctorMessage
    });
    
    console.log(`✅ Doctor ${reminderType} reminder saved for Dr. ${doctor.name} for appointment with ${appointment.patientName} on ${appointment.date}`);
    
    return true;
  } catch (error) {
    console.error(`Error processing doctor ${reminderType} reminder for appointment ${appointment._id}:`, error);
    return false;
  }
};

/**
 * Send reminder for a specific appointment
 * @param {Object} appointment - Appointment object
 * @param {string} reminderType - Type of reminder ('1day', '2hour', 'immediate')
 * @returns {Promise<boolean>} - Success status
 */
const sendAppointmentReminder = async (appointment, reminderType = '1day') => {
  try {
    const reminderMessage = createBookingReminderMessage(appointment, reminderType);
    
    // Display reminder content in console for admin monitoring
    const reminderIcon = reminderType === '1day' ? '📅' : '⏰';
    console.log('='.repeat(60));
    console.log(`${reminderIcon} ${reminderType.toUpperCase()} REMINDER`);
    console.log(`TO: ${appointment.patientName} (${appointment.phoneNumber})`);
    console.log(`MESSAGE:`);
    console.log(reminderMessage);
    console.log('='.repeat(60));
    
    // Mark appropriate reminder as sent
    if (reminderType === '1day') {
      appointment.reminderSent = true;
    } else if (reminderType === '2hour') {
      appointment.twoHourReminderSent = true;
    }
    await appointment.save();
    
    // Save reminder notification to database
    const reminderTitle = reminderType === '1day' ? 'Appointment Tomorrow' : 'Appointment in 2 Hours';
    const dbMessage = reminderType === '1day' 
      ? `Reminder: You have an appointment with ${appointment.doctorName} tomorrow at ${appointment.time}.`
      : `Urgent: Your appointment with ${appointment.doctorName} is in 2 hours at ${appointment.time}.`;
    
    await Notification.create({
      patientId: appointment.patientId,
      appointmentId: appointment._id,
      type: reminderType === '1day' ? 'reminder_1day' : 'reminder_2hour',
      title: reminderTitle,
      message: dbMessage,
      phoneNumber: appointment.phoneNumber
    });
    
    // Send reminder to doctor as well
    await sendDoctorAppointmentReminder(appointment, reminderType);
    
    console.log(`✅ ${reminderType} reminder saved for ${appointment.patientName} for appointment on ${appointment.date}`);
    return true;
  } catch (error) {
    console.error(`Error processing ${reminderType} reminder for ${appointment.patientName}:`, error);
    return false;
  }
};

/**
 * Send 2-hour advance reminders for today's appointments
 * @returns {Promise<Object>} - Summary of 2-hour reminders sent
 */
const send2HourReminders = async () => {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const currentTime = new Date();
    
    console.log(`Processing 2-hour advance reminders for today: ${todayStr} (Sri Lanka time)`);
    
    // Find today's appointments that need 2-hour reminders
    const appointments = await Appointment.find({
      date: todayStr,
      status: "booked",
      twoHourReminderSent: { $ne: true }
    });

    let remindersSent = 0;
    let remindersFailed = 0;
    
    for (const appointment of appointments) {
      // Parse appointment time
      const [timeStr] = appointment.time.split(' ');
      const [hour, minute] = timeStr.split(':').map(Number);
      
      // Create appointment datetime
      const appointmentDateTime = new Date(today);
      appointmentDateTime.setHours(hour, minute, 0, 0);
      
      // Check if appointment is within 2-3 hours from now
      const timeDiff = appointmentDateTime.getTime() - currentTime.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      // Send reminder if appointment is 2-3 hours away
      if (hoursDiff > 2 && hoursDiff <= 3) {
        const success = await sendAppointmentReminder(appointment, '2hour');
        if (success) {
          remindersSent++;
        } else {
          remindersFailed++;
        }
        
        // Add delay between messages
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const summary = {
      date: todayStr,
      totalChecked: appointments.length,
      remindersSent,
      remindersFailed,
      message: `Processed 2-hour reminders: ${remindersSent} sent, ${remindersFailed} failed`
    };

    console.log('2-hour reminder processing completed:', summary);
    return summary;
    
  } catch (error) {
    console.error('Error processing 2-hour reminders:', error);
    throw error;
  }
};

/**
 * Process all reminders for tomorrow's appointments
 * @returns {Promise<Object>} - Summary of reminders sent
 */
const processReminders = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    console.log(`Processing reminders for date: ${tomorrowStr} (Sri Lanka time)`);
    
    // Find appointments for tomorrow that haven't had reminders sent
    const appointments = await Appointment.find({
      date: tomorrowStr,
      status: "booked",
      reminderSent: false
    });

    console.log(`Found ${appointments.length} appointments needing reminders`);

    let remindersSent = 0;
    let remindersFailed = 0;
    
    for (const appointment of appointments) {
      const success = await sendAppointmentReminder(appointment, '1day');
      if (success) {
        remindersSent++;
      } else {
        remindersFailed++;
      }
      
      // Add small delay between messages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const summary = {
      date: tomorrowStr,
      totalAppointments: appointments.length,
      remindersSent,
      remindersFailed,
      message: `Processed ${appointments.length} appointments: ${remindersSent} reminders sent, ${remindersFailed} failed`
    };

    console.log('Reminder processing completed:', summary);
    return summary;
    
  } catch (error) {
    console.error('Error processing reminders:', error);
    throw error;
  }
};

/**
 * Schedule daily reminder job
 */
const scheduleReminders = () => {
  // Cron schedule: 6:00 PM daily for tomorrow's reminders (Sri Lanka time)
  const cronSchedule = '0 18 * * *'; // 6:00 PM daily
  const timezone = 'Asia/Colombo'; // Sri Lanka timezone (UTC+5:30)
  
  console.log(`Scheduling reminder service with cron: ${cronSchedule} (${timezone})`);
  
  // Schedule daily reminders for tomorrow's appointments (1 day before)
  cron.schedule(cronSchedule, async () => {
    console.log('🔔 Running daily reminder check for tomorrow\'s appointments...');
    
    try {
      const summary = await processReminders();
      console.log('✅ Daily reminder job completed successfully:', summary);
    } catch (error) {
      console.error('❌ Daily reminder job failed:', error.message);
    }
  }, {
    scheduled: true,
    timezone: timezone
  });
  
  // Schedule 2-hour advance reminders (runs every hour)
  cron.schedule('0 * * * *', async () => {
    console.log('🔔 Running 2-hour advance reminder check...');
    
    try {
      const summary = await send2HourReminders();
      if (summary.remindersSent > 0) {
        console.log('✅ 2-hour reminder job completed successfully:', summary);
      }
    } catch (error) {
      console.error('❌ 2-hour reminder job failed:', error.message);
    }
  }, {
    scheduled: true,
    timezone: timezone
  });
  
  console.log('✅ Reminder service scheduled successfully');
  console.log('- Daily reminders: 6:00 PM Sri Lanka time for tomorrow\'s appointments');
  console.log('- 2-hour advance reminders: Every hour for today\'s appointments');
};

/**
 * Manual trigger for testing reminders
 * @returns {Promise<Object>} - Summary of reminders sent
 */
const triggerReminders = async () => {
  console.log('🔔 Manually triggering reminder check...');
  return await processReminders();
};

/**
 * Manual trigger for testing 2-hour reminders
 * @returns {Promise<Object>} - Summary of 2-hour reminders sent
 */
const trigger2HourReminders = async () => {
  console.log('🔔 Manually triggering 2-hour reminder check...');
  return await send2HourReminders();
};

// Export using CommonJS
module.exports = scheduleReminders;
module.exports.send2HourReminders = send2HourReminders;
module.exports.processReminders = processReminders;
module.exports.triggerReminders = triggerReminders;
module.exports.trigger2HourReminders = trigger2HourReminders;