const express = require("express");
const router = express.Router();
const {
  getAllOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer
} = require("../controllers/OfferController");

// GET /offers - Get all offers
router.get("/", getAllOffers);

// GET /offers/:id - Get offer by ID
router.get("/:id", getOfferById);

// POST /offers - Create new offer
router.post("/", createOffer);

// PUT /offers/:id - Update offer
router.put("/:id", updateOffer);

// DELETE /offers/:id - Delete offer
router.delete("/:id", deleteOffer);

module.exports = router;
