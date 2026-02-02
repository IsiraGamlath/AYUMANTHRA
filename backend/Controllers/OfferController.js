const Offer = require("../Model/OfferModel");

// Get all offers
const getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    res.status(200).json(offers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching offers", error: error.message });
  }
};

// Get offer by ID
const getOfferById = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }
    res.status(200).json(offer);
  } catch (error) {
    res.status(500).json({ message: "Error fetching offer", error: error.message });
  }
};

// Create new offer
const createOffer = async (req, res) => {
  try {
    const offer = new Offer(req.body);
    const savedOffer = await offer.save();
    res.status(201).json(savedOffer);
  } catch (error) {
    res.status(500).json({ message: "Error creating offer", error: error.message });
  }
};

// Update offer
const updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }
    res.status(200).json(offer);
  } catch (error) {
    res.status(500).json({ message: "Error updating offer", error: error.message });
  }
};

// Delete offer
const deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }
    res.status(200).json({ message: "Offer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting offer", error: error.message });
  }
};

module.exports = {
  getAllOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer
};
