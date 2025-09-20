import express from "express";
import { 
  getAllDoctors,
  addDoctor,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  doctorLogin
} from "../controllers/doctorController.js";

const router = express.Router();

// Doctor CRUD
router.get("/", getAllDoctors);
router.post("/", addDoctor);
router.get("/:id", getDoctorById);
router.put("/:id", updateDoctor);
router.delete("/:id", deleteDoctor);

// Doctor Login
router.post("/login", doctorLogin);

export default router;