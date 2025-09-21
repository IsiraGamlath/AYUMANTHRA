const mongoose = require("mongoose");

const OfferCampaignSchema = new mongoose.Schema({
    // Basic Product Information
    productName: {
        type: String,
        required: [true, "Product name is required"],
        trim: true,
        maxlength: [100, "Product name cannot exceed 100 characters"]
    },
    
    description: {
        type: String,
        required: [true, "Product description is required"],
        trim: true,
        maxlength: [500, "Description cannot exceed 500 characters"]
    },
    
    // Pricing Information
    originalPrice: {
        type: Number,
        required: [true, "Original price is required"],
        min: [0, "Original price must be a positive number"]
    },
    
    discount: {
        type: Number,
        required: [true, "Discount percentage is required"],
        min: [0, "Discount cannot be negative"],
        max: [100, "Discount cannot exceed 100%"]
    },
    
    discountedPrice: {
        type: Number,
        required: [true, "Discounted price is required"],
        min: [0, "Discounted price must be a positive number"]
    },
    
    // Product Category
    category: {
        type: String,
        required: [true, "Product category is required"],
        enum: {
            values: [
                "Detox", 
                "Cooling", 
                "Immunity", 
                "Digestive", 
                "Mental Clarity", 
                "Energy Boost", 
                "Skin Care", 
                "Hair Care",
                "General Wellness"
            ],
            message: "{VALUE} is not a valid category"
        },
        default: "General Wellness"
    },
    
    // Offer Management
    couponCode: {
        type: String,
        required: [true, "Coupon code is required"],
        unique: true,
        uppercase: true,
        trim: true,
        minlength: [4, "Coupon code must be at least 4 characters"],
        maxlength: [20, "Coupon code cannot exceed 20 characters"]
    },
    
    expiryDate: {
        type: Date,
        required: [true, "Expiry date is required"],
        validate: {
            validator: function(value) {
                return value > new Date();
            },
            message: "Expiry date must be in the future"
        }
    },
    
    // Status - directly active since no approval needed
    status: {
        type: String,
        enum: {
            values: ["active", "inactive", "expired", "draft"],
            message: "{VALUE} is not a valid status"
        },
        default: "active"
    },
    
    // Image
    imageUrl: {
        type: String,
        trim: true
    },
    
    // Offer creator (Project Manager)
    createdBy: {
        type: String,
        default: "Project Manager",
        required: true
    },
    
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for better performance
OfferCampaignSchema.index({ status: 1, createdAt: -1 });
OfferCampaignSchema.index({ couponCode: 1 }, { unique: true });
OfferCampaignSchema.index({ category: 1, status: 1 });
OfferCampaignSchema.index({ expiryDate: 1, status: 1 });

// Pre-save middleware to calculate discounted price
OfferCampaignSchema.pre('save', function(next) {
    if (this.originalPrice && this.discount) {
        this.discountedPrice = Math.round(this.originalPrice - (this.originalPrice * (this.discount / 100)));
    }
    this.updatedAt = Date.now();
    next();
});

// Pre-save middleware to generate coupon code if not provided
OfferCampaignSchema.pre('save', function(next) {
    if (!this.couponCode) {
        this.couponCode = `HERBAL${this.discount}${Date.now().toString().slice(-4)}`;
    }
    next();
});

// Pre-update middleware to update the updatedAt field
OfferCampaignSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: Date.now() });
    next();
});

// Virtual for savings amount
OfferCampaignSchema.virtual('savingsAmount').get(function() {
    return this.originalPrice - this.discountedPrice;
});

// Virtual for time remaining
OfferCampaignSchema.virtual('timeRemaining').get(function() {
    const now = new Date();
    const expiry = this.expiryDate;
    
    if (expiry <= now) {
        return "Expired";
    }
    
    const diff = expiry - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
        return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
});

// Virtual for formatted discount price display
OfferCampaignSchema.virtual('formattedPrices').get(function() {
    return {
        original: `Rs. ${this.originalPrice.toLocaleString()}`,
        discounted: `Rs. ${this.discountedPrice.toLocaleString()}`,
        savings: `Rs. ${this.savingsAmount.toLocaleString()}`
    };
});

// Method to publish offer directly
OfferCampaignSchema.methods.publishOffer = function() {
    this.status = 'active';
    return this.save();
};

// Method to deactivate offer
OfferCampaignSchema.methods.deactivateOffer = function() {
    this.status = 'inactive';
    return this.save();
};

// Static method to find active published offers
OfferCampaignSchema.statics.findPublishedOffers = function() {
    return this.find({ status: 'active' }).sort({ createdAt: -1 });
};

// Static method to find active offers that haven't expired
OfferCampaignSchema.statics.findValidActiveOffers = function() {
    return this.find({ 
        status: 'active',
        expiryDate: { $gt: new Date() }
    }).sort({ createdAt: -1 });
};

// Static method to find offers expiring soon
OfferCampaignSchema.statics.findExpiringSoonOffers = function(days = 7) {
    const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    return this.find({
        status: 'active',
        expiryDate: { 
            $gt: new Date(),
            $lte: futureDate
        }
    }).sort({ expiryDate: 1 });
};

// Ensure virtual fields are included in JSON output
OfferCampaignSchema.set('toJSON', { virtuals: true });
OfferCampaignSchema.set('toObject', { virtuals: true });

const OfferCampaign = mongoose.model("OfferCampaign", OfferCampaignSchema);

module.exports = OfferCampaign;