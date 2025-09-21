const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const OfferCampaignController = require("../controllers/OfferCampaignControllers");

// Multer setup for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/offers/");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `offer-${uniqueSuffix}${path.extname(file.originalname)}`);
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

const upload = multer({ 
    storage, 
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// ========== SPECIFIC ROUTES FIRST (Order matters!) ==========

// GET project manager dashboard summary
router.get("/manager/dashboard", OfferCampaignController.getProjectManagerDashboard);

// GET active offers only (filtered by expiry date)
router.get("/active", OfferCampaignController.getActiveOffers);

// GET offers by category (for filtering on campaign page)
router.get("/category/:category", OfferCampaignController.getOffersByCategory);

// GET endpoint documentation
router.get("/docs/endpoints", (req, res) => {
    const endpoints = {
        project_manager: {
            "POST /": "Create and publish offer campaign",
            "GET /manager/dashboard": "Get dashboard summary",
            "PUT /:id": "Update published offer", 
            "DELETE /:id": "Delete published offer",
            "PATCH /:id/deactivate": "Remove offer from campaign page"
        },
        public_display: {
            "GET /": "Get all published offers (campaign page)",
            "GET /active": "Get active offers (not expired)",
            "GET /:id": "Get specific offer details",
            "GET /category/:category": "Filter offers by category"
        },
        required_fields: {
            create_offer: [
                "productName", "description", "originalPrice", 
                "discount", "expiryDate"
            ],
            optional_fields: [
                "category", "couponCode", "image", "imageUrl"
            ]
        }
    };
    
    res.json({
        message: "Herbal Product Offer Campaign API",
        version: "2.0.0",
        workflow: "Project Manager creates & publishes → Goes live on campaign page",
        endpoints
    });
});

// ========== ID-BASED ROUTES ==========

// GET offer by ID (for detailed view)
router.get("/:id", OfferCampaignController.getOfferById);

// PUT update published offer
router.put("/:id", upload.single("image"), OfferCampaignController.updatePublishedOffer);

// DELETE published offer
router.delete("/:id", OfferCampaignController.deletePublishedOffer);

// PATCH deactivate offer (remove from campaign page but keep in database)
router.patch("/:id/deactivate", OfferCampaignController.deactivateOffer);

// ========== MAIN ROUTES (Order matters - these go LAST!) ==========

// POST create and publish offer campaign directly
router.post("/", upload.single("image"), OfferCampaignController.createAndPublishOffer);

// GET all published offers (what appears on campaign page)
router.get("/", OfferCampaignController.getAllOffers);

// ========== ERROR HANDLING ==========

// Handle multer errors
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                message: "File too large. Maximum size allowed is 5MB." 
            });
        }
    }
    
    if (error.message.includes("Only JPEG")) {
        return res.status(400).json({ 
            message: error.message 
        });
    }
    
    next(error);
});

module.exports = router;