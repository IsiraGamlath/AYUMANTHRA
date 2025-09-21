const mongoose = require("mongoose");

const routineSchema = new mongoose.Schema({
  // Basic Info - matching your AddRoutine form
  name: {
    type: String,
    required: [true, 'Routine name is required'],
    trim: true,
    minlength: [3, 'Routine name must be at least 3 characters'],
    maxlength: [100, 'Routine name must be less than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [500, 'Description must be less than 500 characters']
  },
  dosha: {
    type: String,
    required: [true, 'Dosha is required'],
    enum: {
      values: ["Vata", "Pitta", "Kapha"],
      message: 'Dosha must be one of: Vata, Pitta, Kapha'
    }
  },
  
  // Form Data from AddRoutine component
  duration: {
    type: Number, // in minutes
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 minute'],
    max: [480, 'Duration must be less than 480 minutes']
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty level is required'],
    enum: {
      values: ["beginner", "intermediate", "advanced"],
      message: 'Difficulty must be one of: beginner, intermediate, advanced'
    }
  },
  timeOfDay: {
    type: String,
    required: [true, 'Time of day is required'],
    enum: {
      values: ["morning", "afternoon", "evening"],
      message: 'Time of day must be one of: morning, afternoon, evening'
    }
  },
  targetAudience: {
    type: String,
    required: [true, 'Target audience is required'],
    trim: true,
    maxlength: [100, 'Target audience must be less than 100 characters']
  },
  imageUrl: {
    type: String,
    default: "",
  },
  
  // Generated Recommendations (arrays) - Auto-populated based on dosha
  diet: [{
    type: String,
    trim: true
  }],
  herbs: [{
    type: String,
    trim: true
  }],
  yoga: [{
    type: String,
    trim: true
  }],
  lifestyle: [{
    type: String,
    trim: true
  }],
  activities: [{
    type: String,
    trim: true
  }],
  benefits: [{
    type: String,
    trim: true
  }],
  
  // User's custom selections (stored separately for reference)
  userDiet: [{
    type: String,
    trim: true
  }],
  userHerbs: [{
    type: String,
    trim: true
  }],
  userYoga: [{
    type: String,
    trim: true
  }],
  userLifestyle: [{
    type: String,
    trim: true
  }],
  
  // Metadata
  createdBy: {
    type: String,
    default: "Admin",
  },
  status: {
    type: String,
    enum: ["active", "inactive", "draft"],
    default: "active",
  },
}, {
  timestamps: true, // This adds createdAt and updatedAt fields automatically
});

// Add indexes for better query performance
routineSchema.index({ dosha: 1 });
routineSchema.index({ difficulty: 1 });
routineSchema.index({ timeOfDay: 1 });
routineSchema.index({ createdAt: -1 });

// Virtual for routine ID (useful for frontend)
routineSchema.virtual('routineId').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
routineSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model("Routine", routineSchema);