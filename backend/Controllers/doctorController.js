import Doctor from '../Model/doctorModel.js';

// Get all doctors
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    return res.status(200).json({ doctors });
  } catch (err) {
    console.error("Error fetching doctors:", err);
    return res.status(500).json({ message: 'An error occurred while fetching doctors.' });
  }
};

// Add new doctor (with duplicate check)
export const addDoctor = async (req, res) => {
  const {
    doctorId,
    name,
    specialization,
    email,
    phone,
    consultationFee
  } = req.body;

  try {
    const existingDoctor = await Doctor.findOne({
      $or: [{ email }, { phone }, { doctorId }]
    });

    if (existingDoctor) {
      return res.status(400).json({
        message: 'Doctor with this email, phone number, or doctor ID already exists.'
      });
    }

    const doctor = new Doctor({
      doctorId,
      name,
      specialization,
      email,
      phone,
      consultationFee,
    });

    await doctor.save();
    return res.status(201).json({ message: 'Doctor added successfully.', doctor });

  } catch (err) {
    console.error("Error adding doctor:", err);
    return res.status(500).json({ message: 'An error occurred while adding a doctor.' });
  }
};

// Get doctor by ID
export const getDoctorById = async (req, res) => {
  const { id } = req.params;
  
  if (!id) return res.status(400).json({ message: 'Doctor ID is required.' });

  try {
    const doctor = await Doctor.findOne({ doctorId: id });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found.' });
    return res.status(200).json({ doctor });
  } catch (err) {
    console.error("Error fetching doctor:", err);
    return res.status(500).json({ message: 'An error occurred while fetching the doctor.' });
  }
};

// Update doctor
export const updateDoctor = async (req, res) => {
  const { id } = req.params;
  
  if (!id) return res.status(400).json({ message: 'Doctor ID is required.' });

  const {
    name,
    specialization,
    email,
    phone,
    consultationFee
  } = req.body;

  try {
    const duplicate = await Doctor.findOne({
      doctorId: { $ne: id },
      $or: [{ email }, { phone }]
    });

    if (duplicate) {
      return res.status(400).json({
        message: 'Another doctor already uses this email or phone number.'
      });
    }

    const doctor = await Doctor.findOneAndUpdate(
      { doctorId: id },
      {
        name,
        specialization,
        email,
        phone,
        consultationFee,
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
export const deleteDoctor = async (req, res) => {
  const { id } = req.params;
  
  if (!id) return res.status(400).json({ message: 'Doctor ID is required.' });

  try {
    const doctor = await Doctor.findOneAndDelete({ doctorId: id });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found.' });
    return res.status(200).json({ message: 'Doctor successfully deleted.' });
  } catch (err) {
    console.error("Error deleting doctor:", err);
    return res.status(500).json({ message: 'An error occurred while deleting the doctor.' });
  }
};

// Doctor Login
export const doctorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await Doctor.findOne({ email, password });
    if (!doctor) return res.status(401).json({ message: "Invalid credentials" });

    return res.status(200).json({ doctor });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error during login." });
  }
};