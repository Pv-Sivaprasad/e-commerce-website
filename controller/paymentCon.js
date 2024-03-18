const Razorpay=require('razorpay')

const crypto=require('crypto')

const Order=require('../model/orderModel')

const Cart=require('../model/cartModel')

const mongoose=require('mongoose')

require('dotenv').config()

const createOrder=async(req,res)=>{
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

        console.log('totalPrice',totalPrice);

        console.log('cretaing razor online order');

        const instance=new Razorpay({
            key_id: process.env.RAZORPAY_ID_KEY,
            key_secret:process.env.RAZORPAY_SECRET_ID
        })

        console.log(`instance ${instance}`);

         let amount=totalPrice

         console.log('amount',amount);

        const options={
            amount: amount*100,
            currency: "INR",

        }

        console.log('options',options);

        instance.orders.create(options,(error,order)=>{
            if(error){
                console.log('reached here in order creating error',error);
                return res.status(500).json({message:'error in creating order'})
            }else{
                console.log('order is being created');
                res.status(200).send({
                    success: true,
                    msg: "Order created",
                    orderId: order.id,
                    amount:amount* 100,
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

  const verifypayment= async(req,res)=>{
    try {

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

console.log(`razorpay_order_id ${razorpay_order_id} razorpay_payment_id ${razorpay_payment_id} razorpay_signature ${razorpay_signature}`);


        const data = `${razorpay_order_id}|${razorpay_payment_id}`;
        console.log('data',data);

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
        console.log('generated_signature',generated_signature);

    } catch (error) {
        console.log('error in verifying payment');
        console.log(error);
    }
  }

module.exports={
    createOrder,
    verifypayment,
    
}