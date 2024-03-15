const User = require('../model/userModel')
const Product = require('../model/productModel')
const Address = require('../model/addressModel')
const Order=require('../model/orderModel')
const Category = require('../model/categoryModel')
const Payment=require('../model/paymentModel')
const Cart=require('../model/cartModel')



const loadOrderDetails=async(req,res)=>{
    try {
        res.render('users/order')
    } catch (error) {
        console.log('error loading order details page');
        console.log(error);
    }
}
const placeOrder = async (req, res) => {
    try {
        console.log('starting order placing');

        console.log(req.body);
        const { selectedAddressValue, paymentOptionValue } = req.body;

        console.log('selectedAddressValue', selectedAddressValue);
        console.log('paymentOptionValue', paymentOptionValue);

        if (!selectedAddressValue) {
            return res.json({ success: false, message: 'Please select an address' });
        }

        const userId = req.session.user_id;
        console.log('userId', userId);

        const cartItems = await Cart.find({ userId: userId });
        console.log('cartItems', cartItems);

        const orderedItem = cartItems.map(item => ({
            productId: item.product.productId,
            quantity: item.product.quantity,
            totalPrice: item.product.price * item.product.quantity ,// Calculate totalPrice correctly
            totalProductAmount: item.product.price * item.product.quantity
        }));

        for (let item of orderedItem) {
            const { productId, quantity } = item;
            const products = await Product.updateOne({ _id: productId }, { $inc: { quantity: -quantity } });
        }

        const orderAmount = cartItems.reduce((total, item) => total + (item.product.price * item.product.quantity), 0);

        const order = new Order({
            userId: userId,
            cartId: cartItems.map(item => item._id),
            orderedItem: orderedItem,
            orderAmount: orderAmount,
            deliveryAddress: selectedAddressValue,
            paymentMethod: paymentOptionValue,
            orderStatus: 'pending'
        });

        const save = await order.save();

        await Cart.deleteMany({ userId: userId });

        
        if (paymentOptionValue === "COD") {
            const payment = new Payment({
                UserId: userId, 
                orderId: order._id,
                amount: orderAmount,
                status: 'pending',
                paymentMethod: paymentOptionValue
            });
            await payment.save();
        }

        if (save) {
            console.log("orderId", order._id);
            res.status(200).json({ success: true, orderId: order._id });
        } else {
            res.status(302).json({ success: false });
        }
    } catch (error) {
        console.log('error adding order details');
        console.log(error);
        res.status(500).json({ success: false, message: 'Error adding order details' });
    }
};



module.exports={
    loadOrderDetails,
    placeOrder
}