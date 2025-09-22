const Supplier = require('../model/Supplier');

// Get all suppliers
const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    return res.status(200).json({ suppliers });
  } catch (err) {
    console.error("Error fetching suppliers:", err);
    return res.status(500).json({ message: 'Error fetching suppliers.' });
  }
};

// Add new supplier
const addSupplier = async (req, res) => {
  const { supplierName, supplierPhone, supplierEmail, supplierPassword, companyName, address, supplyCategory, active } = req.body;

  try {
    const existingSupplier = await Supplier.findOne({ $or: [{ supplierEmail }, { supplierPhone }] });
    if (existingSupplier) return res.status(400).json({ message: 'Supplier with this email or phone exists.' });

    const supplier = new Supplier({
      supplierName: supplierName.trim(),
      supplierPhone: supplierPhone.trim(),
      supplierEmail: supplierEmail.trim(),
      supplierPassword,
      companyName: companyName.trim(),
      address: address.trim(),
      supplyCategory,
      active: active !== undefined ? active : true
    });

    await supplier.save();
    return res.status(201).json({ message: 'Supplier added successfully.', supplier });
  } catch (err) {
    console.error("Error adding supplier:", err);
    return res.status(500).json({ message: 'Error adding supplier.' });
  }
};

// Get supplier by ID
const getSupplierById = async (req, res) => {
  const id = req.params.id.trim();
  if (!id || id.length !== 24) return res.status(400).json({ message: 'Invalid ID.' });

  try {
    const supplier = await Supplier.findById(id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found.' });
    return res.status(200).json({ supplier });
  } catch (err) {
    console.error("Error fetching supplier:", err);
    return res.status(500).json({ message: 'Error fetching supplier.' });
  }
};

// Update supplier
const updateSupplier = async (req, res) => {
  const id = req.params.id.trim();
  if (!id || id.length !== 24) return res.status(400).json({ message: 'Invalid ID.' });

  const { supplierName, supplierPhone, supplierEmail, supplierPassword, companyName, address, supplyCategory, active } = req.body;

  try {
    const duplicate = await Supplier.findOne({ _id: { $ne: id }, $or: [{ supplierEmail }, { supplierPhone }] });
    if (duplicate) return res.status(400).json({ message: 'Email or phone already used by another supplier.' });

    const updateData = {
      supplierName: supplierName?.trim(),
      supplierPhone: supplierPhone?.trim(),
      supplierEmail: supplierEmail?.trim(),
      companyName: companyName?.trim(),
      address: address?.trim(),
      supplyCategory,
      active: active !== undefined ? active : true
    };

    if (supplierPassword) updateData.supplierPassword = supplierPassword;

    const supplier = await Supplier.findByIdAndUpdate(id, updateData, { new: true });
    if (!supplier) return res.status(404).json({ message: 'Supplier not found.' });

    return res.status(200).json({ message: 'Supplier updated successfully.', supplier });
  } catch (err) {
    console.error("Error updating supplier:", err);
    return res.status(500).json({ message: 'Error updating supplier.' });
  }
};

// Delete supplier
const deleteSupplier = async (req, res) => {
  const id = req.params.id.trim();
  if (!id || id.length !== 24) return res.status(400).json({ message: 'Invalid ID.' });

  try {
    const supplier = await Supplier.findByIdAndDelete(id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found.' });
    return res.status(200).json({ message: 'Supplier deleted successfully.' });
  } catch (err) {
    console.error("Error deleting supplier:", err);
    return res.status(500).json({ message: 'Error deleting supplier.' });
  }
};

// ✅ Supplier login
const supplierLogin = async (req, res) => {
  const { supplierEmail, supplierPassword } = req.body;

  try {
    // Trim email for safety
    const supplier = await Supplier.findOne({ supplierEmail: supplierEmail.trim() });

    if (!supplier) return res.status(401).json({ message: 'Invalid email or password' });

    if (supplier.supplierPassword !== supplierPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.status(200).json({ message: 'Login successful', supplier });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: 'Server error during login.' });
  }
};

module.exports = {
  getAllSuppliers,
  addSupplier,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
  supplierLogin
};
