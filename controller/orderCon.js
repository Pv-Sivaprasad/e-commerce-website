const User = require('../model/userModel')
const Product = require('../model/productModel')
const Address = require('../model/addressModel')
const Order = require('../model/orderModel')
const Category = require('../model/categoryModel')
const Payment = require('../model/paymentModel')
const Cart = require('../model/cartModel')
const Wallet = require('../model/walletModel')


//load the full orders of user
const loadOrderDetails = async (req, res) => {
    try {
        console.log('loading the order details page');
        const userId = req.session.user_id
        console.log('userId', userId);
        const user = await User.findOne({ _id: userId })

        const orderDetails = await Order.find({ userId: userId })
            .populate('orderedItem.productId')
            .sort({ _id: -1 });
        console.log('orderDetails', orderDetails);
        res.render('users/myorder', { user: user, orderDetails: orderDetails })
    } catch (error) {
        console.log('error loading order details page');
        console.log(error);
    }
}


//to place order
const placeOrder = async (req, res) => {
    try {
        console.log('starting order placing');

        const { transactionId } = req.query

        console.log(req.body);
        const { selectedAddressValue, paymentOptionValue ,paymentStatus} = req.body;

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
            totalPrice: item.product.price * item.product.quantity,
            totalProductAmount: item.product.price * item.product.quantity,
            productStatus: paymentOptionValue === 'COD' ? 'successful' : 'pending'
        }));

        for (let item of orderedItem) {
            const { productId, quantity } = item;
            const products = await Product.updateOne({ _id: productId }, {
                $inc: {
                    quantity: -quantity, 
                    sold: quantity 
                }
            });
        }

        console.log('req.session.couponAmount',req.session.couponAmount)

            let coupon=req.session.couponAmount

        const orderAmount = cartItems.reduce((total, item) => total + (item.product.price * item.product.quantity), 0);

        const order = new Order({
            userId: userId,
            cartId: cartItems.map(item => item._id),
            orderedItem: orderedItem,
            orderAmount: orderAmount,
            deliveryAddress: selectedAddressValue,
            paymentMethod: paymentOptionValue,
            orderStatus: 'pending',
            coupon:coupon,
            paymentStatus:paymentStatus
        });

        const save = await order.save();
    
        await Cart.deleteMany({ userId: userId });


        if (paymentOptionValue === "COD") {
            const payment = new Payment({
                UserId: userId,
                orderId: order._id,
                amount: orderAmount,
                status: 'pending',
                paymentMethod: paymentOptionValue,
                
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


// to view singlt product details
const singleOrder = async (req, res) => {
    try {



        const userId = req.session.user_id
        console.log('userId', userId);

        const user = await User.findOne({ _id: userId })

        const orderId = req.query.orderId.replace(/\s+/g, '');
        console.log('orderId', orderId);

        const orderDetails = await Order.findOne({ _id: orderId })
            .populate('userId')
            .populate({ path: 'orderedItem.productId', model: 'Product' })
            .populate('deliveryAddress')

        console.log('orderDetails', orderDetails);

        const products = orderDetails.orderedItem
        console.log('products', products);
            const paymentStatus=orderDetails.paymentStatus
            console.log('paymentStatus', paymentStatus);

        res.render('users/singleorder', { orderDetails: orderDetails, user: userId ,paymentStatus:paymentStatus})

    } catch (error) {
        console.log('error loading user single order');
        console.log(Error);
    }
}

//to cancel the product 
const cancelOrder = async (req, res) => {
    try {

        console.log('starting to cancel the product ');

        const userId = req.session.user_id
        console.log('userId', userId);

        const { orderId } = req.body

        console.log(`orderId ${orderId}`);


        const orderStatus = await Order.updateOne(
            {
                _id: orderId,
            },
            {
                $set: { orderStatus: 'cancelled ' } // Update the order status directly
            }
        );

        console.log('orderStatus', orderStatus);
        res.status(200).json({ success: true })
    } catch (error) {
        console.log('error cancelling order');
        res.status(302).json({ success: false })
        console.log(error);

    }
}

//to return the order
const returnOrder = async (req, res) => {
    console.log('entering returing product');

    try {

        console.log(req.body);
        const userId = req.session.user_id
        const { selectedReason, orderId } = req.body
        console.log('selectedReason', selectedReason);
        console.log('orderId', orderId);
        const orderStatus = await Order.updateOne({ _id: orderId }, {
            $set: {
                orderStatus: 'returned'
            }
        })

        const order = await Order.findOne({ _id: orderId })
        console.log('order', order);
        for (const item of order.orderedItem) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ success: false, error: `Product ${item.productId} not found` });
            }
            product.quantity += item.quantity;
            product.sold -= item.quantity;
            await product.save();
        }
        console.log('product quantity updated successfully');
        const orderAmount = order.orderAmount
        const isexistWallet = await Wallet.findOne({ userId: userId })
        if (!isexistWallet) {
            const newWallet = new Wallet({
                userId: userId,
                balance: orderAmount,
                transaction: [{
                    amount: orderAmount,
                    transactionsMethod: 'Refund'
                }]
            })
            await newWallet.save()
        } else {

            await Wallet.updateOne(
                { userId: userId },
                {
                    $inc: { balance: orderAmount },
                    $push: { transactions: { amount: orderAmount, transactionsMethod: 'Refund' } }
                }
            );
        }
        const productStatus = await Order.findOne({})
        if (orderStatus) {
            res.json({ success: true })
        } else {
            res.json({ success: false })
        }

    } catch (error) {
        console.log('error in returning order');
        console.log(error);
    }
}

//to load the invoice page
const loadInvoice = async (req, res) => {
    try {
        console.log('entering invoice page');

        const orderId = req.query.orderId;
        console.log('orderId', orderId);

        const userId = req.session.user_id;
        console.log('userid ', userId);

        const orderDetails = await Order.findOne({ _id: orderId })
            .populate('userId')
            .populate({ path: 'orderedItem.productId', model: 'Product' })
            .populate('deliveryAddress')

        console.log('orderDetails', orderDetails);

        const products = orderDetails.orderedItem

        console.log('products', products);


        res.render('users/invoice', { order: orderDetails });

    } catch (error) {
        console.log('error', error)
    }

}

module.exports = {
    loadOrderDetails,
    placeOrder,
    singleOrder,
    cancelOrder,
    returnOrder,
    loadInvoice,
}