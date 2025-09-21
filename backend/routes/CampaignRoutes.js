const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const CampaignController = require("../controllers/CampaignControllers");

// Multer setup for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPEG, PNG, and WebP images are allowed"), false);
    }
};

const upload = multer({ storage, fileFilter });

// Routes
router.get("/", CampaignController.getAllCampaigns);
router.post("/", upload.single("image"), CampaignController.addCampaign);
router.get("/:id", CampaignController.getById);
router.put("/:id", upload.single("image"), CampaignController.updateCampaign);
router.delete("/:id", CampaignController.deleteCampaign);

module.exports = router;
