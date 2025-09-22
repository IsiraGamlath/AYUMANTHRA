const express = require('express');
const router = express.Router();
const imController = require('../controllers/imController');

// Inventory Manager CRUD
router.get('/', imController.getAllManagers);
router.post('/', imController.addManager);
router.get('/:id', imController.getManagerById);
router.put('/:id', imController.updateManager);
router.delete('/:id', imController.deleteManager);

// Login route
router.post('/login', imController.loginManager);

module.exports = router;
