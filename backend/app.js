// app.js (fully merged)

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== Uploads Folder =====
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static("uploads"));

// ===== Import Routes =====
const cartRoutes = require("./routes/CartRoutes");
const inventoryRoutes = require("./routes/InventoryRoutes");
const campaignRoutes = require("./routes/CampaignRoutes");
const routineRoutes = require("./routes/RoutineRoutes");
const offerCampaignRoutes = require("./routes/OfferCampaignRoutes");

// ===== Mount Routes =====
app.use("/carts", cartRoutes);
app.use("/inventories", inventoryRoutes);
app.use("/campaigns", campaignRoutes);
app.use("/routines", routineRoutes);
app.use("/offers", offerCampaignRoutes);

// ===== MongoDB Connection =====
// Main DB (ayumanthra)
mongoose.connect(
  "mongodb+srv://customer:FPBt4wOtSiD6wutd@cluster0.amywqi8.mongodb.net/ayumanthra?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
)
.then(() => {
  console.log("✅ Connected to MongoDB (ayumanthra)");
  app.listen(5000, () =>
    console.log("🚀 Server running on http://localhost:5000")
  );
})
.catch((err) => console.error("MongoDB connection error:", err));

// ===== OPTIONAL: Secondary DB Connection =====
// If Campaigns/Routines/Offers need to use another DB, you can connect with a named connection:
const secondaryConnection = mongoose.createConnection(
  "mongodb+srv://admin:Fyif7kuiqRLPmIv4@cluster0.9je1jpo.mongodb.net/",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

secondaryConnection.on("connected", () =>
  console.log("🔗 Connected to secondary MongoDB")
);
