const express = require('express');
const router = express.Router();
const adminController = require('../Controllers/adminController');
const { authenticateAdmin } = require('../middleware/authMiddleware');

// Admin Login (public route)
router.post('/login', adminController.loginAdmin);

// Admin CRUD (protected routes)
router.get('/', authenticateAdmin, adminController.getAllAdmins);
router.post('/', authenticateAdmin, adminController.addAdmin);
router.get('/:id', authenticateAdmin, adminController.getAdminById);
router.put('/:id', authenticateAdmin, adminController.updateAdmin);
router.delete('/:id', authenticateAdmin, adminController.deleteAdmin);

module.exports = router;
