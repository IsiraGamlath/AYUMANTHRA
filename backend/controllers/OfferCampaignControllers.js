const OfferCampaign = require("../model/OfferCampaignModel");

// GET all published offers (for campaign page display)
const getAllOffers = async (req, res) => {
    try {
        const offers = await OfferCampaign.find({ 
            status: 'active' 
        }).sort({ createdAt: -1 });
        
        if (!offers || offers.length === 0) {
            return res.status(404).json({ message: "No published offers found" });
        }
        res.status(200).json({ offers });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// GET active offers only (same as above - for campaign page)
const getActiveOffers = async (req, res) => {
    try {
        const currentDate = new Date();
        const offers = await OfferCampaign.find({
            status: "active",
            expiryDate: { $gt: currentDate }
        }).sort({ discount: -1 });
        
        if (!offers || offers.length === 0) {
            return res.status(404).json({ message: "No active offers found" });
        }
        
        res.status(200).json({ offers });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// GET offer by ID
const getOfferById = async (req, res) => {
    try {
        const offer = await OfferCampaign.findById(req.params.id);
        if (!offer) {
            return res.status(404).json({ message: "Offer not found" });
        }
        res.status(200).json({ offer });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// POST create and publish offer campaign
const createAndPublishOffer = async (req, res) => {
    try {
        const { 
            productName, 
            description, 
            originalPrice, 
            discount, 
            category, 
            couponCode, 
            expiryDate,
            imageUrl
        } = req.body;

        // Log received data for debugging
        console.log("Received data:", req.body);
        console.log("File:", req.file);

        // Validate required fields
        if (!productName || !description || !originalPrice || !discount || !expiryDate) {
            return res.status(400).json({ 
                message: "Required fields missing: productName, description, originalPrice, discount, expiryDate" 
            });
        }

        // Validate discount percentage
        if (discount < 0 || discount > 100) {
            return res.status(400).json({ message: "Discount must be between 0 and 100 percent" });
        }

        // Validate expiry date
        const expiryDateTime = new Date(expiryDate);
        if (expiryDateTime <= new Date()) {
            return res.status(400).json({ message: "Expiry date must be in the future" });
        }

        // Handle image URL - prioritize uploaded file over URL
        let finalImageUrl = null;
        if (req.file) {
            finalImageUrl = `/uploads/offers/${req.file.filename}`;
        } else if (imageUrl && imageUrl.trim()) {
            finalImageUrl = imageUrl.trim();
        }

        // Generate coupon code if not provided
        const generatedCouponCode = couponCode || `HERBAL${discount}${Date.now().toString().slice(-4)}`;

        // Calculate discounted price
        const originalPriceNum = Number(originalPrice);
        const discountNum = Number(discount);
        const discountedPrice = Math.round(originalPriceNum - (originalPriceNum * (discountNum / 100)));

        const offer = new OfferCampaign({
            productName: productName.trim(),
            description: description.trim(),
            originalPrice: originalPriceNum,
            discount: discountNum,
            discountedPrice: discountedPrice,
            category: category || "General Wellness",
            couponCode: generatedCouponCode.toUpperCase(),
            expiryDate: expiryDateTime,
            status: "active", // Directly active
            imageUrl: finalImageUrl,
            createdBy: "Project Manager"
        });

        const savedOffer = await offer.save();
        
        // Log the publication
        logOfferPublication(savedOffer);
        
        res.status(201).json({ 
            message: "Offer campaign created and published successfully on campaign page.",
            offer: savedOffer,
            status: "Published"
        });
    } catch (err) {
        console.error("Error creating offer:", err);
        if (err.code === 11000) {
            // Duplicate coupon code error
            const field = Object.keys(err.keyPattern)[0];
            return res.status(400).json({ 
                message: `${field === 'couponCode' ? 'Coupon code' : field} already exists. Please use a different one.` 
            });
        }
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ message: errors.join(', ') });
        }
        res.status(500).json({ 
            message: "Unable to create and publish offer campaign",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// PUT update published offer
const updatePublishedOffer = async (req, res) => {
    try {
        const { 
            productName, 
            description, 
            originalPrice, 
            discount, 
            category, 
            couponCode, 
            expiryDate,
            status,
            imageUrl
        } = req.body;

        // Validate discount if provided
        if (discount !== undefined && (discount < 0 || discount > 100)) {
            return res.status(400).json({ message: "Discount must be between 0 and 100 percent" });
        }

        // Validate expiry date if provided
        let expiryDateTime;
        if (expiryDate) {
            expiryDateTime = new Date(expiryDate);
            if (expiryDateTime <= new Date()) {
                return res.status(400).json({ message: "Expiry date must be in the future" });
            }
        }

        let updateData = {};

        // Only add fields that are provided
        if (productName !== undefined) updateData.productName = productName.trim();
        if (description !== undefined) updateData.description = description.trim();
        if (category !== undefined) updateData.category = category;
        if (couponCode !== undefined) updateData.couponCode = couponCode.toUpperCase();
        if (expiryDateTime) updateData.expiryDate = expiryDateTime;
        if (status !== undefined) updateData.status = status;

        // Handle price updates
        if (originalPrice !== undefined) {
            updateData.originalPrice = Number(originalPrice);
        }
        if (discount !== undefined) {
            updateData.discount = Number(discount);
        }

        // Recalculate discounted price if needed
        if (originalPrice !== undefined || discount !== undefined) {
            const currentOffer = await OfferCampaign.findById(req.params.id);
            if (!currentOffer) {
                return res.status(404).json({ message: "Offer not found" });
            }
            
            const newOriginalPrice = originalPrice !== undefined ? Number(originalPrice) : currentOffer.originalPrice;
            const newDiscount = discount !== undefined ? Number(discount) : currentOffer.discount;
            updateData.discountedPrice = Math.round(newOriginalPrice - (newOriginalPrice * (newDiscount / 100)));
        }

        // Handle image URL
        if (req.file) {
            updateData.imageUrl = `/uploads/offers/${req.file.filename}`;
        } else if (imageUrl !== undefined) {
            updateData.imageUrl = imageUrl.trim() || null;
        }

        const offer = await OfferCampaign.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!offer) {
            return res.status(404).json({ message: "Unable to update offer." });
        }

        res.status(200).json({ 
            message: "Published offer updated successfully",
            offer 
        });
    } catch (err) {
        console.error(err);
        if (err.code === 11000) {
            return res.status(400).json({ message: "Coupon code already exists. Please use a different code." });
        }
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ message: errors.join(', ') });
        }
        res.status(500).json({ message: "Server error" });
    }
};

// DELETE published offer
const deletePublishedOffer = async (req, res) => {
    try {
        const offer = await OfferCampaign.findByIdAndDelete(req.params.id);
        if (!offer) {
            return res.status(404).json({ message: "Unable to delete offer." });
        }
        res.status(200).json({ 
            message: "Published offer deleted successfully", 
            offer 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// PATCH deactivate offer (remove from campaign page)
const deactivateOffer = async (req, res) => {
    try {
        const offer = await OfferCampaign.findByIdAndUpdate(
            req.params.id,
            { status: "inactive" },
            { new: true }
        );
        
        if (!offer) {
            return res.status(404).json({ message: "Offer not found." });
        }
        
        res.status(200).json({ 
            message: "Offer deactivated and removed from campaign page", 
            offer 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// GET offers by category
const getOffersByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const offers = await OfferCampaign.find({ 
            category: { $regex: new RegExp(category, 'i') },
            status: 'active'
        }).sort({ createdAt: -1 });
        
        if (!offers || offers.length === 0) {
            return res.status(404).json({ message: `No active offers found for category: ${category}` });
        }
        
        res.status(200).json({ offers });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// GET project manager dashboard summary
const getProjectManagerDashboard = async (req, res) => {
    try {
        const totalOffers = await OfferCampaign.countDocuments({ createdBy: 'Project Manager' });
        const activeOffers = await OfferCampaign.countDocuments({ 
            createdBy: 'Project Manager', 
            status: 'active' 
        });
        const expiringSoon = await OfferCampaign.countDocuments({
            createdBy: 'Project Manager',
            status: 'active',
            expiryDate: { 
                $gt: new Date(),
                $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
            }
        });

        const recentOffers = await OfferCampaign.find({ 
            createdBy: 'Project Manager' 
        })
        .sort({ createdAt: -1 })
        .limit(5);

        res.status(200).json({
            summary: {
                totalOffers,
                activeOffers,
                expiringSoon,
                inactiveOffers: totalOffers - activeOffers
            },
            recentOffers
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// ========== UTILITY FUNCTIONS ==========

// Function to log offer publication
const logOfferPublication = (offer) => {
    console.log(`📢 OFFER PUBLISHED:`);
    console.log(`Product: ${offer.productName}`);
    console.log(`Category: ${offer.category}`);
    console.log(`Discount: ${offer.discount}%`);
    console.log(`Original Price: Rs. ${offer.originalPrice}`);
    console.log(`Discounted Price: Rs. ${offer.discountedPrice}`);
    console.log(`Coupon Code: ${offer.couponCode}`);
    console.log(`Status: ${offer.status} (Live on campaign page)`);
    console.log(`Published by: ${offer.createdBy}`);
    console.log(`Expiry Date: ${offer.expiryDate}`);
    console.log(`---`);
};

module.exports = {
    getAllOffers,
    getActiveOffers,
    getOfferById,
    createAndPublishOffer,
    updatePublishedOffer,
    deletePublishedOffer,
    deactivateOffer,
    getOffersByCategory,
    getProjectManagerDashboard
};