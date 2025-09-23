import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

import appointmentRoutes from "./routes/appointmentRoutes.js";
import availabilityRoutes from "./routes/availabilityRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import doctorNotificationRoutes from "./routes/doctorNotificationRoutes.js";
import scheduleReminders from "./services/reminderService.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/appointment", appointmentRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/doctor", doctorNotificationRoutes);

// Use MongoDB URI from environment or fallback to existing connection
const mongoURI = process.env.MONGODB_URI || "mongodb+srv://admin:tpItdFODG5vta5DH@cluster0.pqna85x.mongodb.net/ayumanthra";
const port = process.env.PORT || 5000;

// Error handling for MongoDB connection
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('connected', () => {
  console.log("✅ MongoDB connected successfully");
  // Start the reminder service after successful DB connection
  try {
    scheduleReminders();
    console.log("✅ Reminder service initialized");
  } catch (err) {
    console.error("❌ Failed to initialize reminder service:", err);
  }
});

mongoose.connection.on('disconnected', () => {
  console.log("⚠️ MongoDB disconnected");
});

// Connect to MongoDB with error handling
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ MongoDB connection attempt started");
})
.catch(err => {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`🌐 Backend URL: http://localhost:${port}`);
  console.log(`📱 Notifications: Database + Console Display (No SMS)`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(50));
});

export default app;