const express = require("express");
const router = express.Router();
const Routine = require("../model/RoutineModel");

// --------------------
// GET all routines - Changed from "/routines" to "/"
// --------------------
router.get("/", async (req, res) => {
  try {
    const routines = await Routine.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, routines, count: routines.length });
  } catch (error) {
    console.error("Error fetching routines:", error);
    res.status(500).json({ success: false, message: "Failed to fetch routines", error: error.message });
  }
});

// --------------------
// POST create routine - Changed from "/routines" to "/"
// --------------------
router.post("/", async (req, res) => {
  try {
    const { name, description, dosha, duration, difficulty, timeOfDay, targetAudience } = req.body;

    if (!name || !description || !dosha || !duration || !difficulty || !timeOfDay || !targetAudience) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        required: ["name", "description", "dosha", "duration", "difficulty", "timeOfDay", "targetAudience"]
      });
    }

    const validDoshas = ["Vata", "Pitta", "Kapha"];
    const validDifficulties = ["beginner", "intermediate", "advanced"];
    const validTimeOfDay = ["morning", "afternoon", "evening"];

    if (!validDoshas.includes(dosha)) return res.status(400).json({ success: false, message: `Invalid dosha` });
    if (!validDifficulties.includes(difficulty)) return res.status(400).json({ success: false, message: `Invalid difficulty` });
    if (!validTimeOfDay.includes(timeOfDay)) return res.status(400).json({ success: false, message: `Invalid timeOfDay` });

    const recommendations = generateDoshaRecommendations(dosha);

    const routineData = {
      name: name.trim(),
      description: description.trim(),
      dosha,
      duration: parseInt(duration),
      difficulty,
      timeOfDay,
      targetAudience: targetAudience.trim(),
      imageUrl: req.body.imageUrl || "",
      diet: recommendations.diet,
      herbs: recommendations.herbs,
      yoga: recommendations.yoga,
      lifestyle: recommendations.lifestyle,
      activities: recommendations.activities,
      benefits: recommendations.benefits,
      userDiet: req.body.userDiet || [],
      userHerbs: req.body.userHerbs || [],
      userYoga: req.body.userYoga || [],
      userLifestyle: req.body.userLifestyle || []
    };

    const newRoutine = new Routine(routineData);
    const savedRoutine = await newRoutine.save();

    res.status(201).json({ success: true, message: "Routine created successfully", routine: savedRoutine });
  } catch (error) {
    console.error("Error creating routine:", error);
    res.status(500).json({ success: false, message: "Failed to create routine", error: error.message });
  }
});

// --------------------
// GET single routine by ID - ADD THIS ROUTE
// --------------------
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching routine with ID:", id);
    
    const routine = await Routine.findById(id);
    
    if (!routine) {
      console.log("Routine not found with ID:", id);
      return res.status(404).json({ 
        success: false, 
        message: "Routine not found",
        routineId: id
      });
    }
    
    console.log("Found routine:", routine.name);
    res.status(200).json({ 
      success: true, 
      routine 
    });
    
  } catch (error) {
    console.error("Error fetching routine by ID:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch routine", 
      error: error.message 
    });
  }
});

// Add this route to your router after the GET /:id route

// --------------------
// PUT update routine by ID - NEW ROUTE TO ADD
// --------------------
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Updating routine with ID:", id);
    console.log("Update data received:", req.body);
    
    const { 
      name, 
      description, 
      dosha, 
      duration, 
      difficulty, 
      timeOfDay, 
      targetAudience,
      userDiet,
      userHerbs, 
      userYoga,
      userLifestyle,
      userActivities,
      userBenefits
    } = req.body;

    // Validation
    if (!name || !description || !dosha || !duration || !difficulty || !timeOfDay || !targetAudience) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        required: ["name", "description", "dosha", "duration", "difficulty", "timeOfDay", "targetAudience"]
      });
    }

    const validDoshas = ["Vata", "Pitta", "Kapha"];
    const validDifficulties = ["beginner", "intermediate", "advanced"];
    const validTimeOfDay = ["morning", "afternoon", "evening"];

    if (!validDoshas.includes(dosha)) {
      return res.status(400).json({ success: false, message: `Invalid dosha. Must be one of: ${validDoshas.join(', ')}` });
    }
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({ success: false, message: `Invalid difficulty. Must be one of: ${validDifficulties.join(', ')}` });
    }
    if (!validTimeOfDay.includes(timeOfDay)) {
      return res.status(400).json({ success: false, message: `Invalid timeOfDay. Must be one of: ${validTimeOfDay.join(', ')}` });
    }

    // Generate fresh dosha recommendations if dosha changed
    const recommendations = generateDoshaRecommendations(dosha);

    // Prepare update data
    const updateData = {
      name: name.trim(),
      description: description.trim(),
      dosha,
      duration: parseInt(duration),
      difficulty,
      timeOfDay,
      targetAudience: targetAudience.trim(),
      
      // Keep existing system recommendations but allow user customizations
      diet: recommendations.diet,
      herbs: recommendations.herbs,
      yoga: recommendations.yoga,
      lifestyle: recommendations.lifestyle,
      activities: recommendations.activities,
      benefits: recommendations.benefits,
      
      // Update user customizations
      userDiet: userDiet || [],
      userHerbs: userHerbs || [],
      userYoga: userYoga || [],
      userLifestyle: userLifestyle || [],
      userActivities: userActivities || [],
      userBenefits: userBenefits || [],
      
      updatedAt: new Date()
    };

    console.log("Prepared update data:", updateData);

    // Find and update the routine
    const updatedRoutine = await Routine.findByIdAndUpdate(
      id, 
      updateData, 
      { 
        new: true,           // Return updated document
        runValidators: true  // Run mongoose validations
      }
    );
    
    if (!updatedRoutine) {
      console.log("Routine not found with ID:", id);
      return res.status(404).json({ 
        success: false, 
        message: "Routine not found",
        routineId: id
      });
    }
    
    console.log("✅ Routine updated successfully:", updatedRoutine.name);
    res.status(200).json({ 
      success: true, 
      message: "Routine updated successfully",
      routine: updatedRoutine 
    });
    
  } catch (error) {
    console.error("❌ Error updating routine:", error);
    
    // Handle specific mongoose errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: "Validation failed", 
        errors: error.errors 
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid routine ID format" 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Failed to update routine", 
      error: error.message 
    });
  }
});

