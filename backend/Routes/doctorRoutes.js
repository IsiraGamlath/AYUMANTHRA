const express = require("express");
const { 
  getAllDoctors,
  addDoctor,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  doctorLogin
} = require("../Controllers/doctorController");
const router = express.Router();

// Doctor CRUD
router.get("/", getAllDoctors);
router.post("/", addDoctor);
router.get("/:id", getDoctorById);
router.put("/:id", updateDoctor);
router.delete("/:id", deleteDoctor);

// Doctor Login
router.post("/login", doctorLogin);

module.exports = router;