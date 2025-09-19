//express.js,model,controller import
const express = require("express");
const router = express.Router();
const InventoryController = require("../Controllers/InventoryControl");
const multer = require("multer");
const path = require("path");

// Multer config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // ensure this folder exists
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ 
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        // Check if file is an image
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

//create Router path
//call Controller
router.get("/", InventoryController.getAllInventory);
router.post("/", upload.single("image"), InventoryController.addInventory);
router.get("/:id", InventoryController.getById);
router.put("/:id", upload.single("image"), InventoryController.updateInventory);
router.delete("/:id", InventoryController.deleteInventory);

//export
module.exports = router;