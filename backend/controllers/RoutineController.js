const Routine = require("../model/RoutineModel");

// Get all routines
const getAllRoutines = async (req, res) => {
  try {
    const routines = await Routine.find().sort({ createdAt: -1 });
    res.status(200).json(routines);
  } catch (error) {
    res.status(500).json({ message: "Error fetching routines", error: error.message });
  }
};

// Get routine by ID
const getRoutineById = async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);
    if (!routine) {
      return res.status(404).json({ message: "Routine not found" });
    }
    res.status(200).json(routine);
  } catch (error) {
    res.status(500).json({ message: "Error fetching routine", error: error.message });
  }
};

// Create new routine
const createRoutine = async (req, res) => {
  try {
    const routine = new Routine(req.body);
    const savedRoutine = await routine.save();
    res.status(201).json(savedRoutine);
  } catch (error) {
    res.status(500).json({ message: "Error creating routine", error: error.message });
  }
};

// Update routine
const updateRoutine = async (req, res) => {
  try {
    const routine = await Routine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!routine) {
      return res.status(404).json({ message: "Routine not found" });
    }
    res.status(200).json(routine);
  } catch (error) {
    res.status(500).json({ message: "Error updating routine", error: error.message });
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
  } catch (error) {
    res.status(500).json({ message: "Error deleting routine", error: error.message });
  }
};

// Get dosha recommendations
const getDoshaRecommendations = async (req, res) => {
  try {
    const { dosha } = req.params;
    
    // Sample dosha recommendations - you can expand this
    const recommendations = {
      Vata: {
        activities: ["Gentle yoga", "Meditation", "Warm baths", "Oil massage"],
        benefits: ["Calms nervous system", "Reduces anxiety", "Improves sleep"],
        diet: ["Warm foods", "Cooked vegetables", "Nuts and seeds", "Warm drinks"],
        herbs: ["Ashwagandha", "Brahmi", "Shatavari", "Licorice"],
        yoga: ["Restorative poses", "Forward bends", "Gentle twists"],
        lifestyle: ["Regular routine", "Early bedtime", "Warm environment"]
      },
      Pitta: {
        activities: ["Cooling yoga", "Swimming", "Nature walks", "Cool baths"],
        benefits: ["Reduces inflammation", "Cools body heat", "Balances digestion"],
        diet: ["Cool foods", "Fresh fruits", "Coconut water", "Mint tea"],
        herbs: ["Aloe vera", "Coriander", "Fennel", "Rose"],
        yoga: ["Moon salutations", "Cooling poses", "Breathing exercises"],
        lifestyle: ["Avoid midday sun", "Cool environment", "Regular meals"]
      },
      Kapha: {
        activities: ["Dynamic yoga", "Cardio exercises", "Dancing", "Hiking"],
        benefits: ["Increases energy", "Improves circulation", "Reduces congestion"],
        diet: ["Light foods", "Spicy foods", "Warm drinks", "Raw vegetables"],
        herbs: ["Ginger", "Turmeric", "Black pepper", "Tulsi"],
        yoga: ["Sun salutations", "Backbends", "Inversions"],
        lifestyle: ["Early morning routine", "Regular exercise", "Warm environment"]
      },
      Tridosha: {
        activities: ["Balanced yoga", "Meditation", "Walking", "Breathing exercises"],
        benefits: ["Overall balance", "Mental clarity", "Physical health"],
        diet: ["Balanced meals", "Seasonal foods", "Moderate portions"],
        herbs: ["Tulsi", "Triphala", "Ashwagandha", "Brahmi"],
        yoga: ["Balanced practice", "All pose types", "Breathing exercises"],
        lifestyle: ["Regular routine", "Moderate activity", "Balanced environment"]
      }
    };

    const doshaData = recommendations[dosha];
    if (!doshaData) {
      return res.status(404).json({ message: "Dosha not found" });
    }

    res.status(200).json({
      dosha,
      recommendations: doshaData
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dosha recommendations", error: error.message });
  }
};

module.exports = {
  getAllRoutines,
  getRoutineById,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  getDoshaRecommendations
};