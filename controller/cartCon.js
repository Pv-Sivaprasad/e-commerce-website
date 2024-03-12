
const Product = require('../model/productModel')
const User = require('../model/userModel')
const Cart = require('../model/cartModel')
const Address = require('../model/addressModel')
const Category = require('../model/categoryModel')
const Payment = require('../model/paymentModel')
const { ObjectId } = require('mongodb')
const mongoose=require('mongoose')




const loadCartPage = async (req, res) => {
    try {
        const user = req.session.user_id
         console.log(user);

        const populateOption = {
            path: 'product.productId',
            model: Product
            // select :'productName images price'
        }

        const cartDetails = await Cart.findOne({ userId: user }).populate(populateOption)

        console.log('cartDetails are :', cartDetails);

        const productsCount = cartDetails?.product.length;

        const subTotal = cartDetails?.product.reduce((total, currentTotal) => total + currentTotal.totalPrice, 0);

       

        res.render('users/cart', { user, cartDetails, subTotal, productsCount });
    } catch (error) {
        console.log('error loading cart page');
        console.log(error);
    }
}





const addToCart = async (req, res) => {
    try {
        console.log('this is when the "add to cart" button is pressed');

        const { productId, count } = req.body;
        console.log(`productId ${productId},  count ${count}`);
        console.log(req.session);
        const userId = req.session.user_id;
        console.log(userId);

        // Find the existing product in the user's cart
        const existingProduct = await Cart.findOne({ userId: userId, 'product.productId': productId }, { 'product.$': 1 });
        console.log('existingProduct:', existingProduct);

        // Find the stock quantity of the product
        const stock = await Product.findOne({ _id: productId }, { quantity: 1 });
        console.log('available stock is ', stock);

        if (stock.quantity == 0) {
            return res.json({ addedToCart: 'stock is over' });
        }

        if (existingProduct) {
            const currentQty = existingProduct.product[0].quantity; // Assuming there's only one matching product
            console.log(`currentQty ${currentQty} product quantity ${stock.quantity}`);

            // Check if adding the specified count exceeds the available stock
            if (count > 0 && count + currentQty > stock.quantity) {
                return res.json({ added: false, message: "failed to add item: limit exceeded" });
            }

            // Update the quantity and total price of the existing product in the cart
            const updatedProduct = await Cart.findOneAndUpdate(
                { userId: userId, 'product.productId': productId },
                {
                    $inc: {
                        'product.$.quantity': count,
                        'product.$.totalPrice': count * existingProduct.product[0].price
                    }
                },
                { new: true }
            );

            console.log(`updatedProduct ${updatedProduct}`);
            return res.json({ added: true });
        } else {
            console.log('ok, reached cart correctly');
            const productDetails = await Product.findOne({ _id: productId });

            // Add the new product to the cart
            await Cart.findOneAndUpdate(
                { userId: userId },
                {
                    $set: { userId: userId },
                    $push: {
                        product: {
                            productId: productDetails._id,
                            price: productDetails.price,
                            quantity: 1,
                            totalPrice: productDetails.price
                        }
                    }
                },
                { upsert: true }
            );

            console.log('added new product to the cart!');
            return res.json({ addedNew: true });
        }
    } catch (error) {
        console.log('error adding product to the cart');
        console.log(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};


const removeProduct=async(req,res)=>{
    try {
        const {productId}=req.body
        console.log(productId);
        console.log(req.session);
        const userId = new mongoose.Types.ObjectId(req.session.user_id);
        console.log(userId);
console.log('going to delete');
        await Cart.findByIdAndDelete(userId, { product: { productId } });
           const status='product removed successfully'
           console.log(status);
          res.json({removed:true})

    } catch (error) {
        console.log('error removing product from cart');
        console.log(error);
    }
}



module.exports = {
    loadCartPage,
    addToCart,
    removeProduct
}