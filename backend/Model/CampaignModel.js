const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema({
  // Primary field name that matches frontend
  campaignName: {
    type: String,
    required: true,
    trim: true
  },
  // Keep title for backward compatibility
  title: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  // Add deadline field that frontend expects
  deadline: {
    type: Date
  },
  targetAudience: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed', 'planning', 'paused', 'upcoming', 'draft'],
    default: 'active'
  },
  // Add fields that AdminCampaignView expects
  participants: {
    type: Number,
    default: 0,
    min: 0
  },
  rating: {
    type: Number,
    default: 0.0,
    min: 0,
    max: 5
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to sync fields and set defaults
campaignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Sync deadline with endDate if deadline not provided
  if (!this.deadline && this.endDate) {
    this.deadline = this.endDate;
  }
  
  // Sync title with campaignName for backward compatibility
  if (!this.title && this.campaignName) {
    this.title = this.campaignName;
  }
  
  // Sync campaignName with title if campaignName not provided
  if (!this.campaignName && this.title) {
    this.campaignName = this.title;
  }
  
  next();
});

// Add index for better query performance
campaignSchema.index({ status: 1, createdAt: -1 });
campaignSchema.index({ campaignName: 'text', description: 'text' });

module.exports = mongoose.model("Campaign", campaignSchema);