const express = require("express");
const Notification = require("../Model/notificationModel");

const router = express.Router();

// ... your existing patient routes ...

// GET patient notifications
router.get("/notifications", async (req, res) => {
  try {
    const { patientId } = req.query;
    
    if (!patientId) {
      return res.status(400).json({ message: "Patient ID is required" });
    }

    console.log(`Fetching notifications for patient: ${patientId}`);

    const notifications = await Notification.find({ patientId })
      .sort({ createdAt: -1 })
      .limit(50);

    console.log(`Found ${notifications.length} notifications for patient ${patientId}`);

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

    console.log(`✅ Notification ${req.params.id} marked as read`);

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

    const result = await Notification.updateMany(
      { patientId, isRead: false },
      { isRead: true }
    );

    console.log(`✅ Marked ${result.modifiedCount} notifications as read for patient ${patientId}`);

    res.status(200).json({ 
      message: "All notifications marked as read",
      count: result.modifiedCount
    });
  } catch (err) {
    console.error("Error marking all notifications as read:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;