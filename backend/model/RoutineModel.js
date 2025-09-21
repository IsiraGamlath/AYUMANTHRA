const mongoose = require("mongoose");

const routineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  dosha: {
    type: String,
    required: true,
    enum: ['Vata', 'Pitta', 'Kapha', 'Tridosha']
  },
  duration: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  timeOfDay: {
    type: String,
    required: true,
    enum: ['Morning', 'Afternoon', 'Evening', 'Night']
  },
  targetAudience: {
    type: String,
    required: true,
    trim: true
  },
  activities: [{
    type: String,
    trim: true
  }],
  benefits: [{
    type: String,
    trim: true
  }],
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
routineSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Routine", routineSchema);