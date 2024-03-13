const Cart = require('../model/cartModel');
const Products = require('../model/productModel');
const mongoose=require('mongoose')

const loadCartPage = async (req, res) => {
    try {
        console.log('cart loading page');
        const user = req.session.user_id;
        console.log('user',user);
        const populateOption = {
            path: 'product.productId',
            model: 'Product'
        }
        const cartDetails=await Cart.find({userId:user}).populate('product.productId')
      console.log("cartDetails",cartDetails);
     
        let  data = [];

//        const cartDetails= await  Cart.aggregate([
        
//         {$lookup:{

//             from:'products',
//             localField:'product.productId',
//             foreignField:'_id',
//             as:'product'
//         },

//     }, 
//     {
//         $unwind:{
//             path:'$product',
//             preserveNullAndEmptyArrays: true
//         }
//     },

//     {
//         $project:{
//             productName:"$product.productName",
//             images:"$product.images",
//             quantity:1,
//             price: "$product.price",
//             _id:1,
          

//         }
//     },

// ])
       

    
        let total = 1000

        console.log('Total:', total);

        // Get the count of products
        const productsCount = cartDetails.length;

        res.render('users/cart', { user, cartDetails: cartDetails, subTotal: total, productsCount });
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
        console.log(` productId ${productId}, quantity ${quantity}, price ${price} `);
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
            return res.json({ addedToCart: 'the product is out of stock' })
        }



        console.log('ok, reached new cart method!!!!!1');
        const productDetails = await Products.findOne({ _id: productId });

        
        const save = await Cart.insertMany([{
            userId: userId,
            product: {
                productId: productDetails._id,
                price: productDetails.price,
                quantity: quantity,
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



const removeProduct = async (req, res) => {
    try {
        console.log(':::::::reached delete product!!!::::::::::::');

        console.log(req.body);
        const { productId } = req.body;
        console.log(productId);
        const user = req.session.user_id;
        console.log(user);

        // Remove the product from the cart
        const updatedCart = await Cart.deleteOne({_id: productId });
        console.log('updated',updatedCart);
        let cart=await Cart.find({userId:user})
        console.log('updated cart',cart);

        res.json({ removed: true });
    } catch (error) {
        console.log(error.message);
        res.status(500).render('users/error');
    }
}

module.exports = {
    loadCartPage,
    addProductsToCart,
    removeProduct
}