// --------------------
// DELETE routine - Changed from "/routines/:id" to "/:id"
// --------------------
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRoutine = await Routine.findByIdAndDelete(id);
    if (!deletedRoutine) return res.status(404).json({ success: false, message: "Routine not found" });
    res.status(200).json({ success: true, message: "Routine deleted successfully", routine: deletedRoutine });
  } catch (error) {
    console.error("Error deleting routine:", error);
    res.status(500).json({ success: false, message: "Failed to delete routine", error: error.message });
  }
});

// --------------------
// GET dosha recommendations - Changed from "/routines/dosha/:dosha" to "/dosha/:dosha"
// --------------------
router.get("/dosha/:dosha", async (req, res) => {
  try {
    const { dosha } = req.params;
    console.log("=== DOSHA RECOMMENDATIONS REQUEST ===");
    console.log("Requested dosha:", dosha);
    console.log("Request URL:", req.url);
    
    const validDoshas = ["Vata", "Pitta", "Kapha"];
    if (!validDoshas.includes(dosha)) {
      console.log("❌ Invalid dosha provided:", dosha);
      return res.status(400).json({ 
        success: false, 
        message: "Invalid dosha",
        validDoshas: validDoshas,
        providedDosha: dosha
      });
    }

    const recommendations = generateDoshaRecommendations(dosha);
    console.log("✅ Found recommendations for", dosha);
    
    res.status(200).json({ 
      success: true, 
      dosha,
      recommendations 
    });
  } catch (error) {
    console.error("❌ Error fetching dosha recommendations:", error);
    res.status(500).json({ success: false, message: "Failed to fetch recommendations", error: error.message });
  }
});

// --------------------
// Dosha recommendation helper
// --------------------
function generateDoshaRecommendations(dosha) {
  const recommendations = {
    Vata: {
      diet: ["Warm foods", "Sweet, sour, salty tastes", "Healthy fats", "Regular meals", "Avoid cold foods"],
      herbs: ["Ashwagandha", "Brahmi", "Triphala", "Jatamansi"],
      yoga: ["Gentle movements", "Restorative poses", "Sun Salutations", "Hip opening", "Meditation"],
      lifestyle: ["Sleep schedule", "Oil massage", "Warm baths", "Routine", "Avoid overstimulation"],
      activities: ["Walking", "Swimming", "Creative arts", "Reading", "Journaling"],
      benefits: ["Grounding", "Better sleep", "Reduced anxiety", "Creativity", "Immunity"]
    },
    Pitta: {
      diet: ["Cool foods", "Sweet, bitter, astringent", "Coconut water", "Avoid spicy", "Regular meals"],
      herbs: ["Aloe vera", "Neem", "Shatavari", "Coriander"],
      yoga: ["Moon salutations", "Forward bends", "Twisting", "Cooling pranayama", "Meditation near water"],
      lifestyle: ["Avoid heat", "Cool showers", "Peaceful environment", "Avoid competition", "Practice patience"],
      activities: ["Swimming", "Evening walks", "Reading", "Moonlight meditation", "Gardening"],
      benefits: ["Reduced inflammation", "Digestion", "Focus", "Emotional balance", "Clear skin"]
    },
    Kapha: {
      diet: ["Light, warm, spicy foods", "Pungent, bitter, astringent", "Ginger", "Avoid heavy foods", "Skip breakfast occasionally"],
      herbs: ["Trikatu", "Guggul", "Tulsi", "Punarnava"],
      yoga: ["Sun salutations", "Backbends", "Hot yoga", "Breathwork", "Power yoga"],
      lifestyle: ["Early rising", "Exercise", "Dry brushing", "No naps", "Stay active"],
      activities: ["Running", "Dancing", "Hiking", "Team sports", "HIIT"],
      benefits: ["Energy", "Weight management", "Circulation", "Motivation", "Respiratory health"]
    }
  };
  return recommendations[dosha] || { diet: [], herbs: [], yoga: [], lifestyle: [], activities: [], benefits: [] };
}

module.exports = router;