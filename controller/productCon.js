
const Product = require('../model/productModel')
const Admin = require('../model/adminModel')
const User = require('../model/userModel')
const Category = require('../model/categoryModel')
const fs = require('fs')
const path = require('path')
const { log } = require('console')

const loadProduct = async (req, res) => {
    try {
        const products = await Product.find({}).populate('categoryId')
        res.render('allProduct', { products })
    } catch (error) {
        console.log('error loading product page');
        console.log(error);
    }
}

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
        const files = req.files;

        if (!files || files.length < 4) {
            return res.status(400).json({ success: false, message: 'Please select at least 4 images' });
        }

        const alreadyExist = await Product.findOne({ productName: details.productName });
        if (alreadyExist) {
            return res.status(400).json({ success: false, message: 'Item already exists' });
        }

        // Extract filenames from uploaded files
        const images = files.map(file => file.filename);

        // Create a new product object
        const product = new Product({
            productName: details.productName,
            price: details.price,
            quantity: details.quantity,
            color: details.color,
            images: images,
            size: details.size,
            categoryId: details.categoryId,
            description: details.description
        });

        const savedProduct = await product.save();
        res.redirect('/admin/allProduct')
        // return res.status(201).json({ success: true, message: 'Product added successfully', product: savedProduct });
    } catch (error) {
        console.log('Error adding product:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


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


const editProduct = async (req, res) => {
    try {
        console.log('editing product starts here');
        const details = req.body;
        const files = req.files;


        console.log('details', details);

        if (!files || files.length < 4) {
            return res.status(400).json({ success: false, message: 'Please select at least 4 images' });
        }
        console.log('1');

        const proData = await Product.findByIdAndUpdate({ _id: req.body.id }, {
            $set: {
                productName: details.productName,
                price: details.price,
                quantity: details.quantity,
                color: details.color,
                size: details.size,
                categoryId: details.categoryId,
                description: details.description
            }
        }, { new: true });

        console.log(`updated data ${proData}`);
        console.log('product data updated successfully');
        res.redirect('/admin/allProduct');
    } catch (error) {
        console.log('Error editing product:', error); // Log error
        res.status(500).json({ success: false, message: 'An error occurred while editing the product' });
    }
};




const blockProduct = async (req, res) => {
    try {
        const productId = req.params.productId;
        const action = req.body.action;

        // Find the product by ID
        const product = await Product.findById(productId);

        // Toggle the is_blocked property based on the action
        product.is_blocked = action === "unblock" ? false : true;

        // Save the updated product
        const updatedProduct = await product.save();

        res.status(200).json({ success: true, product: updatedProduct });
    } catch (error) {
        console.log('Error in blocking/unblocking product:', error);
        res.status(500).json({ success: false, error: 'Error in blocking/unblocking product' });
    }
}

module.exports = {
    blockProduct
};


module.exports = { blockProduct };






module.exports = {
    loadProduct,
    loadAddProduct,
    addProduct,
    loadEditProduct,
    editProduct,
    blockProduct
}