const Routine = require("../model/RoutineModel");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Simple multer configuration (no file storage needed)
const upload = multer();

// Dosha recommendations
const doshaRecommendations = {
  Vata: {
    diet: ["Warm soups", "Stews", "Cooked grains", "Avoid raw/cold foods", "Ghee and oils", "Sweet fruits", "Cooked vegetables"],
    herbs: ["Ashwagandha", "Triphala", "Ginger tea", "Brahmi", "Jatamansi"],
    yoga: ["Hatha Yoga", "Restorative Yoga", "Gentle stretching", "Pranayama"],
    lifestyle: ["Maintain a regular routine", "Keep warm", "Avoid overstimulation", "Practice meditation", "Get adequate sleep", "Oil massages"],
    activities: ["Meditation", "Gentle yoga", "Walking", "Breathing exercises", "Journaling"],
    benefits: ["Improved digestion", "Better sleep", "Reduced anxiety", "Enhanced creativity", "Grounded energy"],
  },
  Pitta: {
    diet: ["Cucumbers", "Melons", "Leafy greens", "Avoid spicy/fried foods", "Coconut water", "Sweet fruits", "Cool foods"],
    herbs: ["Neem", "Aloe vera", "Brahmi", "Amla", "Coriander"],
    yoga: ["Cooling yoga poses", "Slow breathing", "Moon salutation", "Yin yoga"],
    lifestyle: ["Stay cool", "Avoid conflicts", "Spend time in nature", "Do calming activities", "Avoid midday sun", "Practice patience"],
    activities: ["Swimming", "Moon gazing", "Nature walks", "Reading", "Art therapy"],
    benefits: ["Reduced inflammation", "Better mood", "Improved focus", "Healthy skin", "Balanced emotions"],
  },
  Kapha: {
    diet: ["Light foods", "Dry foods", "Steamed veggies", "Avoid heavy dairy/fried foods", "Spices", "Warm beverages"],
    herbs: ["Turmeric", "Trikatu", "Tulsi", "Guggul", "Ginger"],
    yoga: ["Vinyasa Yoga", "Power Yoga", "Dynamic movements", "Sun salutation"],
    lifestyle: ["Stay active", "Wake up early", "Engage in stimulating activities", "Avoid daytime naps", "Keep environment warm and dry", "Social activities"],
    activities: ["Cardio exercise", "Dancing", "Hiking", "Team sports", "Public speaking"],
    benefits: ["Weight management", "Increased energy", "Better circulation", "Enhanced motivation", "Improved metabolism"],
  },
};

// Helper functions
const mergeArrays = (doshaArr, userArr) => {
  if (!userArr || !Array.isArray(userArr)) return doshaArr;
  return Array.from(new Set([...doshaArr, ...userArr]));
};

const parseArray = (arr) => {
  if (!arr) return [];
  if (Array.isArray(arr)) return arr;
  if (typeof arr === "string") {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(arr);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      // If JSON parse fails, split by comma
      return arr.split(",").map((item) => item.trim()).filter((item) => item);
    }
  }
  return [];
};

// Create routine
const createRoutine = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);

    const {
      name, description, dosha, duration, difficulty, timeOfDay, targetAudience,
      activities, benefits, userDiet, userHerbs, userYoga, userLifestyle,
    } = req.body;

    // Validation
    if (!name || !dosha || !description) {
      return res.status(400).json({ 
        message: "Routine Name, Dosha, and Description are required",
        received: { name, dosha, description }
      });
    }

    const recommendations = doshaRecommendations[dosha];
    if (!recommendations) {
      return res.status(400).json({ 
        message: "Invalid dosha type",
        validDoshas: Object.keys(doshaRecommendations)
      });
    }

    // No image handling needed
    let finalImageUrl = "";

    // Parse and merge arrays
    const parsedUserDiet = parseArray(userDiet);
    const parsedUserHerbs = parseArray(userHerbs);
    const parsedUserYoga = parseArray(userYoga);
    const parsedUserLifestyle = parseArray(userLifestyle);
    const parsedActivities = parseArray(activities);
    const parsedBenefits = parseArray(benefits);

    const routine = new Routine({
      name,
      description,
      dosha,
      duration: Number(duration) || 30,
      difficulty: difficulty || "beginner",
      timeOfDay: timeOfDay || "morning",
      targetAudience: targetAudience || "General",
      imageUrl: finalImageUrl,

      

      // Merge dosha recommendations with user input
      diet: mergeArrays(recommendations.diet, parsedUserDiet),
      herbs: mergeArrays(recommendations.herbs, parsedUserHerbs),
      yoga: mergeArrays(recommendations.yoga, parsedUserYoga),
      lifestyle: mergeArrays(recommendations.lifestyle, parsedUserLifestyle),
      activities: mergeArrays(recommendations.activities, parsedActivities),
      benefits: mergeArrays(recommendations.benefits, parsedBenefits),

      // Store user additions separately
      userDiet: parsedUserDiet,
      userHerbs: parsedUserHerbs,
      userYoga: parsedUserYoga,
      userLifestyle: parsedUserLifestyle,
    });

    const savedRoutine = await routine.save();
    console.log("Routine saved successfully:", savedRoutine._id);

    res.status(201).json({ 
      message: "Routine created successfully", 
      routine: savedRoutine 
    });
  } catch (err) {
    console.error("Error creating routine:", err);
    res.status(500).json({ 
      message: "Server error", 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Get all routines
const getAllRoutines = async (req, res) => {
  try {
    const routines = await Routine.find().sort({ createdAt: -1 });
    res.status(200).json({ 
      routines, 
      count: routines.length 
    });
  } catch (err) {
    console.error("Error fetching routines:", err);
    res.status(500).json({ 
      message: "Server error", 
      error: err.message 
    });
  }
};

// Get routine by ID
const getRoutineById = async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);
    if (!routine) {
      return res.status(404).json({ message: "Routine not found" });
    }
    res.status(200).json({ routine });
  } catch (err) {
    console.error("Error fetching routine:", err);
    if (err.name === 'CastError') {
      return res.status(400).json({ message: "Invalid routine ID format" });
    }
    res.status(500).json({ 
      message: "Server error", 
      error: err.message 
    });
  }
};

