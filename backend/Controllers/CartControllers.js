const Cart = require("../Model/CartModel");
const mongoose = require("mongoose");

// Display all carts WITH product details using aggregation
const getAllCarts = async (req, res, next) => {
    let carts;

    try {
        carts = await Cart.aggregate([
            {
                $addFields: {
                    productObjectId: { $toObjectId: "$productId" }
                }
            },
            {
                $lookup: {
                    from: "inventorymodels",  
                    localField: "productObjectId",
                    foreignField: "_id",
                    as: "product"
                }
            },
            {
                $unwind: {
                    path: "$product",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    productId: 1,
                    quantity: 1,
                    weight: 1,
                    form: 1,
                    notes: 1,
                    currentStatus: 1,
                    trackingNumber: 1,
                    estimatedDelivery: 1,
                    address: 1,
                    statusHistory: 1,
                    productName: "$product.name",
                    productPrice: "$product.price",
                    productImage: "$product.image",
                    productCategory: "$product.category"
                }
            }
        ]);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error fetching carts" });
    }

    if (!carts || carts.length === 0) {
        return res.status(404).json({ message: "Cart not found" });
    }

    return res.status(200).json({ carts });
};

// Insert - Add productId to parameters
const addCart = async (req, res, next) => {
    const {productId, quantity, weight, form, notes, currentStatus, trackingNumber, estimatedDelivery, address, statusHistory} = req.body;

    let cart;
    try {
        cart = new Cart({productId, quantity, weight, form, notes, currentStatus, trackingNumber, estimatedDelivery, address, statusHistory});
        await cart.save();
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error adding cart" });
    }

    if (!cart) {
        return res.status(404).json({message: "unable to add cart"});
    }
    return res.status(200).json({cart})
};

// Get by ID WITH product details
const getCartById = async (req, res, next) => {
    const id = req.params.id;

    let cart;

    try {
        cart = await Cart.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id) } },
            {
                $addFields: {
                    productObjectId: { $toObjectId: "$productId" }
                }
            },
            {
                $lookup: {
                    from: "inventorymodels",
                    localField: "productObjectId",
                    foreignField: "_id",
                    as: "product"
                }
            },
            {
                $unwind: {
                    path: "$product",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    productId: 1,
                    quantity: 1,
                    weight: 1,
                    form: 1,
                    notes: 1,
                    currentStatus: 1,
                    trackingNumber: 1,
                    estimatedDelivery: 1,
                    address: 1,
                    statusHistory: 1,
                    productName: "$product.name",
                    productPrice: "$product.price",
                    productImage: "$product.image"
                }
            }
        ]);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error fetching cart" });
    }

    if (!cart || cart.length === 0) {
        return res.status(404).json({message: "unable to show cart"});
    }
    return res.status(200).json({cart: cart[0]});
}

// Update - Add productId to parameters
const updateCart = async(req, res, next) => {
    const id = req.params.id;
    const {productId, quantity, weight, form, notes, currentStatus, trackingNumber, estimatedDelivery, address, statusHistory} = req.body;

    let cart;

    try {
        cart = await Cart.findByIdAndUpdate(id, 
            { productId, quantity, weight, form, notes, currentStatus, trackingNumber, estimatedDelivery, address, statusHistory },
            { new: true }
        );
        if (cart) {
            await cart.save();
        }
    } catch(err) {
        console.log(err);
        return res.status(500).json({ message: "Error updating cart" });
    }

    if (!cart) {
        return res.status(404).json({message: "unable to update cart"});
    }
    return res.status(200).json({cart});
}

// Update status only and append to history
const updateCartStatus = async (req, res, next) => {
    const id = req.params.id;
    const { newStatus, note } = req.body;

    try {
        const cart = await Cart.findById(id);
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const timestamp = new Date().toLocaleString();
        if (!Array.isArray(cart.statusHistory)) {
            cart.statusHistory = [];
        }
        if (newStatus && newStatus !== cart.currentStatus) {
            cart.currentStatus = newStatus;
            cart.statusHistory.push({ status: newStatus, timestamp, note: note || "" });
        }

        await cart.save();
        return res.status(200).json({ cart });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Unable to update status" });
    }
}

// Delete
const deleteCart = async (req, res, next) => {
    const id = req.params.id;

    let cart;
    try {
        cart = await Cart.findByIdAndDelete(id)
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error deleting cart" });
    }

    if (!cart) {
        return res.status(404).json({message: "unable to delete cart"});
    }
    return res.status(200).json({cart});
}

exports.getAllCarts = getAllCarts;
exports.addCart = addCart;
exports.getCartById = getCartById;
exports.updateCart = updateCart;
exports.deleteCart = deleteCart;
exports.updateCartStatus = updateCartStatus;