const express = require("express");
const router = express.Router();
const {
  getAllRoutines,
  getUserRoutines,
  getRoutinesByUserEmail,
  getRoutineById,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  getDoshaRecommendations
} = require("../Controllers/RoutineController");


// GET /routines/dosha/:dosha - Get dosha recommendations
router.get("/dosha/:dosha", getDoshaRecommendations);

// GET /routines/user/:userId - Get routines for specific user
router.get("/user/:userId", getUserRoutines);

// GET /routines/user-email/:userEmail - Get routines by user email
router.get("/user-email/:userEmail", getRoutinesByUserEmail);

// GET /routines - Get all routines (admin only)
router.get("/", getAllRoutines);

// GET /routines/:id - Get routine by ID
router.get("/:id", getRoutineById);

// POST /routines - Create new routine
router.post("/", createRoutine);

// PUT /routines/:id - Update routine
router.put("/:id", updateRoutine);

// DELETE /routines/:id - Delete routine
router.delete("/:id", deleteRoutine);



module.exports = router;