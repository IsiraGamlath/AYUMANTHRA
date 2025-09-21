const express = require("express");
const router = express.Router();
const {
  getAllRoutines,
  getRoutineById,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  getDoshaRecommendations
} = require("../Controllers/RoutineController");

// GET /routines - Get all routines
router.get("/", getAllRoutines);

// GET /routines/:id - Get routine by ID
router.get("/:id", getRoutineById);

// POST /routines - Create new routine
router.post("/", createRoutine);

// PUT /routines/:id - Update routine
router.put("/:id", updateRoutine);

// DELETE /routines/:id - Delete routine
router.delete("/:id", deleteRoutine);

// GET /routines/dosha/:dosha - Get dosha recommendations
router.get("/dosha/:dosha", getDoshaRecommendations);

module.exports = router;