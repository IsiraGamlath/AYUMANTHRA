import express from "express";
import DoctorNotification from "../model/doctorNotificationModel.js";

const router = express.Router();

// GET doctor notifications
router.get("/notifications", async (req, res) => {
  try {
    const { doctorId } = req.query;
    
    if (!doctorId) {
      return res.status(400).json({ message: "Doctor ID is required" });
    }

    // Get notifications for the specific doctor
    const notifications = await DoctorNotification.find({ doctorId })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to 50 most recent notifications
    
    const unreadCount = await DoctorNotification.countDocuments({ 
      doctorId, 
      isRead: false 
    });
    
    res.status(200).json({
      notifications,
      unreadCount,
      total: notifications.length
    });
  } catch (err) {
    console.error("Error fetching doctor notifications:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT mark notification as read
router.put("/notifications/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Update the notification to mark it as read
    const notification = await DoctorNotification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    res.status(200).json({ 
      message: "Notification marked as read",
      notification
    });
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT mark all notifications as read for a doctor
router.put("/notifications/mark-all-read", async (req, res) => {
  try {
    const { doctorId } = req.query;
    
    if (!doctorId) {
      return res.status(400).json({ message: "Doctor ID is required" });
    }

    // Mark all notifications as read for the doctor
    await DoctorNotification.updateMany(
      { doctorId, isRead: false },
      { isRead: true }
    );
    
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("Error marking all notifications as read:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;