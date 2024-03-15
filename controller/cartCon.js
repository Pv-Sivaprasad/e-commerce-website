const User = require('../model/userModel')
const Cart = require('../model/cartModel');
const Products = require('../model/productModel');
const Address = require('../model/addressModel')
const mongoose = require('mongoose')
const Order=require('../model/orderModel')



const loadCartPage = async (req, res) => {
    try {
        console.log('cart loading page');
        const user = req.session.user_id;
        console.log('user', user);
        const populateOption = {
            path: 'product.productId',
            model: 'Product'
        }
        const cartDetails = await Cart.find({ userId: user }).populate('product.productId')
       
        console.log("cartDetails", cartDetails);

        let total = 0;

        cartDetails.forEach(item => {

            total += item.product.totalPrice;
        });

        console.log('Total:', total);

        // Get the count of products
        const productsCount = cartDetails.length;

        // res.render('users/cart', { user, cartDetails: cartDetails, subTotal: total, productsCount });
        res.render('users/newCart', { user, cartDetails: cartDetails, subTotal: total, productsCount })
    } catch (error) {
        console.log(error.message);
        res.status(500).render('users/error')
    }
}


//addtocart post
const addProductsToCart = async (req, res) => {
    try {
        console.log('cart adding starts here');
        console.log(req.body);
        const { productId, quantity, price } = req.body;
        console.log(` productId ${productId},  `);
        const userId = req.session.user_id;
        console.log(userId);
        const existingProduct = await Cart.findOne({ userId: userId, 'product.productId': productId }, { 'product.$': 1 });
        console.log('existingProduct:', existingProduct);

        if (existingProduct) {

            return res.json({ success: false })
        }

        //find the total product stock 
        const totalProductStock = await Products.findOne({ _id: productId }, { quantity: 1 });
        // console.log('totalProductStock:',totalProductStock);
        if (totalProductStock.quantity == 0) {
            return res.json({ outOfStock: true })
        }
        console.log('ok, reached new cart method!!!!!1');
        const productDetails = await Products.findOne({ _id: productId });
        const tp = productDetails.price * quantity;
        console.log('tp', tp);

        const save = await Cart.insertMany([{
            userId: userId,
            product: {
                productId: productDetails._id,
                price: productDetails.price,
                quantity: 1,
                totalPrice: productDetails.price
            }
        }]);
        console.log('save', save);
        // console.log('newCart:',newCart);    
        console.log('added new product to the cart!');
        res.json({ addedNew: true, success: true })


    } catch (error) {
        console.log(error.message);
        res.status(500).render('users/error')
    }
}

const updateCart = async (req, res) => {
    try {
        console.log('starting cart editing updating here onwards');
        const { productId, quantity, cartId } = req.body
        console.log(`productId ${productId} quantity ${quantity} cartId ${cartId} `);

        const userId = req.session.user_id
        console.log('userId', userId);
        const productDetails = await Products.findOne({ _id: productId });

        const tp = productDetails.price * quantity;
        console.log('tp', tp);
        
        // const cartItem = await Cart.find({userId:userId}).populate('product.product_id')
        const cartItem = await Cart.updateOne({ userId: userId, 'product.productId': productId },
            { $set: { 'product.quantity': quantity, 'product.totalPrice': tp } })
        console.log('cartItem', cartItem);
        if (!cartItem) {
            return res.status(404).json({ success: false, message: "Cart item not found" });
        }
        res.json({ success: true })
    } catch (error) {
        console.log('error in updating cart product item details');
        console.log(error);
    }
}

const removeProduct = async (req, res) => {
    try {
        console.log('delete starts from here');

        console.log(req.body);
        const { productId } = req.body;
        console.log(productId);
        const user = req.session.user_id;
        console.log(user);

        // Remove the product from the cart
        const updatedCart = await Cart.deleteOne({ _id: productId });
        console.log('updated', updatedCart);
        let cart = await Cart.find({ userId: user })
        console.log('updated cart', cart);

        res.json({ removed: true });
    } catch (error) {
        console.log(error.message);
        res.status(500).render('users/error');
    }
}


const loadCheckoutPage = async (req, res) => {
    try {
        console.log('entering the checkout page');

        const userId = req.session.user_id
        console.log('userid', userId);

        const user = await User.findOne({ _id: userId })
        console.log('user', user);

        const address = await Address.find({ userId: userId })
        console.log('address', address);

        const cartDetails = await Cart.find({ userId: user }).populate('product.productId')
        console.log("cartDetails", cartDetails);


        let total = 0;

        cartDetails.forEach(item => {

            total += item.product.totalPrice;
        });

        console.log('Total:', total);


        res.render('users/checkout', { address: address, user: userId, address: address, cartDetails: cartDetails, subTotal: total })
    } catch (error) {
        console.log('error rendering checkoutpage');
        console.log(error);
    }
}

const orderSuccess = async (req, res) => {
    try {
        const userId = req.session.user_id
        console.log('userId', userId);
        
        const id=req.query.id

        const user = await User.findOne({ _id: userId })
        console.log('user', user);

        const address = await Address.find({ userId: userId })
        console.log('address', address);

        const proData = await Products.find({})

        const orderDetails= await Order.find({_id:id})
            
       


        res.render('users/ordersuccess',
            {
                address: address,
                user: userId,
                address: address,
                product: proData,
                orderDetails:orderDetails
            })
    } catch (error) {
        console.log('error loading success ');
        console.log(error);
    }
}

module.exports = {
    loadCartPage,
    addProductsToCart,
    removeProduct,
    updateCart,


    loadCheckoutPage,
    orderSuccess
}