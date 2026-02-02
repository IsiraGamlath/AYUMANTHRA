const mongoose = require('mongoose');
const Inventory = require('../Model/InventoryModel');
const Notification = require('../Model/supNotificationModel');
const Supplier = require('../Model/Supplier');

/**
 * Notify suppliers for low stock items
 * @param {Object} item - Inventory item with low stock
 * @returns {Promise<Object>} - Summary of supplier notifications created
 */
const notifySuppliersForLowStock = async (item) => {
  try {
    console.log(`🔔 Notifying suppliers for low stock item: ${item.name}`);
    
    // Find suppliers that match the item category
    const suppliers = await Supplier.find({
      supplyCategory: item.category,
      active: true
    });
    
    console.log(`Found ${suppliers.length} suppliers for category: ${item.category}`);
    
    let supplierNotificationsCreated = 0;
    
    for (const supplier of suppliers) {
      try {
        // Check if notification already exists for this supplier and item
        const existingSupplierNotification = await Notification.findOne({
          stockId: item._id,
          type: 'low-stock',
          supplierId: supplier._id
        });
        
        if (!existingSupplierNotification) {
          const supplierMessage = `Low stock alert for ${item.name}: Only ${item.quantity} ${item.unit} remaining. Please restock this item soon.`;
          
          // Create supplier notification
          await Notification.create({
            stockId: item._id,
            type: 'low-stock',
            message: supplierMessage,
            quantity: item.quantity,
            category: item.category,
            supplierId: supplier._id,
            supplierName: supplier.supplierName,
            read: false
          });
          
          supplierNotificationsCreated++;
          console.log(`📤 Notified supplier: ${supplier.supplierName} for ${item.name}`);
        }
      } catch (error) {
        console.error(`Error notifying supplier ${supplier.supplierName} for ${item.name}:`, error);
      }
    }
    
    return {
      suppliersFound: suppliers.length,
      notificationsCreated: supplierNotificationsCreated
    };
    
  } catch (error) {
    console.error(`Error notifying suppliers for ${item.name}:`, error);
    return { suppliersFound: 0, notificationsCreated: 0 };
  }
};

/**
 * Check for low stock items and create notifications
 * @returns {Promise<Object>} - Summary of low stock notifications created
 */
const checkLowStockItems = async () => {
  try {
    console.log('🔍 Checking for low stock items...');
    
    // Define low stock threshold (you can make this configurable)
    const LOW_STOCK_THRESHOLD = 10;
    
    // Find items with quantity <= threshold
    const lowStockItems = await Inventory.find({
      quantity: { $lte: LOW_STOCK_THRESHOLD }
    });
    
    console.log(`Found ${lowStockItems.length} low stock items`);
    
    let notificationsCreated = 0;
    let notificationsUpdated = 0;
    let supplierNotificationsCreated = 0;
    
    for (const item of lowStockItems) {
      try {
        // Check if notification already exists for this item (general notification)
        const existingNotification = await Notification.findOne({
          stockId: item._id,
          type: 'low-stock',
          supplierId: { $exists: false } // General notification (no supplier)
        });
        
        const message = `Low stock alert: ${item.name} has only ${item.quantity} ${item.unit} remaining. Please restock soon.`;
        
        if (existingNotification) {
          // Update existing notification
          existingNotification.quantity = item.quantity;
          existingNotification.message = message;
          existingNotification.createdAt = new Date();
          existingNotification.read = false;
          await existingNotification.save();
          notificationsUpdated++;
          console.log(`📝 Updated low stock notification for: ${item.name}`);
        } else {
          // Create new general notification
          await Notification.create({
            stockId: item._id,
            type: 'low-stock',
            message: message,
            quantity: item.quantity,
            category: item.category,
            read: false
          });
          notificationsCreated++;
          console.log(`🆕 Created low stock notification for: ${item.name}`);
        }
        
        // Notify suppliers for this low stock item
        const supplierResult = await notifySuppliersForLowStock(item);
        supplierNotificationsCreated += supplierResult.notificationsCreated;
        
      } catch (error) {
        console.error(`Error processing low stock notification for ${item.name}:`, error);
      }
    }
    
    const summary = {
      type: 'low-stock',
      totalItems: lowStockItems.length,
      notificationsCreated,
      notificationsUpdated,
      supplierNotificationsCreated,
      message: `Low stock check completed: ${notificationsCreated} new notifications, ${notificationsUpdated} updated, ${supplierNotificationsCreated} supplier notifications`
    };
    
    console.log('✅ Low stock check completed:', summary);
    return summary;
    
  } catch (error) {
    console.error('❌ Error checking low stock items:', error);
    throw error;
  }
};

