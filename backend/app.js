// app.js (merged)

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

// Import routes
const cartRoutes = require("./routes/CartRoutes");
const inventoryRoutes = require("./routes/InventoryRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded images
app.use("/uploads", express.static("uploads"));

// Use routes
app.use("/carts", cartRoutes);
app.use("/inventories", inventoryRoutes);

// MongoDB connection (your second one)
mongoose.connect(
    "mongodb+srv://customer:FPBt4wOtSiD6wutd@cluster0.amywqi8.mongodb.net/ayumanthra?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
)
.then(() => {
    console.log("Connected to MongoDB");
    app.listen(5000, () => console.log("Server running on port 5000"));
})
.catch((err) => console.error("MongoDB connection error:", err));
