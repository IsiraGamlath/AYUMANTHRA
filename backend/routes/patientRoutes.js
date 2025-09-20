import express from "express";
import Notification from "../model/notificationModel.js";

const router = express.Router();

// GET patient notifications
router.get("/notifications", async (req, res) => {
  try {
    const { patientId } = req.query;
    
    if (!patientId) {
      return res.status(400).json({ message: "Patient ID is required" });
    }

    // Get all notifications for the patient, sorted by newest first
    const notifications = await Notification.find({ patientId })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 notifications

    // Count unread notifications
    const unreadCount = await Notification.countDocuments({ 
      patientId, 
      isRead: false 
    });

    res.status(200).json({
      notifications,
      unreadCount,
      total: notifications.length
    });
  } catch (err) {
    console.error("Error fetching patient notifications:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT mark notification as read
router.put("/notifications/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification marked as read", notification });
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT mark all notifications as read for a patient
router.put("/notifications/mark-all-read", async (req, res) => {
  try {
    const { patientId } = req.query;
    
    if (!patientId) {
      return res.status(400).json({ message: "Patient ID is required" });
    }

    await Notification.updateMany(
      { patientId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("Error marking all notifications as read:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;