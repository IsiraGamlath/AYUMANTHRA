const express = require("express");
const router = express.Router();

const usersController = require("../controllers/newController");

router.get("/", usersController.getAllUsers);
router.post("/", usersController.addUser);
router.get("/:id", usersController.getById);
router.put("/:id", usersController.updateUser);
router.delete("/:id", usersController.deleteUser);

// ✅ Login route
router.post("/login", usersController.loginUser);

module.exports = router;
