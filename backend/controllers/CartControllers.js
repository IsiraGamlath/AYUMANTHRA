const Cart = require("../model/CartModel");

//display
const getAllCarts = async (req, res, next) => {

    let carts;

    //get all carts
    try{
        carts = await Cart.find();
    }catch (err){
        console.log(err);
    }

    //not found
    if(!carts){
        return res.status(404).json({message:"Cart not found"});
    }

    //display all carts
    return res.status(200).json({ carts });
};

//insert
const addCart = async (req, res, next) => {
    const {quantity,weight,form,notes,currentStatus,trackingNumber,estimatedDelivery,address,statusHistory} = req.body;

    let cart;
    try{
        cart = new Cart({quantity,weight,form,notes,currentStatus,trackingNumber,estimatedDelivery,address,statusHistory});
        await cart.save();
    }catch (err){
        console.log(err);
    }

    //not insert cart
    if(!cart){
        return res.status(404).json({message:"unable to add cart"});
    }
    return res.status(200).json({cart})
};

//getbyid
const getCartById = async (req, res, next) => {

    const id = req.params.id;
    
    let cart;

    try{
        cart = await Cart.findById(id);
    }catch (err) {
        console.log(err);
    }
//not available cart
    if(!cart){
        return res.status(404).json({message:"unable to show cart"});
    }
    return res.status(200).json({cart});
}
//update
const updateCart = async(req, res, next) => {

    const id = req.params.id;
    const {quantity,weight,form,notes,currentStatus,trackingNumber,estimatedDelivery,address,statusHistory} = req.body;

    let cart;

    try{
        cart = await Cart.findByIdAndUpdate(id, 
            { quantity: quantity, weight:weight, form:form, notes:notes, currentStatus, trackingNumber, estimatedDelivery, address, statusHistory },
            { new: true }
        );
        if (cart) {
            await cart.save();
        }
        
    }catch(err){
        console.log(err);
    }
    if(!cart){
        return res.status(404).json({message:"unable to update cart"});
    }
    return res.status(200).json({cart});
}

// update status only and append to history
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

//delete
const deleteCart = async (req, res, next) => {
    const id = req.params.id;

    let cart;
    try{
        cart = await Cart.findByIdAndDelete(id)
    }catch (err){
        console.log(err);
    }

    if(!cart){
        return res.status(404).json({message:"unable to delete cart"});
    }
    return res.status(200).json({cart});
}



exports.getAllCarts = getAllCarts;
exports.addCart = addCart;
exports.getCartById = getCartById;
exports.updateCart = updateCart;
exports.deleteCart = deleteCart;
exports.updateCartStatus = updateCartStatus;
