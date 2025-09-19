const Inventory = require("../Model/InventoryModel");

// Controller to get all inventory items
const getAllInventory = async (req, res, next) => {
    let inventories;

    try {
        inventories = await Inventory.find(); // fetch all inventory items
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }

    // If there are no inventories
    if (!inventories || inventories.length === 0) {
        return res.status(404).json({ message: "Inventories not found" });
    }

    // Return inventories
    return res.status(200).json({ inventories });
};

// Data insert
// Create function
const addInventory = async (req, res, next) => {
    const inventoriesData = req.body; // expecting single object

    // If image uploaded, save image path
    if (req.file) {
        inventoriesData.image = `/uploads/${req.file.filename}`;
    }

    let savedInventory;
    try {
        const inventory = new Inventory(inventoriesData);
        savedInventory = await inventory.save(); // save to database
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Unable to add inventory", error: err.message });
    }

    // Return saved inventory
    return res.status(201).json({ savedInventory });
};

// Get by ID
// Create function
const getById = async (req, res, next) => {
    const id = req.params.id;
    let inventory;

    try {
        inventory = await Inventory.findById(id);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }

    if (!inventory) {
        return res.status(404).json({ message: "Inventory not found" });
    }

    return res.status(200).json({ inventory });
};

// Update Inventory
const updateInventory = async (req, res, next) => {
    const id = req.params.id;
    const inventoriesData = req.body;

    // Update image path if a new image is uploaded
    if (req.file) {
        inventoriesData.image = `/uploads/${req.file.filename}`;
    }

    let inventory;

    try {
        inventory = await Inventory.findByIdAndUpdate(id, inventoriesData, { new: true });
        // { new: true } returns the updated document
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error", error: err.message });
    }

    if (!inventory) {
        return res.status(404).json({ message: "Unable to Update Inventory Details." });
    }

    return res.status(200).json({ inventory });
};

// Delete Inventory Item Details
const deleteInventory = async (req, res, next) => {
    const id = req.params.id;
    let inventory;

    try {
        inventory = await Inventory.findByIdAndDelete(id);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error", error: err });
    }

    if (!inventory) {
        return res.status(404).json({ message: "Unable to Delete Inventory Details." });
    }

    return res.status(200).json({ inventory });
};

// Export controller
exports.getAllInventory = getAllInventory;
exports.addInventory = addInventory;
exports.getById = getById;
exports.updateInventory = updateInventory;
exports.deleteInventory = deleteInventory;