/**
 * Check for expiring items and create notifications
 * @returns {Promise<Object>} - Summary of expiry notifications created
 */
const checkExpiringItems = async () => {
  try {
    console.log('🔍 Checking for expiring items...');
    
    // Define expiry warning period (30 days before expiry)
    const EXPIRY_WARNING_DAYS = 30;
    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() + EXPIRY_WARNING_DAYS);
    
    // Find items expiring within the warning period
    const expiringItems = await Inventory.find({
      expiryDate: { 
        $lte: warningDate,
        $gte: new Date() // Not already expired
      }
    });
    
    console.log(`Found ${expiringItems.length} expiring items`);
    
    let notificationsCreated = 0;
    let notificationsUpdated = 0;
    
    for (const item of expiringItems) {
      try {
        // Calculate days until expiry
        const daysUntilExpiry = Math.ceil((item.expiryDate - new Date()) / (1000 * 60 * 60 * 24));
        
        // Check if notification already exists for this item
        const existingNotification = await Notification.findOne({
          stockId: item._id,
          type: 'expiring-soon'
        });
        
        const message = `Expiry alert: ${item.name} (Batch: ${item.batchNumber}) expires in ${daysUntilExpiry} days on ${item.expiryDate.toLocaleDateString()}.`;
        
        if (existingNotification) {
          // Update existing notification
          existingNotification.message = message;
          existingNotification.createdAt = new Date();
          existingNotification.read = false;
          await existingNotification.save();
          notificationsUpdated++;
          console.log(`📝 Updated expiry notification for: ${item.name}`);
        } else {
          // Create new notification
          await Notification.create({
            stockId: item._id,
            type: 'expiring-soon',
            message: message,
            quantity: item.quantity,
            category: item.category,
            read: false
          });
          notificationsCreated++;
          console.log(`🆕 Created expiry notification for: ${item.name}`);
        }
      } catch (error) {
        console.error(`Error processing expiry notification for ${item.name}:`, error);
      }
    }
    
    const summary = {
      type: 'expiring-soon',
      totalItems: expiringItems.length,
      notificationsCreated,
      notificationsUpdated,
      message: `Expiry check completed: ${notificationsCreated} new notifications, ${notificationsUpdated} updated`
    };
    
    console.log('✅ Expiry check completed:', summary);
    return summary;
    
  } catch (error) {
    console.error('❌ Error checking expiring items:', error);
    throw error;
  }
};

/**
 * Process all inventory notifications (low stock + expiry)
 * @returns {Promise<Object>} - Combined summary of all notifications
 */
const processInventoryNotifications = async () => {
  try {
    console.log('🚀 Starting inventory notification processing...');
    
    // Ensure database connection is established
    if (mongoose.connection.readyState !== 1) {
      console.log('⏳ Waiting for database connection...');
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Database connection timeout'));
        }, 10000);
        
        mongoose.connection.once('connected', () => {
          clearTimeout(timeout);
          resolve();
        });
      });
    }
    
    const lowStockSummary = await checkLowStockItems();
    const expirySummary = await checkExpiringItems();
    
    const combinedSummary = {
      timestamp: new Date().toISOString(),
      lowStock: lowStockSummary,
      expiry: expirySummary,
      totalNotificationsCreated: lowStockSummary.notificationsCreated + expirySummary.notificationsCreated,
      totalNotificationsUpdated: lowStockSummary.notificationsUpdated + expirySummary.notificationsUpdated,
      message: `Inventory notification processing completed: ${lowStockSummary.notificationsCreated + expirySummary.notificationsCreated} new notifications, ${lowStockSummary.notificationsUpdated + expirySummary.notificationsUpdated} updated`
    };
    
    console.log('✅ Inventory notification processing completed:', combinedSummary);
    return combinedSummary;
    
  } catch (error) {
    console.error('❌ Error processing inventory notifications:', error);
    throw error;
  }
};

/**
 * Schedule inventory notification checks
 * Runs every 6 hours by default
 */
const scheduleInventoryNotifications = () => {
  console.log('⏰ Scheduling inventory notification checks...');
  
  // Run immediately on startup
  processInventoryNotifications().catch(error => {
    console.error('❌ Error in initial inventory notification check:', error);
  });
  
  // Schedule to run every 6 hours
  setInterval(() => {
    console.log('⏰ Running scheduled inventory notification check...');
    processInventoryNotifications().catch(error => {
      console.error('❌ Error in scheduled inventory notification check:', error);
    });
  }, 6 * 60 * 60 * 1000); // 6 hours in milliseconds
  
  console.log('✅ Inventory notification scheduler initialized (every 6 hours)');
};

module.exports = {
  checkLowStockItems,
  checkExpiringItems,
  processInventoryNotifications,
  scheduleInventoryNotifications
};