// Update routine
const updateRoutine = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body };

    // Parse array fields if they exist
    ['activities', 'benefits', 'diet', 'herbs', 'yoga', 'lifestyle', 'userDiet', 'userHerbs', 'userYoga', 'userLifestyle'].forEach(field => {
      if (updateData[field]) {
        updateData[field] = parseArray(updateData[field]);
      }
    });

    const routine = await Routine.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!routine) {
      return res.status(404).json({ message: "Routine not found" });
    }

    res.status(200).json({ 
      message: "Routine updated successfully", 
      routine 
    });
  } catch (err) {
    console.error("Error updating routine:", err);
    if (err.name === 'CastError') {
      return res.status(400).json({ message: "Invalid routine ID format" });
    }
    res.status(500).json({ 
      message: "Server error", 
      error: err.message 
    });
  }
};

// Delete routine
const deleteRoutine = async (req, res) => {
  try {
    const routine = await Routine.findByIdAndDelete(req.params.id);
    
    if (!routine) {
      return res.status(404).json({ message: "Routine not found" });
    }

    res.status(200).json({ message: "Routine deleted successfully" });
  } catch (err) {
    console.error("Error deleting routine:", err);
    if (err.name === 'CastError') {
      return res.status(400).json({ message: "Invalid routine ID format" });
    }
    res.status(500).json({ 
      message: "Server error", 
      error: err.message 
    });
  }
};

// Get dosha recommendations
// Add this debug version to your RoutineController.js to test
// Replace or add this function to your existing controller

const getDoshaRecommendations = async (req, res) => {
  try {
    const { dosha } = req.params;
    
    // Debug logs
    console.log("=== DOSHA RECOMMENDATIONS REQUEST ===");
    console.log("Requested dosha:", dosha);
    console.log("Request params:", req.params);
    console.log("Request URL:", req.url);
    console.log("Request method:", req.method);
    
    if (!dosha) {
      console.log("❌ No dosha parameter provided");
      return res.status(400).json({ 
        success: false,
        message: "Dosha parameter is required" 
      });
    }

    // Check if dosha exists in recommendations
    const validDoshas = Object.keys(doshaRecommendations);
    console.log("Valid doshas:", validDoshas);
    
    if (!validDoshas.includes(dosha)) {
      console.log("❌ Invalid dosha provided:", dosha);
      return res.status(404).json({ 
        success: false,
        message: "Dosha recommendations not found",
        providedDosha: dosha,
        availableDoshas: validDoshas
      });
    }

    const recommendations = doshaRecommendations[dosha];
    console.log("✅ Found recommendations for", dosha);
    console.log("Recommendations keys:", Object.keys(recommendations));

    // Return successful response
    res.status(200).json({ 
      success: true,
      dosha, 
      recommendations 
    });
    
  } catch (err) {
    console.error("❌ Error in getDoshaRecommendations:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: err.message 
    });
  }
};



// Alias for generateRoutine (keeping for backward compatibility)
const generateRoutine = createRoutine;

module.exports = {
  createRoutine,
  generateRoutine,
  getAllRoutines,
  getRoutineById,
  updateRoutine,
  deleteRoutine,
  getDoshaRecommendations,
  upload,
};