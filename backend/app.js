// app.js (merged version)
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

//User Management
const User = require('./Model/User');
const userRoutes = require('./Routes/userRoutes'); // Updated import
const UserdoctorRoutes = require('./Routes/UserdoctorRoutes');
const adminRoutes = require('./Routes/adminRoutes');
const inventoryManagerRoutes = require('./Routes/imRoutes');
const pmRoutes = require('./Routes/pmRoutes');
const supplierRoutes = require('./Routes/supplierRoutes');
const orderRouter = require("./Routes/OrderRoutes"); 
const supNotificationRoutes = require("./Routes/supNotificationRoutes");


// Import routes (your existing routes)
const cartRoutes = require("./Routes/CartRoutes");
const inventoryRoutes = require("./Routes/InventoryRoutes");
const routineRoutes = require("./Routes/RoutineRoutes");
const campaignRoutes = require("./Routes/CampaignRoutes");
const offerRoutes = require("./Routes/OfferRoutes");
const offerCampaignRoutes = require("./Routes/OfferCampaignRoutes");

// Import routes (your friend's routes - convert to CommonJS)
const appointmentRoutes = require("./Routes/appointmentRoutes");
const availabilityRoutes = require("./Routes/availabilityRoutes");
const doctorRoutes = require("./Routes/doctorRoutes");
const patientRoutes = require("./Routes/patientRoutes");
const doctorNotificationRoutes = require("./Routes/doctorNotificationRoutes");
const testNotificationRoutes = require("./Routes/testNotificationRoutes");

// Services (both versions)
const scheduleReminders = require("./services/reminderService");
const scheduleInventoryNotifications = require("./services/inventoryNotificationService");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist (your existing logic)
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded images (your existing logic)
app.use("/uploads", express.static("uploads"));

// Cart Inventory Management
app.use("/carts", cartRoutes);
app.use("/inventories", inventoryRoutes);
app.use("/orders", orderRouter);
app.use("/sup-notifications", supNotificationRoutes);

//Campaing Management
app.use("/routines", routineRoutes);
app.use("/campaigns", campaignRoutes);
app.use("/offers", offerRoutes);
app.use("/offercampaigns", offerCampaignRoutes);

//User Management
app.use('/users', userRoutes); // Use the correct route file
app.use('/doctors', UserdoctorRoutes);//added doctor routes
app.use('/admins', adminRoutes);
app.use('/inventory-managers', inventoryManagerRoutes);
app.use('/project-managers', pmRoutes);
app.use('/suppliers', supplierRoutes);

//Appointment Management
app.use("/api/appointment", appointmentRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/doctor", doctorNotificationRoutes);
app.use("/api/test-notifications", testNotificationRoutes);

// MongoDB connection (keeping your existing logic)
const mongoURI =
  process.env.MONGODB_URI ||
  "mongodb+srv://customer:FPBt4wOtSiD6wutd@cluster0.amywqi8.mongodb.net/ayumanthra?retryWrites=true&w=majority";
const port = process.env.PORT || 5000;

// MongoDB connection listeners (enhanced with your friend's features)
mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
});

mongoose.connection.on("connected", () => {
  console.log("✅ MongoDB connected successfully");

  // Start reminder service after DB connection (both versions)
  try {
    scheduleReminders();
    console.log("✅ Reminder service initialized");
  } catch (err) {
    console.error("❌ Failed to initialize reminder service:", err);
  }

  // Start inventory notification service after DB connection
  try {
    scheduleInventoryNotifications();
    console.log("✅ Inventory notification service initialized");
  } catch (err) {
    console.error("❌ Failed to initialize inventory notification service:", err);
  }
});

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB disconnected");
});

// Connect to MongoDB (keeping your existing approach but adding your friend's options)
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connection attempt started");
    app.listen(port, () => {
      console.log(`✅ Server running on port ${port}`);
      console.log(`🌐 Backend URL: http://localhost:${port}`);
      console.log(`📱 Notifications: Database + Console Display (No SMS)`); // Added from friend's code
      console.log(
        `Environment: ${process.env.NODE_ENV || "development"}`
      );
      console.log("=".repeat(50));
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Error handling middleware (enhanced)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res
    .status(500)
    .json({ message: "Internal server error", error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

module.exports = app;