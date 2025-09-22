const ProjectManager = require('../model/projectManager'); // model import

// Get all project managers
const getAllManagers = async (req, res) => {
  try {
    const managers = await ProjectManager.find().select('-managerPassword');
    return res.status(200).json({ managers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'An error occurred while fetching project managers.' });
  }
};

// Add new project manager
const addManager = async (req, res) => {
  const { firstName, lastName, nic, managerEmail, managerPhone, managerPassword } = req.body;
  try {
    const manager = new ProjectManager({
      firstName,
      lastName,
      nic,
      managerEmail,
      managerPhone,
      managerPassword,
    });
    await manager.save();
    return res.status(201).json({ manager });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'An error occurred while adding a project manager.' });
  }
};

// Get project manager by ID
const getManagerById = async (req, res) => {
  const id = req.params.id?.trim();
  if (!id || id.length !== 24) return res.status(400).json({ message: 'Invalid manager ID.' });

  try {
    const manager = await ProjectManager.findById(id).select('-managerPassword');
    if (!manager) return res.status(404).json({ message: 'Project manager not found.' });
    return res.status(200).json({ manager });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'An error occurred while fetching the project manager.' });
  }
};

// Update project manager
const updateManager = async (req, res) => {
  const id = req.params.id?.trim();
  const { firstName, lastName, nic, managerEmail, managerPhone, managerPassword } = req.body;

  if (!id || id.length !== 24) return res.status(400).json({ message: 'Invalid manager ID.' });

  try {
    const manager = await ProjectManager.findByIdAndUpdate(
      id,
      { firstName, lastName, nic, managerEmail, managerPhone, managerPassword },
      { new: true }
    ).select('-managerPassword');

    if (!manager) return res.status(404).json({ message: 'Project manager not found.' });
    return res.status(200).json({ manager });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'An error occurred while updating the project manager.' });
  }
};

// Delete project manager
const deleteManager = async (req, res) => {
  const id = req.params.id?.trim();
  if (!id || id.length !== 24) return res.status(400).json({ message: 'Invalid manager ID.' });

  try {
    const manager = await ProjectManager.findByIdAndRemove(id);
    if (!manager) return res.status(404).json({ message: 'Project manager not found.' });
    return res.status(200).json({ message: 'Project manager successfully deleted.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'An error occurred while deleting the project manager.' });
  }
};

// ✅ Project Manager Login
const loginManager = async (req, res) => {
  const { managerEmail, managerPassword } = req.body;

  if (!managerEmail || !managerPassword) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const manager = await ProjectManager.findOne({ managerEmail, managerPassword });
    if (!manager) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // return manager data without password
    const managerData = manager.toObject();
    delete managerData.managerPassword;

    return res.status(200).json({ manager: managerData });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error while logging in." });
  }
};

module.exports = {
  getAllManagers,
  addManager,
  getManagerById,
  updateManager,
  deleteManager,
  loginManager, // add login
};
