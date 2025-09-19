const Doctor = require('../model/Doctor');

// Get all doctors
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    return res.status(200).json({ doctors });
  } catch (err) {
    console.error("Error fetching doctors:", err);
    return res.status(500).json({ message: 'An error occurred while fetching doctors.' });
  }
};

// Add new doctor (with duplicate check)
const addDoctor = async (req, res) => {
  const {
    doctorName,
    doctorPhone,
    doctorEmail,
    doctorPassword,
    specialization,
    experienceYears,
    available
  } = req.body;

  try {
    const existingDoctor = await Doctor.findOne({
      $or: [{ doctorEmail }, { doctorPhone }]
    });

    if (existingDoctor) {
      return res.status(400).json({
        message: 'Doctor with this email or phone number already exists.'
      });
    }

    const doctor = new Doctor({
      doctorName,
      doctorPhone,
      doctorEmail,
      doctorPassword,
      specialization,
      experienceYears,
      available,
    });

    await doctor.save();
    return res.status(201).json({ message: 'Doctor added successfully.', doctor });

  } catch (err) {
    console.error("Error adding doctor:", err);
    return res.status(500).json({ message: 'An error occurred while adding a doctor.' });
  }
};

// Get doctor by ID
const getDoctorById = async (req, res) => {
  const id = req.params.id.trim();
  if (!id || id.length !== 24) return res.status(400).json({ message: 'Invalid doctor ID format.' });

  try {
    const doctor = await Doctor.findById(id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found.' });
    return res.status(200).json({ doctor });
  } catch (err) {
    console.error("Error fetching doctor:", err);
    return res.status(500).json({ message: 'An error occurred while fetching the doctor.' });
  }
};

// Update doctor
const updateDoctor = async (req, res) => {
  const id = req.params.id.trim();
  if (!id || id.length !== 24) return res.status(400).json({ message: 'Invalid doctor ID format.' });

  const {
    doctorName,
    doctorPhone,
    doctorEmail,
    doctorPassword,
    specialization,
    experienceYears,
    available
  } = req.body;

  try {
    const duplicate = await Doctor.findOne({
      $and: [
        { _id: { $ne: id } },
        { $or: [{ doctorEmail }, { doctorPhone }] }
      ]
    });

    if (duplicate) {
      return res.status(400).json({
        message: 'Another doctor already uses this email or phone number.'
      });
    }

    const doctor = await Doctor.findByIdAndUpdate(
      id,
      {
        doctorName,
        doctorPhone,
        doctorEmail,
        doctorPassword,
        specialization,
        experienceYears,
        available,
      },
      { new: true }
    );

    if (!doctor) return res.status(404).json({ message: 'Doctor not found.' });

    return res.status(200).json({ message: 'Doctor updated successfully.', doctor });
  } catch (err) {
    console.error("Error updating doctor:", err);
    return res.status(500).json({ message: 'An error occurred while updating the doctor.' });
  }
};

// Delete doctor
const deleteDoctor = async (req, res) => {
  const id = req.params.id.trim();
  if (!id || id.length !== 24) return res.status(400).json({ message: 'Invalid doctor ID format.' });

  try {
    const doctor = await Doctor.findByIdAndDelete(id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found.' });
    return res.status(200).json({ message: 'Doctor successfully deleted.' });
  } catch (err) {
    console.error("Error deleting doctor:", err);
    return res.status(500).json({ message: 'An error occurred while deleting the doctor.' });
  }
};

// Doctor Login
const doctorLogin = async (req, res) => {
  try {
    const { doctorEmail, doctorPassword } = req.body;
    const doctor = await Doctor.findOne({ doctorEmail, doctorPassword });
    if (!doctor) return res.status(401).json({ message: "Invalid credentials" });

    return res.status(200).json({ doctor });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error during login." });
  }
};

module.exports = {
  getAllDoctors,
  addDoctor,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  doctorLogin
};
