const express = require("express");
const router = express.Router();

//Insert Model
const Cart = require("../Model/CartModel");

//Insert cart controller
const CartController = require("../Controllers/CartControllers");

router.get("/", CartController.getAllCarts);
router.post("/", CartController.addCart);
router.get("/:id", CartController.getCartById);
router.put("/:id", CartController.updateCart);
router.delete("/:id", CartController.deleteCart);
router.patch("/:id/status", CartController.updateCartStatus);

//export
module.exports = router;
