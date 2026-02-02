// Sample notification data for testing all notification systems
const NotificationService = require('./notificationService');

class SampleNotificationData {
  // Create sample patient notifications
  static async createSamplePatientNotifications(patientId, phoneNumber) {
    try {
      const sampleNotifications = [
        {
          type: 'booking_confirmation',
          title: 'Appointment Confirmed',
          message: 'Your appointment with Dr. Smith on 2025-01-15 at 10:00 AM has been confirmed.',
          phoneNumber: phoneNumber
        },
        {
          type: 'reminder_1day',
          title: 'Appointment Reminder',
          message: 'Reminder: You have an appointment with Dr. Smith tomorrow at 10:00 AM.',
          phoneNumber: phoneNumber
        },
        {
          type: 'reminder_2hour',
          title: 'Appointment Starting Soon',
          message: 'Your appointment with Dr. Smith starts in 2 hours at 10:00 AM.',
          phoneNumber: phoneNumber
        },
        {
          type: 'reschedule',
          title: 'Appointment Rescheduled',
          message: 'Your appointment with Dr. Smith has been rescheduled to 2025-01-16 at 2:00 PM.',
          phoneNumber: phoneNumber
        },
        {
          type: 'cancellation',
          title: 'Appointment Cancelled',
          message: 'Your appointment with Dr. Smith on 2025-01-15 at 10:00 AM has been cancelled.',
          phoneNumber: phoneNumber
        }
      ];

      const createdNotifications = [];
      for (const notificationData of sampleNotifications) {
        const notification = await NotificationService.createPatientNotification(
          patientId,
          null, // No appointment ID for sample data
          notificationData.type,
          notificationData.title,
          notificationData.message,
          notificationData.phoneNumber
        );
        createdNotifications.push(notification);
      }

      console.log('✅ Created sample patient notifications:', createdNotifications.length);
      return createdNotifications;
    } catch (error) {
      console.error('❌ Error creating sample patient notifications:', error);
      throw error;
    }
  }

  // Create sample doctor notifications
  static async createSampleDoctorNotifications(doctorId) {
    try {
      const sampleNotifications = [
        {
          type: 'booking_confirmation',
          title: 'New Appointment Booking',
          message: 'New appointment booked by John Doe on 2025-01-15 at 10:00 AM.'
        },
        {
          type: 'booking_confirmation',
          title: 'New Appointment Booking',
          message: 'New appointment booked by Jane Smith on 2025-01-16 at 2:00 PM.'
        },
        {
          type: 'reschedule',
          title: 'Appointment Rescheduled',
          message: 'Appointment with John Doe has been rescheduled to 2025-01-17 at 11:00 AM.'
        },
        {
          type: 'cancellation',
          title: 'Appointment Cancelled',
          message: 'Appointment with Jane Smith on 2025-01-16 at 2:00 PM has been cancelled.'
        }
      ];

      const createdNotifications = [];
      for (const notificationData of sampleNotifications) {
        const notification = await NotificationService.createDoctorNotification(
          doctorId,
          null, // No appointment ID for sample data
          notificationData.type,
          notificationData.title,
          notificationData.message
        );
        createdNotifications.push(notification);
      }

      console.log('✅ Created sample doctor notifications:', createdNotifications.length);
      return createdNotifications;
    } catch (error) {
      console.error('❌ Error creating sample doctor notifications:', error);
      throw error;
    }
  }

  // Create sample supplier notifications
  static async createSampleSupplierNotifications(supplierId) {
    try {
      // For sample data, we'll create mock stock IDs and supplier IDs
      const mongoose = require('mongoose');
      
      // Create a mock stock ID (ObjectId)
      const mockStockId = new mongoose.Types.ObjectId();
      
      // Convert supplierId to ObjectId if it's a string
      let supplierObjectId;
      if (typeof supplierId === 'string') {
        supplierObjectId = new mongoose.Types.ObjectId();
      } else {
        supplierObjectId = supplierId;
      }

      const sampleNotifications = [
        {
          type: 'low-stock',
          message: 'Ashwagandha powder is running low (5 units remaining)',
          quantity: 5,
          category: 'Herbs',
          supplierName: 'Herbal Supplies Ltd'
        },
        {
          type: 'expiring-soon',
          message: 'Turmeric capsules will expire in 30 days (100 units)',
          quantity: 100,
          category: 'Supplements',
          supplierName: 'Herbal Supplies Ltd'
        },
        {
          type: 'low-stock',
          message: 'Brahmi tablets are running low (3 units remaining)',
          quantity: 3,
          category: 'Herbs',
          supplierName: 'Herbal Supplies Ltd'
        }
      ];

      const createdNotifications = [];
      for (const notificationData of sampleNotifications) {
        const notification = await NotificationService.createSupplierNotification(
          mockStockId, // Use mock stock ID
          notificationData.type,
          notificationData.message,
          notificationData.quantity,
          notificationData.category,
          supplierObjectId, // Use ObjectId
          notificationData.supplierName
        );
        createdNotifications.push(notification);
      }

      console.log('✅ Created sample supplier notifications:', createdNotifications.length);
      return createdNotifications;
    } catch (error) {
      console.error('❌ Error creating sample supplier notifications:', error);
      throw error;
    }
  }

  // Create all sample notifications (without supplier notifications for now)
  static async createAllSampleNotifications(patientId, doctorId, supplierId, phoneNumber = "0771234567") {
    try {
      console.log('🔔 Creating all sample notifications...');
      
      const patientNotifications = await this.createSamplePatientNotifications(patientId, phoneNumber);
      const doctorNotifications = await this.createSampleDoctorNotifications(doctorId);
      
      // Skip supplier notifications for now to avoid ObjectId issues
      let supplierNotifications = [];
      try {
        supplierNotifications = await this.createSampleSupplierNotifications(supplierId);
      } catch (supplierError) {
        console.log('⚠️ Skipping supplier notifications due to ObjectId requirements:', supplierError.message);
        supplierNotifications = [];
      }

      console.log('✅ All sample notifications created successfully!');
      return {
        patientNotifications,
        doctorNotifications,
        supplierNotifications
      };
    } catch (error) {
      console.error('❌ Error creating all sample notifications:', error);
      throw error;
    }
  }
}

module.exports = SampleNotificationData;
