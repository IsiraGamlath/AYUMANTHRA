const Campaign = require("../Model/CampaignModel");

// Transform campaign data for frontend compatibility
const transformCampaignData = (campaign) => {
  const transformed = campaign.toObject ? campaign.toObject() : campaign;
  
  // Ensure campaignName exists (map from title if needed)
  if (!transformed.campaignName && transformed.title) {
    transformed.campaignName = transformed.title;
  }
  
  // Ensure deadline exists (map from endDate if needed)
  if (!transformed.deadline && transformed.endDate) {
    transformed.deadline = transformed.endDate;
  }
  
  // Set default values for fields that frontend expects
  transformed.participants = transformed.participants || 0;
  transformed.rating = transformed.rating || 0.0;
  transformed.discount = transformed.discount || 0;
  
  return transformed;
};

// Get all campaigns
const getAllCampaigns = async (req, res) => {
  try {
    console.log("Fetching all campaigns...");
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    console.log(`Found ${campaigns.length} campaigns`);
    
    // Transform data to match frontend expectations
    const transformedCampaigns = campaigns.map(transformCampaignData);
    
    console.log("Sending campaigns to frontend:", transformedCampaigns.length);
    
    // Return in the format expected by frontend
    res.status(200).json({ campaigns: transformedCampaigns });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ message: "Error fetching campaigns", error: error.message });
  }
};

// Get campaign by ID
const getCampaignById = async (req, res) => {
  try {
    console.log("Fetching campaign by ID:", req.params.id);
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    
    const transformed = transformCampaignData(campaign);
    console.log("Sending campaign:", transformed);
    
    res.status(200).json(transformed);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    res.status(500).json({ message: "Error fetching campaign", error: error.message });
  }
};

// Create new campaign
const createCampaign = async (req, res) => {
  try {
    console.log("=== CREATE CAMPAIGN REQUEST ===");
    console.log("Received campaign data:", req.body);
    console.log("Received file:", req.file);
    
    // Prepare campaign data
    const campaignData = { ...req.body };
    
    // Add imageUrl if file was uploaded
    if (req.file) {
      campaignData.imageUrl = `/uploads/${req.file.filename}`;
      console.log("File uploaded, imageUrl set to:", campaignData.imageUrl);
    }
    
    // Handle field mapping for backward compatibility
    if (campaignData.title && !campaignData.campaignName) {
      campaignData.campaignName = campaignData.title;
    }
    if (campaignData.campaignName && !campaignData.title) {
      campaignData.title = campaignData.campaignName;
    }
    
    // Set deadline to endDate if not provided
    if (campaignData.endDate && !campaignData.deadline) {
      campaignData.deadline = campaignData.endDate;
    }
    
    // Ensure numeric fields are properly typed
    if (campaignData.participants) {
      campaignData.participants = parseInt(campaignData.participants) || 0;
    }
    if (campaignData.rating) {
      campaignData.rating = parseFloat(campaignData.rating) || 0.0;
    }
    if (campaignData.discount) {
      campaignData.discount = parseInt(campaignData.discount) || 0;
    }
    
    console.log("Final campaign data before save:", campaignData);
    
    // Create and save campaign
    const campaign = new Campaign(campaignData);
    const savedCampaign = await campaign.save();
    
    // Transform response for frontend
    const transformed = transformCampaignData(savedCampaign);
    
    console.log("Campaign created successfully:", transformed._id);
    res.status(201).json(transformed);
  } catch (error) {
    console.error("Error creating campaign:", error);
    res.status(500).json({ 
      message: "Error creating campaign", 
      error: error.message,
      details: error.errors // Include validation errors if any
    });
  }
};

// Update campaign
const updateCampaign = async (req, res) => {
  try {
    console.log("Updating campaign:", req.params.id);
    console.log("Update data:", req.body);
    
    // Prepare update data with field mapping
    const updateData = { ...req.body };
    
    // Handle field mapping
    if (updateData.title && !updateData.campaignName) {
      updateData.campaignName = updateData.title;
    }
    if (updateData.campaignName && !updateData.title) {
      updateData.title = updateData.campaignName;
    }
    
    // Set deadline to endDate if provided
    if (updateData.endDate && !updateData.deadline) {
      updateData.deadline = updateData.endDate;
    }
    
    // Ensure numeric fields are properly typed
    if (updateData.participants !== undefined) {
      updateData.participants = parseInt(updateData.participants) || 0;
    }
    if (updateData.rating !== undefined) {
      updateData.rating = parseFloat(updateData.rating) || 0.0;
    }
    if (updateData.discount !== undefined) {
      updateData.discount = parseInt(updateData.discount) || 0;
    }
    
    updateData.updatedAt = Date.now();
    
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    
    const transformed = transformCampaignData(campaign);
    console.log("Campaign updated successfully");
    
    res.status(200).json(transformed);
  } catch (error) {
    console.error("Error updating campaign:", error);
    res.status(500).json({ 
      message: "Error updating campaign", 
      error: error.message,
      details: error.errors
    });
  }
};

// Delete campaign
const deleteCampaign = async (req, res) => {
  try {
    console.log("Deleting campaign:", req.params.id);
    
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    
    console.log("Campaign deleted successfully");
    res.status(200).json({ message: "Campaign deleted successfully" });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    res.status(500).json({ message: "Error deleting campaign", error: error.message });
  }
};

// Additional utility endpoints
const getCampaignStats = async (req, res) => {
  try {
    const totalCampaigns = await Campaign.countDocuments();
    const activeCampaigns = await Campaign.countDocuments({ status: 'active' });
    const totalParticipants = await Campaign.aggregate([
      { $group: { _id: null, total: { $sum: "$participants" } } }
    ]);
    const avgRating = await Campaign.aggregate([
      { $group: { _id: null, average: { $avg: "$rating" } } }
    ]);
    
    res.status(200).json({
      totalCampaigns,
      activeCampaigns,
      totalParticipants: totalParticipants[0]?.total || 0,
      avgRating: avgRating[0]?.average || 0
    });
  } catch (error) {
    console.error("Error fetching campaign stats:", error);
    res.status(500).json({ message: "Error fetching stats", error: error.message });
  }
};

module.exports = {
  getAllCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignStats
};