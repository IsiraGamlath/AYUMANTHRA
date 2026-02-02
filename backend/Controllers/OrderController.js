const Order = require("../Model/OrderModel");

const createOrder = async (req, res) => {
    try {
        const orderData = req.body;
        
        if (!orderData.orderId || !orderData.customerInfo || !orderData.items || !orderData.totals) {
            return res.status(400).json({ message: "Missing required order data" });
        }

        const order = new Order(orderData);
        await order.save();

        return res.status(201).json({ 
            message: "Order created successfully",
            order 
        });
    } catch (err) {
        console.error("Error creating order:", err);
        return res.status(500).json({ message: "Error creating order", error: err.message });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        return res.status(200).json({ orders });
    } catch (err) {
        console.error("Error fetching orders:", err);
        return res.status(500).json({ message: "Error fetching orders" });
    }
};

const getOrderById = async (req, res) => {
    const id = req.params.id;

    try {
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        return res.status(200).json({ order });
    } catch (err) {
        console.error("Error fetching order:", err);
        return res.status(500).json({ message: "Error fetching order" });
    }
};

const updateOrderStatus = async (req, res) => {
    const id = req.params.id;
    const { orderStatus } = req.body;

    try {
        const order = await Order.findByIdAndUpdate(
            id,
            { orderStatus },
            { new: true }
        );
        
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        
        return res.status(200).json({ order });
    } catch (err) {
        console.error("Error updating order:", err);
        return res.status(500).json({ message: "Error updating order" });
    }
};

const deleteOrder = async (req, res) => {
    const { orderId } = req.params;

    try {
        const order = await Order.findOneAndDelete({ orderId: orderId });
        
        if (!order) {
            return res.status(404).json({ 
                success: false,
                message: "Order not found" 
            });
        }
        
        return res.status(200).json({ 
            success: true,
            message: "Order deleted successfully" 
        });
    } catch (err) {
        console.error("Error deleting order:", err);
        return res.status(500).json({ 
            success: false,
            message: "Error deleting order" 
        });
    }
};

exports.createOrder = createOrder;
exports.getAllOrders = getAllOrders;
exports.getOrderById = getOrderById;
exports.updateOrderStatus = updateOrderStatus;
exports.deleteOrder = deleteOrder;