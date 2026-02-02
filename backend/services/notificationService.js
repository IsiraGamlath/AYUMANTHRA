// Comprehensive notification service for all notification types
const Notification = require("../Model/notificationModel");
const DoctorNotification = require("../Model/doctorNotificationModel");
const SupplierNotification = require("../Model/supNotificationModel");

class NotificationService {
  // Create patient notification
  static async createPatientNotification(patientId, appointmentId, type, title, message, phoneNumber) {
    try {
      const notification = new Notification({
        patientId,
        appointmentId,
        type,
        title,
        message,
        phoneNumber
      });
      await notification.save();
      console.log('✅ Created patient notification:', notification._id);
      return notification;
    } catch (error) {
      console.error('❌ Error creating patient notification:', error);
      throw error;
    }
  }

  // Create doctor notification
  static async createDoctorNotification(doctorId, appointmentId, type, title, message) {
    try {
      const notification = new DoctorNotification({
        doctorId,
        appointmentId,
        type,
        title,
        message
      });
      await notification.save();
      console.log('✅ Created doctor notification:', notification._id);
      return notification;
    } catch (error) {
      console.error('❌ Error creating doctor notification:', error);
      throw error;
    }
  }

  // Create supplier notification
  static async createSupplierNotification(stockId, type, message, quantity, category, supplierId, supplierName) {
    try {
      const notification = new SupplierNotification({
        stockId,
        type,
        message,
        quantity,
        category,
        supplierId,
        supplierName
      });
      await notification.save();
      console.log('✅ Created supplier notification:', notification._id);
      return notification;
    } catch (error) {
      console.error('❌ Error creating supplier notification:', error);
      throw error;
    }
  }

  // Get patient notifications
  static async getPatientNotifications(patientId) {
    try {
      const notifications = await Notification.find({ patientId })
        .sort({ createdAt: -1 });
      const unreadCount = notifications.filter(n => !n.isRead).length;
      return { notifications, unreadCount };
    } catch (error) {
      console.error('❌ Error fetching patient notifications:', error);
      throw error;
    }
  }

  // Get doctor notifications
  static async getDoctorNotifications(doctorId) {
    try {
      const notifications = await DoctorNotification.find({ doctorId })
        .sort({ createdAt: -1 });
      const unreadCount = notifications.filter(n => !n.isRead).length;
      return { notifications, unreadCount };
    } catch (error) {
      console.error('❌ Error fetching doctor notifications:', error);
      throw error;
    }
  }

  // Get supplier notifications
  static async getSupplierNotifications(supplierId) {
    try {
      const notifications = await SupplierNotification.find({ supplierId })
        .populate('stockId')
        .sort({ createdAt: -1 });
      const unreadCount = notifications.filter(n => !n.read).length;
      return { notifications, unreadCount };
    } catch (error) {
      console.error('❌ Error fetching supplier notifications:', error);
      throw error;
    }
  }

  // Mark patient notification as read
  static async markPatientNotificationAsRead(notificationId) {
    try {
      const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
      );
      return notification;
    } catch (error) {
      console.error('❌ Error marking patient notification as read:', error);
      throw error;
    }
  }

  // Mark doctor notification as read
  static async markDoctorNotificationAsRead(notificationId) {
    try {
      const notification = await DoctorNotification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
      );
      return notification;
    } catch (error) {
      console.error('❌ Error marking doctor notification as read:', error);
      throw error;
    }
  }

  // Mark supplier notification as read
  static async markSupplierNotificationAsRead(notificationId) {
    try {
      const notification = await SupplierNotification.findByIdAndUpdate(
        notificationId,
        { read: true },
        { new: true }
      );
      return notification;
    } catch (error) {
      console.error('❌ Error marking supplier notification as read:', error);
      throw error;
    }
  }

  // Mark all patient notifications as read
  static async markAllPatientNotificationsAsRead(patientId) {
    try {
      await Notification.updateMany(
        { patientId, isRead: false },
        { isRead: true }
      );
      return { message: "All patient notifications marked as read" };
    } catch (error) {
      console.error('❌ Error marking all patient notifications as read:', error);
      throw error;
    }
  }

  // Mark all doctor notifications as read
  static async markAllDoctorNotificationsAsRead(doctorId) {
    try {
      await DoctorNotification.updateMany(
        { doctorId, isRead: false },
        { isRead: true }
      );
      return { message: "All doctor notifications marked as read" };
    } catch (error) {
      console.error('❌ Error marking all doctor notifications as read:', error);
      throw error;
    }
  }

  // Mark all supplier notifications as read
  static async markAllSupplierNotificationsAsRead(supplierId) {
    try {
      await SupplierNotification.updateMany(
        { supplierId, read: false },
        { read: true }
      );
      return { message: "All supplier notifications marked as read" };
    } catch (error) {
      console.error('❌ Error marking all supplier notifications as read:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;
