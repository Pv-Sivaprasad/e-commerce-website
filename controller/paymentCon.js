const Razorpay = require('razorpay')

const crypto = require('crypto')

const Order = require('../model/orderModel')

const Cart = require('../model/cartModel')

const User = require('../model/userModel')

const Wallet = require('../model/walletModel')

const Payment=require('../model/paymentModel')

const Product=require('../model/productModel')

const mongoose = require('mongoose')

const moment = require('moment');


require('dotenv').config()

const createOrder = async (req, res) => {
    try {


        const userId = req.session.user_id;
        console.log('userId', userId);

        const cartItems = await Cart.find({ userId: userId });
        console.log('cartItems', cartItems);

        let totalPrice = 0; // Initialize total price to zero

        // Iterate over each item in the cart
        cartItems.forEach(item => {
            totalPrice += item.product.totalPrice; // Add totalPrice of each item to total
        });

        console.log('totalPrice', totalPrice);

       

        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_ID_KEY,
            key_secret: process.env.RAZORPAY_SECRET_ID
        })

        console.log(`instance ${instance}`);

        let amount = totalPrice

        console.log('amount', amount);

        const options = {
            amount: amount * 100,
            currency: "INR",
  
        }

        console.log('options', options);

        instance.orders.create(options, (error, order) => {
            if (error) {
                console.log('reached here in order creating error', error);
                return res.status(500).json({ message: 'error in creating order' })
            } else {
                console.log('order is being created');
                res.status(200).send({
                    success: true, 
                    msg: "Order created",
                    orderId: order.id,
                    amount: amount * 100,
                    key_id: process.env.KEY_ID,
                    product_name: req.body.name,
                    description: "Test Transaction",

                })
            }
        })

    } catch (error) {
        console.log('error using  placing razorpay order ');
        console.log(error);
    }
}

const verifypayment = async (req, res) => {
    try {
        
       
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature,orderId } = req.body;

        console.log(`razorpay_order_id ${razorpay_order_id} razorpay_payment_id ${razorpay_payment_id} razorpay_signature ${razorpay_signature}`);
        
        console.log('orderId',orderId)
        const data = `${razorpay_order_id}|${razorpay_payment_id}`;
        console.log('data', data);

        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET_ID)
            .update(data)
            .digest('hex');


        if (generated_signature === razorpay_signature) {

              
            res.status(200).json({ success: true, message: "Payment is successful", razorpay_payment_id });
        } else {
            console.log("Signature verification failed");
            res.status(400).json({ success: false, message: "Payment verification failed" })
        }
        console.log('generated_signature', generated_signature);

    } catch (error) {
        console.log('error in verifying payment');
        console.log(error);
    }
}
  

const wallet = async (req, res) => {
    try {

        const userId = req.session.user_id
        const userdata = await User.findOne({ _id: userId })

        const WalletDetails = await Wallet.find({ userId: userId })

        console.log('walletDetails', WalletDetails);
        if (WalletDetails && WalletDetails.length > 0) {


            const formattedTransactions = WalletDetails[0].transaction.map(transaction => {
                const formattedDate = moment(transaction.date).format('YYYY-MM-DD');
                return {
                    ...transaction.toObject(),
                    formattedDate,
                }

            }).sort((a, b) => (a._id > b._id ? -1 : 1));

            const formattedWallet = {
                ...WalletDetails[0].toObject(),
                transaction: formattedTransactions
            }
            console.log('formatted', formattedTransactions);
            console.log('walletformatted', formattedWallet);

            res.render('users/wallet', { WalletDetails: formattedWallet, userdata })
        } else {
            res.render('users/wallet', { WalletDetails: 0, userdata })
        }


    } catch (error) {
        console.log('error loading wallet ');
        console.log(error);
    }
}

const addFunds = async (req, res) => {
    try {

        console.log('entering adding funds to wallet');

        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_ID_KEY,
            key_secret: process.env.RAZORPAY_SECRET_ID
        })


        const options = {
            amount: req.body.Amount * 100,
            currency: 'INR'
        }
        instance.orders.create(options, (error, order) => {
            if (error) {
                console.log('error in create instance ', error);
                return res.status(500).json({ message: "something went wrong" })
            } else {
                console.log('amount adding success');
                res.status(200).send({
                    success: true,
                    msg: "amount updated",
                    orderId: order.id,
                    amount: req.body.Amount * 100,
                    key_id: process.env.KEY_ID,
                    product_name: "Add funds",
                    description: "Test Transaction",

                })

            }
        })

    } catch (error) {
        console.log('error adding amunt to wallet');
        console.log('error adding amunt to wallet',error);
    }
}

