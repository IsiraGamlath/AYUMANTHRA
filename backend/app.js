const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const campaignRoutes = require("./routes/CampaignRoutes");
const routineRoutes = require("./routes/RoutineRoutes");
const offerCampaignRoutes = require("./routes/OfferCampaignRoutes");

const app = express();
const cors = require("cors");

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use('/uploads', express.static('uploads'));

// Mount campaign routes
app.use("/campaigns", campaignRoutes);
app.use("/routines", routineRoutes);
app.use("/offers", offerCampaignRoutes);


// Connect to MongoDB
mongoose.connect("mongodb+srv://admin:Fyif7kuiqRLPmIv4@cluster0.9je1jpo.mongodb.net/")
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(5016, () => console.log("🚀 Server running on http://localhost:5016"));
  })
  .catch(err => console.error(err));
