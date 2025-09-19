const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");

// Doctor CRUD
router.get("/", doctorController.getAllDoctors);
router.post("/", doctorController.addDoctor);
router.get("/:id", doctorController.getDoctorById);
router.put("/:id", doctorController.updateDoctor);
router.delete("/:id", doctorController.deleteDoctor);

// Doctor Login
router.post("/login", doctorController.doctorLogin);

module.exports = router;
