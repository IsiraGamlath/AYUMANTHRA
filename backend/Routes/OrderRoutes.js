const express = require("express");
const router = express.Router();
const OrderController = require("../Controllers/OrderController");

router.post("/", OrderController.createOrder);
router.get("/", OrderController.getAllOrders);
router.get("/:id", OrderController.getOrderById);
router.put("/:id/status", OrderController.updateOrderStatus);
router.delete("/:orderId", OrderController.deleteOrder);

module.exports = router;