const InventoryManager = require('../model/inventoryManager'); // ✅ import model

// Get all inventory managers
const getAllManagers = async (req, res) => {
  try {
    const managers = await InventoryManager.find().select('-managerPassword');
    return res.status(200).json({ managers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'An error occurred while fetching inventory managers.' });
  }
};

// Add new inventory manager
const addManager = async (req, res) => {
  const { firstName, lastName, nic, managerEmail, managerPhone, managerPassword, category } = req.body;
  try {
    const manager = new InventoryManager({
      firstName,
      lastName,
      nic,
      managerEmail,
      managerPhone,
      managerPassword,
      category, // ✅ include category
    });
    await manager.save();
    const managerData = manager.toObject();
    delete managerData.managerPassword; // remove password before sending
    return res.status(201).json({ manager: managerData });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'An error occurred while adding an inventory manager.' });
  }
};

// Get inventory manager by ID
const getManagerById = async (req, res) => {
  const id = req.params.id?.trim();
  if (!id || id.length !== 24) return res.status(400).json({ message: 'Invalid manager ID.' });

  try {
    const manager = await InventoryManager.findById(id).select('-managerPassword');
    if (!manager) return res.status(404).json({ message: 'Inventory manager not found.' });
    return res.status(200).json({ manager });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'An error occurred while fetching the inventory manager.' });
  }
};

// Update inventory manager
const updateManager = async (req, res) => {
  const id = req.params.id?.trim();
  const { firstName, lastName, nic, managerEmail, managerPhone, managerPassword, category } = req.body;

  if (!id || id.length !== 24) return res.status(400).json({ message: 'Invalid manager ID.' });

  try {
    const manager = await InventoryManager.findByIdAndUpdate(
      id,
      { firstName, lastName, nic, managerEmail, managerPhone, managerPassword, category },
      { new: true }
    ).select('-managerPassword');

    if (!manager) return res.status(404).json({ message: 'Inventory manager not found.' });
    return res.status(200).json({ manager });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'An error occurred while updating the inventory manager.' });
  }
};

// Delete inventory manager
const deleteManager = async (req, res) => {
  const id = req.params.id?.trim();
  if (!id || id.length !== 24) return res.status(400).json({ message: 'Invalid manager ID.' });

  try {
    const manager = await InventoryManager.findByIdAndRemove(id);
    if (!manager) return res.status(404).json({ message: 'Inventory manager not found.' });
    return res.status(200).json({ message: 'Inventory manager successfully deleted.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'An error occurred while deleting the inventory manager.' });
  }
};

// ✅ Inventory Manager Login
const loginManager = async (req, res) => {
  const { managerEmail, managerPassword } = req.body;

  if (!managerEmail || !managerPassword) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const manager = await InventoryManager.findOne({ managerEmail, managerPassword });
    if (!manager) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const managerData = manager.toObject();
    delete managerData.managerPassword; // remove password before sending
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
  loginManager, // ✅ added login
};
