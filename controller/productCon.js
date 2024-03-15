
const Product = require('../model/productModel')
const Admin = require('../model/adminModel')
const User = require('../model/userModel')
const Category = require('../model/categoryModel')
const fs = require('fs')
const path = require('path')
const { log } = require('console')



//to load the products
const   loadProduct = async (req, res) => {
    try {
        const products = await Product.find({}).populate('categoryId')
        res.render('allProduct', { products })
    } catch (error) {
        console.log('error loading product page');
        console.log(error);
    }
}

//to  load add product page
const loadAddProduct = async (req, res) => {
    try {
        const categories = await Category.find({})
        res.render('addProduct', { categories })
    } catch (error) {
        console.log('error loading add product page');
        console.log(error);
    }
}


const addProduct = async (req, res) => {
    try {
        console.log('Product adding started');
        const details = req.body;
        console.log('details',details);
        const files = req.files;
        console.log('files',files);
        if (!files || files.length < 4) {
            return res.status(400).json({ success: false, message: 'Please select at least 4 images' });
        }

    
        const images = files.map(file => file.filename);
       

        const product = new Product({
            productName: details.productName,
            price: details.price,
            quantity: details.quantity,
            color: details.color,
            images: images,
            // size: details.size,
            categoryId: details.categoryId,
            description: details.formdescription
        });

        const savedProduct = await product.save();

      res.json({success:true})

    } catch (error) {
        console.log('Error adding product:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

 




//to load edit product page
const loadEditProduct = async (req, res) => {
    try {
        console.log('product editing page loading');
        const id = req.query.id
        console.log("id", id);

        const proData = await Product.findById({ _id: id })
        const categories = await Category.find({})

        console.log(proData);
        if (proData) {
            console.log('reached here');
            res.render('editProduct', { product: proData, categories: categories })
        } else {
            res.redirect('/admin/allProduct')
        }
    } catch (error) {
        console.log('error editing product');
        console.log(error);
    }
}

//to edit a product
const editProduct = async (req, res) => {
    try {
        console.log('Editing product starts here');
        const details = req.body;
        const files = req.files;
        const id=details.id
        console.log('Details:', details);
        console.log('Files:', files);


        if (files && files.length >= 4) {
            console.log('Images provided, updating images...');
            const imgPath = files.map(file => file.filename);
            details.images = imgPath;
            console.log('imgPath', details.images);
        } else {
            console.log('No images provided or less than 4 images, skipping image update.');
            // Remove images field from details object
            delete details.images;
            console.log(details.image);
        }

        // Update product data except for images
        const proData = await Product.findByIdAndUpdate(
            { _id: id },
            { $set: details }, // Use modified details object
            { new: true }
        );

        console.log('Product data updated successfully:', proData);
        res.json({success:true})
    } catch (error) {
        console.log('Error editing product:', error); // Log error
        res.status(500).json({ success: false, message: 'An error occurred while editing the product' });
    }
}

//to block and unblock products 
const blockProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const action = req.body.action;

        // Find the product by ID
        const product = await Product.findById(productId);

        // Touserhomele the is_blocked property based on the action
        product.is_blocked = action === "unblock" ? false : true;

        // Save the updated product
        const updatedProduct = await product.save();

        res.status(200).json({ success: true, product: updatedProduct });
    } catch (error) {
        console.log('Error in blocking/unblocking product:', error);
        res.status(500).json({ success: false, error: 'Error in blocking/unblocking product' });
    }
}


const lowhigh = async (req, res) => {
    try {
        console.log('loading low-high filtering');
        const userId = req.session.user_id
        console.log('userID', userId);

        const userData = await User.findOne({ _id: userId })
        console.log('userData', userData);

        const products = await Product.find().sort({ price: 1 })
        res.render('users/userhome', { products: products, user: userData })

    } catch {
        console.log('error loading low-high filtering');
        console.log(error);
    }
}

const highlow = async (req, res) => {
    try {
        console.log('loading low-high filtering');
        const userId = req.session.user_id
        console.log('userID', userId);

        const userData = await User.findOne({ _id: userId })
        console.log('userData', userData);

        const products = await Product.find().sort({ price: -1 })
        res.render('users/userhome', { products: products, user: userData })

    } catch (error) {
        console.log('error loading high-low filtering');
        console.log(error);
    }
}

const AToZ = async (req, res) => {
    try {
        const userId = req.session.user_id;
        console.log('suerId',userId);
        const userData = await User.findOne({ _id: userId });
        console.log('userData',userData);
        let products = await Product.aggregate([
            {
                $addFields: {
                    lowerCaseName: { $toLower: "$productName" }
                }
            },
            {
                $sort: {
                    lowerCaseName: 1
                }
            },
            {
                $project: {
                    lowerCaseName: 0
                }
            }
        ]);
        res.render('users/userhome', { products: products, user: userData });
    } catch (error) {
        console.log('Error sorting A-Z:', error);
        res.status(500).send('Internal Server Error');
    }
};

const ZToA = async (req, res) => {
    try {
        const userId = req.session.user_id;
        console.log('suerId',userId);
        const userData = await User.findOne({ _id: userId });
        console.log('userData',userData);
        let products = await Product.aggregate([
            {
                $addFields: {
                    lowerCaseName: { $toLower: "$productName" }
                }
            },
            {
                $sort: {
                    lowerCaseName: -1
                }
            },
            {
                $project: {
                    lowerCaseName: 0
                }
            }
        ]);
        res.render('users/userhome', { products: products, user: userData });
    } catch (error) {
        console.log('Error sorting A-Z:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    loadProduct,
    loadAddProduct,
    addProduct,
    loadEditProduct,
    editProduct,
    blockProduct,
    lowhigh,
    highlow,
    AToZ,
    ZToA
}