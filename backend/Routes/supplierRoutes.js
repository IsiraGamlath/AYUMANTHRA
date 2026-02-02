const express = require('express');
const router = express.Router();
const supplierController = require('../Controllers/supplierController');

router.get('/', supplierController.getAllSuppliers);
router.post('/', supplierController.addSupplier);
router.get('/:id', supplierController.getSupplierById);
router.put('/:id', supplierController.updateSupplier);
router.delete('/:id', supplierController.deleteSupplier);

// ✅ Supplier login route
router.post('/login', supplierController.supplierLogin);

module.exports = router;
