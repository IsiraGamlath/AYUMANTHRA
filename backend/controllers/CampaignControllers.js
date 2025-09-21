const Campaign = require("../model/CampaignModel");

// GET all campaigns
const getAllCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find();
        if (!campaigns || campaigns.length === 0) {
            return res.status(404).json({ message: "No campaigns found" });
        }
        res.status(200).json({ campaigns });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// GET campaign by ID
const getById = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) {
            return res.status(404).json({ message: "Campaign not found" });
        }
        res.status(200).json({ campaign });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// POST new campaign
const addCampaign = async (req, res) => {
    try {
        const { campaignName, description, status, deadline, participants, rating, discount } = req.body;

        // Validate required fields
        if (!campaignName || !description || !deadline) {
            return res.status(400).json({ message: "Required fields missing" });
        }

        // Image URL handling
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl;

        const campaign = new Campaign({
            campaignName,
            description,
            status: status || "active",
            deadline: new Date(deadline),
            participants: Number(participants) || 0,
            rating: Number(rating) || 0,
            discount: Number(discount) || 0,
            imageUrl,
        });

        await campaign.save();
        res.status(201).json({ campaign });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Unable to add campaign" });
    }
};

// UPDATE campaign
const updateCampaign = async (req, res) => {
    try {
        const { campaignName, description, status, deadline, participants, rating, discount } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl;

        const campaign = await Campaign.findByIdAndUpdate(
            req.params.id,
            {
                campaignName,
                description,
                status,
                deadline: deadline ? new Date(deadline) : undefined,
                participants: participants ? Number(participants) : undefined,
                rating: rating ? Number(rating) : undefined,
                discount: discount ? Number(discount) : undefined,
                imageUrl,
            },
            { new: true, runValidators: true }
        );

        if (!campaign) {
            return res.status(404).json({ message: "Unable to update campaign details." });
        }

        res.status(200).json({ campaign });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// DELETE campaign
const deleteCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findByIdAndDelete(req.params.id);
        if (!campaign) {
            return res.status(404).json({ message: "Unable to delete campaign details." });
        }
        res.status(200).json({ message: "Campaign deleted successfully", campaign });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    getAllCampaigns,
    getById,
    addCampaign,
    updateCampaign,
    deleteCampaign,
};
