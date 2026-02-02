// Message creation service for notifications (No SMS sending)
// All messages are stored in database for frontend display

/**
 * Create booking confirmation message
 * @param {Object} appointment - Appointment object
 * @returns {string} - Formatted message
 */
export const createBookingConfirmationMessage = (appointment) => {
  return `APPOINTMENT CONFIRMED

Hello ${appointment.patientName},

Your appointment has been successfully booked!

APPOINTMENT DETAILS:
Doctor: ${appointment.doctorName}
Specialization: ${appointment.doctorSpecialization}
Date: ${appointment.date}
Time: ${appointment.time}
Fee: Rs. ${appointment.doctorFee}

Contact: ${appointment.phoneNumber}

Please arrive 10 minutes before your scheduled time.

Thank you for choosing our medical services!

This is an automated message. Please do not reply.`;
};

/**
 * Create booking reminder message
 * @param {Object} appointment - Appointment object
 * @param {string} reminderType - Type of reminder ('1day', '2hour', 'immediate')
 * @returns {string} - Formatted message
 */
export const createBookingReminderMessage = (appointment, reminderType = '1day') => {
  let timeText = '';
  let urgencyText = '';
  
  switch (reminderType) {
    case '1day':
      timeText = 'tomorrow';
      urgencyText = 'This is a friendly reminder about your upcoming appointment tomorrow!';
      break;
    case '2hour':
      timeText = 'in 2 hours';
      urgencyText = 'IMPORTANT: Your appointment is coming up in 2 hours!';
      break;
    case 'immediate':
      timeText = 'soon';
      urgencyText = 'URGENT: Your appointment is starting soon!';
      break;
    default:
      timeText = 'tomorrow';
      urgencyText = 'This is a friendly reminder about your upcoming appointment tomorrow!';
  }
  
  return `APPOINTMENT REMINDER

Hello ${appointment.patientName},

${urgencyText}

APPOINTMENT DETAILS:
Doctor: ${appointment.doctorName}
Specialization: ${appointment.doctorSpecialization}
Date: ${appointment.date}
Time: ${appointment.time}
Fee: Rs. ${appointment.doctorFee}

Please arrive 10 minutes before your scheduled time.

If you need to reschedule or cancel, please contact us immediately.

Thank you!

This is an automated reminder. Please do not reply.`;
};

/**
 * Create appointment cancellation message
 * @param {Object} appointment - Appointment object
 * @returns {string} - Formatted message
 */
export const createCancellationMessage = (appointment) => {
  return `APPOINTMENT CANCELLED

Hello ${appointment.patientName},

Your appointment has been cancelled successfully.

CANCELLED APPOINTMENT DETAILS:
Doctor: ${appointment.doctorName}
Date: ${appointment.date}
Time: ${appointment.time}

If you would like to book a new appointment, please contact us.

Thank you!

This is an automated message. Please do not reply.`;
};

/**
 * Create appointment reschedule message
 * @param {Object} appointment - Appointment object
 * @param {string} oldDate - Previous date
 * @param {string} oldTime - Previous time
 * @returns {string} - Formatted message
 */
export const createRescheduleMessage = (appointment, oldDate, oldTime) => {
  return `APPOINTMENT RESCHEDULED

Hello ${appointment.patientName},

Your appointment has been rescheduled successfully.

PREVIOUS APPOINTMENT:
Date: ${oldDate}
Time: ${oldTime}

NEW APPOINTMENT DETAILS:
Doctor: ${appointment.doctorName}
Specialization: ${appointment.doctorSpecialization}
Date: ${appointment.date}
Time: ${appointment.time}
Fee: Rs. ${appointment.doctorFee}

Please arrive 10 minutes before your scheduled time.

Thank you!

This is an automated message. Please do not reply.`;
};

export default {
  createBookingConfirmationMessage,
  createBookingReminderMessage,
  createCancellationMessage,
  createRescheduleMessage
};