const fundverification = async (req, res) => {
    try {

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        console.log(`razorpay_order_id ${razorpay_order_id} razorpay_payment_id ${razorpay_payment_id} razorpay_signature ${razorpay_signature}`);


        const data = `${razorpay_order_id}|${razorpay_payment_id}`;
        console.log('data', data);

        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET_ID)
            .update(data)
            .digest('hex');
        if (generated_signature === razorpay_signature) {


            res.status(200).json({ success: true, message: "Payment is successful", razorpay_payment_id });
        } else {
            console.log("Signature verification failed");
            res.status(400).json({ success: false, message: "Payment verification failed" })
        }
        console.log('generated_signature', generated_signature);


    } catch (error) {
        console.log('error in fund verification');
        console.log(error)
    }
}

const addToWallet=async(req,res)=>{
    try {
        console.log('entered addtowallet route');
        const {Amount}=req.body

        const userId=req.session.user_id
        console.log('userId',userId);

        const WalletDetail=await Wallet.findOne({userId:userId})

        if (!WalletDetail) {

            const newWallet = new Wallet({
                userId: userId,
                balance: Amount,
                tratransaction: [{
                    amount: Amount,
                    transactionsMethod: "Credit",
                }]

            })
            await newWallet.save()

            console.log('newWallet',newWallet);

        } else {
          await Wallet.updateOne({ userId: userId }, 
                { $inc: 
                    { balance: Amount }, 
                    $push: { transaction: { amount: Amount, transactionsMethod: "Credit" } } })
        }
        res.status(200).json({ success: true })

        

    } catch (error) {
        console.log('error in adding to wallet',error);
    }
}
const placeOrderWallet=async(req,res)=>{
    try {
        
    
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
            totalPrice: item.product.price * item.product.quantity,
            totalProductAmount: item.product.price * item.product.quantity
        }));

        const Amount = cartItems.reduce((total, item) => total + (item.product.price * item.product.quantity), 0)
      
        console.log('req.session.couponAmount',req.session.couponAmount)
        let coupon=req.session.couponAmount

        const walletFund = await Wallet.updateOne({ userId: userId }, 
            { $inc: { balance: -Amount }, $push: { transaction: { amount: Amount, transactionsMethod: "Wallet" } } })
        console.log('walletFund', walletFund);

        for (let item of orderedItem) {
            const { productId, quantity } = item;
            const products = await Product.updateOne({ _id: productId }, { $inc: { quantity: -quantity } });
        }

      

        const order = new Order({
            userId: userId,
            cartId: cartItems.map(item => item._id),
            orderedItem: orderedItem,
            orderAmount: Amount,
            deliveryAddress: selectedAddressValue,
            paymentMethod: paymentOptionValue,
            orderStatus: 'pending',
            coupon:coupon
        });

        const save = await order.save();

        await Cart.deleteMany({ userId: userId });


        if (paymentOptionValue === "Wallet") {
            const payment = new Payment({
                UserId: userId,
                orderId: order._id,
                amount: Amount,
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


const retry=async(req,res)=>{
    try {
        
        const userId=req.session.user_id

        const { orderId } = req.body;
        console.log('orderId', orderId);

        const order=await Order.findOne({_id:orderId})

        let totalPrice=order.orderAmount
        console.log('totalPrice',totalPrice)

        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_ID_KEY,
            key_secret: process.env.RAZORPAY_SECRET_ID
        })

        console.log(`instance ${instance}`);

        let amount = totalPrice

        console.log('amount', amount);

        const options = {
            amount:amount * 100 ,
            currency: "INR",
  
        }

        console.log('options', options);

        instance.orders.create(options, (error, order) => {
            if (error) {
                console.log('reached here in retry ', error);
                return res.status(500).json({ message: 'error in retrying order' })
            } else {
                console.log('retry completed');
                res.status(200).send({
                    success: true, 
                    msg: "retry success",
                    orderId: order.id,
                    amount:amount * 100,
                    key_id: process.env.KEY_ID,
                    product_name: req.body.name,
                    description: "Test Transaction",

                })
            }
        })

    } catch (error) {
        console.log('error in retry opening ',error)
    }
}


const retryPayment = async (req, res) => {
    try {



        console.log('Entering retry payment');

      
        const userId = req.session.user_id;
        console.log('userId', userId);

        
        const { orderId } = req.body;
        console.log('orderId', orderId);

        
        const order = await Order.findByIdAndUpdate(
            { _id: orderId, userId: userId }, 
            { $set: { paymentStatus: true } }, 
            { new: true } 
        );

        console.log('Updated order:', order);

       
        if (order) {
            return res.status(200).json({ success: true });
        } else {
           
            return res.status(404).json({ success: false, message: 'Order not found or not updated' });
        }

    } catch (error) {
        console.log('Error in retry:', error);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}


module.exports = {
    createOrder,
    verifypayment,

    wallet,
    addToWallet,
    addFunds,
    fundverification,
    placeOrderWallet,
    retry,
    retryPayment


}