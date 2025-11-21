// backend/Controllers/supNotificationControl.js
const Notification = require("../Model/supNotificationModel");

// Get notifications - can filter by category, type, or get all
exports.getNotifications = async (req, res) => {
  try {
    const { category, type, supplierId, minStock } = req.query;
    
    let filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (type) {
      filter.type = type;
    }
    
    if (supplierId) {
      filter.supplierId = supplierId;
    }
    
    // Add filter for minimum stock quantity
    if (minStock) {
      filter.quantity = { $gte: parseInt(minStock) };
    }
    
    const notifications = await Notification.find(filter)
      .populate('stockId') // Populate inventory details
      .populate('supplierId') // Populate supplier details
      .sort({ createdAt: -1 });
    
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get notifications by type - ENHANCED with stock filtering
exports.getByType = async (req, res) => {
  try {
    const { type, category, minStock, unreadOnly } = req.query;
    
    let filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;
    
    // Filter by minimum stock
    if (minStock) {
      filter.quantity = { $gte: parseInt(minStock) };
    }
    
    // Filter unread only
    if (unreadOnly === 'true') {
      filter.read = false;
    }
    
    const notifications = await Notification.find(filter)
      .populate('stockId')
      .populate('supplierId')
      .sort({ createdAt: -1 });
    
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications by type:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get discount recommendations (expiring items with adequate stock)
exports.getDiscountRecommendations = async (req, res) => {
  try {
    const { minStock = 10 } = req.query;
    
    const notifications = await Notification.find({
      type: "expiring-soon",
      quantity: { $gte: parseInt(minStock) },
      read: false
    })
    .populate('stockId')
    .populate('supplierId')
    .sort({ createdAt: -1 });
    
    // Enhance with calculated fields and item name
    const recommendations = notifications.map(notif => {
      const itemName = notif.stockId?.itemName || notif.stockId?.name || 'Unknown Item';
      const daysUntilExpiry = notif.stockId?.expiryDate 
        ? Math.ceil((new Date(notif.stockId.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
        : null;
      
      let suggestedDiscount = 15;
      if (daysUntilExpiry <= 7) suggestedDiscount = 30;
      else if (daysUntilExpiry <= 14) suggestedDiscount = 25;
      else if (daysUntilExpiry <= 30) suggestedDiscount = 20;
      
      let urgency = 'low';
      if (daysUntilExpiry <= 7) urgency = 'high';
      else if (daysUntilExpiry <= 14) urgency = 'medium';
      
      return {
        ...notif.toObject(),
        itemName,
        suggestedDiscount,
        urgency,
        daysUntilExpiry
      };
    });
    
    res.status(200).json(recommendations);
  } catch (error) {
    console.error("Error fetching discount recommendations:", error);
    res.status(500).json({ message: error.message });
  }
};

// Create/Save a notification
exports.createNotification = async (req, res) => {
  try {
    const { stockId, type, message, quantity, category, supplierId } = req.body;
    
    // Check if notification already exists for this stock item and type
    const existingNotification = await Notification.findOne({
      stockId: stockId,
      type: type
    });
    
    if (existingNotification) {
      // Update existing notification
      existingNotification.quantity = quantity;
      existingNotification.message = message;
      existingNotification.createdAt = new Date();
      existingNotification.read = false;
      if (supplierId) existingNotification.supplierId = supplierId;
      await existingNotification.save();
      return res.status(200).json(existingNotification);
    }
    
    // Create new notification
    const notification = new Notification({
      stockId,
      type,
      message,
      quantity,
      category,
      supplierId,
      read: false
    });
    
    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(400).json({ message: error.message });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedNotification = await Notification.findByIdAndDelete(id);
    
    if (!deletedNotification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: error.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    res.status(200).json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete notifications by stock ID
exports.deleteNotificationsByItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    await Notification.deleteMany({ stockId: itemId });
    
    res.status(200).json({ message: "Notifications deleted successfully" });
  } catch (error) {
    console.error("Error deleting notifications:", error);
    res.status(500).json({ message: error.message });
  }
};

// Manual trigger for inventory notifications
exports.triggerInventoryNotifications = async (req, res) => {
  try {
    const inventoryNotificationService = require('../services/inventoryNotificationService');
    const result = await inventoryNotificationService.processInventoryNotifications();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error triggering inventory notifications:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get notification statistics
exports.getNotificationStats = async (req, res) => {
  try {
    const totalNotifications = await Notification.countDocuments();
    const unreadNotifications = await Notification.countDocuments({ read: false });
    const lowStockCount = await Notification.countDocuments({ type: "low-stock", read: false });
    const expiringSoonCount = await Notification.countDocuments({ type: "expiring-soon", read: false });
    
    // Count expiring items with adequate stock (discount candidates)
    const discountCandidates = await Notification.countDocuments({
      type: "expiring-soon",
      quantity: { $gte: 10 },
      read: false
    });
    
    res.status(200).json({
      total: totalNotifications,
      unread: unreadNotifications,
      lowStock: lowStockCount,
      expiringSoon: expiringSoonCount,
      discountCandidates: discountCandidates
    });
  } catch (error) {
    console.error("Error fetching notification stats:", error);
    res.status(500).json({ message: error.message });
  }
};