// Test routes for notification systems
const express = require("express");
const router = express.Router();
const SampleNotificationData = require("../services/sampleNotificationData");
const NotificationService = require("../services/notificationService");

// POST create sample notifications for testing
router.post("/create-sample-notifications", async (req, res) => {
  try {
    const { patientId, doctorId, supplierId, phoneNumber } = req.body;
    
    if (!patientId || !doctorId) {
      return res.status(400).json({ 
        message: "Patient ID and Doctor ID are required" 
      });
    }

    const result = await SampleNotificationData.createAllSampleNotifications(
      patientId, 
      doctorId, 
      supplierId || "supplier123", // Default value
      phoneNumber
    );

    res.status(201).json({
      message: "Sample notifications created successfully",
      data: result
    });
  } catch (error) {
    console.error("Error creating sample notifications:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// POST create only patient and doctor notifications (simpler version)
router.post("/create-basic-notifications", async (req, res) => {
  try {
    const { patientId, doctorId, phoneNumber } = req.body;
    
    if (!patientId || !doctorId) {
      return res.status(400).json({ 
        message: "Patient ID and Doctor ID are required" 
      });
    }

    console.log('🔔 Creating basic patient and doctor notifications...');
    
    const patientNotifications = await SampleNotificationData.createSamplePatientNotifications(patientId, phoneNumber);
    const doctorNotifications = await SampleNotificationData.createSampleDoctorNotifications(doctorId);

    res.status(201).json({
      message: "Basic sample notifications created successfully",
      data: {
        patientNotifications,
        doctorNotifications,
        supplierNotifications: []
      }
    });
  } catch (error) {
    console.error("Error creating basic notifications:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET test patient notifications
router.get("/test-patient-notifications/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;
    const result = await NotificationService.getPatientNotifications(patientId);
    res.json(result);
  } catch (error) {
    console.error("Error fetching patient notifications:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET test doctor notifications
router.get("/test-doctor-notifications/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;
    const result = await NotificationService.getDoctorNotifications(doctorId);
    res.json(result);
  } catch (error) {
    console.error("Error fetching doctor notifications:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET test supplier notifications
router.get("/test-supplier-notifications/:supplierId", async (req, res) => {
  try {
    const { supplierId } = req.params;
    const result = await NotificationService.getSupplierNotifications(supplierId);
    res.json(result);
  } catch (error) {
    console.error("Error fetching supplier notifications:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// POST clear all notifications (for testing)
router.post("/clear-all-notifications", async (req, res) => {
  try {
    const Notification = require("../Model/notificationModel");
    const DoctorNotification = require("../Model/doctorNotificationModel");
    const SupplierNotification = require("../Model/supNotificationModel");

    await Notification.deleteMany({});
    await DoctorNotification.deleteMany({});
    await SupplierNotification.deleteMany({});

    res.json({ message: "All notifications cleared successfully" });
  } catch (error) {
    console.error("Error clearing notifications:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
