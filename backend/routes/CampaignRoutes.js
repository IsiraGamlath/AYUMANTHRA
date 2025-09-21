const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const {
  getAllCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign
} = require("../controllers/CampaignController");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `campaign-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage: storage });

// GET /campaigns - Get all campaigns
router.get("/", getAllCampaigns);

// GET /campaigns/:id - Get campaign by ID
router.get("/:id", getCampaignById);

// POST /campaigns - Create new campaign
router.post("/", upload.single("image"), createCampaign);

// PUT /campaigns/:id - Update campaign
router.put("/:id", updateCampaign);

// DELETE /campaigns/:id - Delete campaign
router.delete("/:id", deleteCampaign);

module.exports = router;