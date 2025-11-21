// backend/Routes/supNotificationRoutes.js
const express = require("express");
const router = express.Router();
const notificationController = require("../Controllers/supNotificationControl");

// Get notifications (supports filtering by category, type, supplierId, minStock)
// Example: /sup-notifications?type=expiring-soon&minStock=10
router.get("/", notificationController.getNotifications);

// Get notifications by type (enhanced with stock filtering)
// Example: /sup-notifications/type?type=expiring-soon&minStock=10&unreadOnly=true
router.get("/type", notificationController.getByType);

// NEW: Get discount recommendations (expiring items with adequate stock)
// Example: /sup-notifications/discount-recommendations?minStock=10
router.get("/discount-recommendations", notificationController.getDiscountRecommendations);

// NEW: Get notification statistics
router.get("/stats", notificationController.getNotificationStats);

// Create/save a notification
router.post("/", notificationController.createNotification);

// Mark as read
router.put("/read/:id", notificationController.markAsRead);

// Delete a notification
router.delete("/:id", notificationController.deleteNotification);

// Delete notifications by item ID
router.delete("/item/:itemId", notificationController.deleteNotificationsByItem);

// Manual trigger for inventory notifications
router.post("/trigger-inventory-check", notificationController.triggerInventoryNotifications);

module.exports = router;