// app.js
//IaasEAtAM4BkwMUA
const express = require("express");
const mongoose = require("mongoose");
const inventoryRoutes = require("./Routes/InventoryRoutes");
const path = require("path");
const fs = require("fs");
const app = express();
//call cors
const cors = require("cors");

//add to the middleware -> cors
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded images
app.use("/uploads", express.static("uploads"));

// Use inventory routes
app.use("/inventories", inventoryRoutes);

// Connect to MongoDB Atlas
/*mongoose.connect("mongodb+srv://admin:IaasEAtAM4BkwMUA@cluster0.m6xu2r8.mongodb.net/")
  .then(() => {
      console.log(" Connected to MongoDB");
      app.listen(5000, () => console.log(" Server running on port 5000"));
  })
  .catch((err) => console.error(" MongoDB connection error:", err));*/


  
/*mongoose.connect(
  "mongodb+srv://admin:IaasEAtAM4BkwMUA@cluster0.m6xu2r8.mongodb.net/inventoryDB",
  { useNewUrlParser: true, useUnifiedTopology: true }
)

  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(5000, () => console.log("Server running on port 5000"));
  })
  .catch((err) => console.error("MongoDB connection error:", err));*/
  
  mongoose.connect(
  "mongodb+srv://admin:IaasEAtAM4BkwMUA@cluster0.m6xu2r8.mongodb.net/inventoryDB"
)
.then(() => {
  console.log("Connected to MongoDB Atlas");
  app.listen(5000, () => console.log("Server running on port 5000"));
})
.catch((err) => console.error(" MongoDB connection error:", err));
