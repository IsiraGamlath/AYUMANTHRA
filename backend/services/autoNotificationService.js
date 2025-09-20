import { createBookingConfirmationMessage } from './smsService.js';
import Notification from '../model/notificationModel.js';

/**
 * Auto-send booking confirmation immediately after appointment creation
 * @param {Object} appointment - Appointment object
 * @returns {Promise<boolean>} - Success status
 */
export const sendBookingConfirmation = async (appointment) => {
  try {
    console.log(`📱 Auto-sending booking confirmation to ${appointment.patientName}...`);
    
    const confirmationMessage = createBookingConfirmationMessage(appointment);
    
    // Display notification content in console for admin monitoring
    console.log('='.repeat(60));
    console.log(`📱 BOOKING CONFIRMATION`);
    console.log(`TO: ${appointment.patientName} (${appointment.phoneNumber})`);
    console.log(`MESSAGE:`);
    console.log(confirmationMessage);
    console.log('='.repeat(60));
    
    // Save notification to database for patient to see
    await Notification.create({
      patientId: appointment.patientId,
      appointmentId: appointment._id,
      type: 'booking_confirmation',
      title: 'Appointment Confirmed',
      message: `Your appointment with ${appointment.doctorName} on ${appointment.date} at ${appointment.time} has been confirmed.`,
      phoneNumber: appointment.phoneNumber
    });
    
    console.log(`✅ Booking confirmation notification saved for ${appointment.patientName}`);
    return true;
  } catch (error) {
    console.error(`Error processing booking confirmation for ${appointment.patientName}:`, error);
    return false;
  }
};

/**
 * Auto-send cancellation notification
 * @param {Object} appointment - Appointment object  
 * @returns {Promise<boolean>} - Success status
 */
export const sendCancellationNotification = async (appointment) => {
  try {
    console.log(`📱 Auto-sending cancellation notification to ${appointment.patientName}...`);
    
    const { createCancellationMessage } = await import('./smsService.js');
    const cancellationMessage = createCancellationMessage(appointment);
    
    // Display notification content in console for admin monitoring
    console.log('='.repeat(60));
    console.log(`❌ CANCELLATION NOTIFICATION`);
    console.log(`TO: ${appointment.patientName} (${appointment.phoneNumber})`);
    console.log(`MESSAGE:`);
    console.log(cancellationMessage);
    console.log('='.repeat(60));
    
    // Save notification to database
    await Notification.create({
      patientId: appointment.patientId,
      appointmentId: appointment._id,
      type: 'cancellation',
      title: 'Appointment Cancelled',
      message: `Your appointment with ${appointment.doctorName} on ${appointment.date} at ${appointment.time} has been cancelled.`,
      phoneNumber: appointment.phoneNumber
    });
    
    console.log(`✅ Cancellation notification saved for ${appointment.patientName}`);
    return true;
  } catch (error) {
    console.error(`Error processing cancellation notification for ${appointment.patientName}:`, error);
    return false;
  }
};

/**
 * Auto-send reschedule notification
 * @param {Object} appointment - Updated appointment object
 * @param {string} oldDate - Previous date
 * @param {string} oldTime - Previous time
 * @returns {Promise<boolean>} - Success status
 */
export const sendRescheduleNotification = async (appointment, oldDate, oldTime) => {
  try {
    console.log(`📱 Auto-sending reschedule notification to ${appointment.patientName}...`);
    
    const { createRescheduleMessage } = await import('./smsService.js');
    const rescheduleMessage = createRescheduleMessage(appointment, oldDate, oldTime);
    
    // Display notification content in console for admin monitoring
    console.log('='.repeat(60));
    console.log(`🔄 RESCHEDULE NOTIFICATION`);
    console.log(`TO: ${appointment.patientName} (${appointment.phoneNumber})`);
    console.log(`MESSAGE:`);
    console.log(rescheduleMessage);
    console.log('='.repeat(60));
    
    // Save notification to database
    await Notification.create({
      patientId: appointment.patientId,
      appointmentId: appointment._id,
      type: 'reschedule',
      title: 'Appointment Rescheduled',
      message: `Your appointment with ${appointment.doctorName} has been rescheduled from ${oldDate} ${oldTime} to ${appointment.date} ${appointment.time}.`,
      phoneNumber: appointment.phoneNumber
    });
    
    console.log(`✅ Reschedule notification saved for ${appointment.patientName}`);
    return true;
  } catch (error) {
    console.error(`Error processing reschedule notification for ${appointment.patientName}:`, error);
    return false;
  }
};

export default {
  sendBookingConfirmation,
  sendCancellationNotification,
  sendRescheduleNotification
};