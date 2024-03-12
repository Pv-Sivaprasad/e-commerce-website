const mongoose=require('mongoose')
const Admin = require('../model/adminModel')
const Product = require('../model/productModel')
const Category = require('../model/categoryModel')
const fs = require('fs')
const path = require('path')
const sharp = require('sharp');
const validator=require('validator')




// to showcase all the categories
const allCategory = async (req, res) => {
    try {
      const categories = await Category.find();
  
      res.render('allCategories', { categories });
    } catch (error) {
      console.log('Error loading categories:', error);
      res.status(500).send('Internal Server Error');
    }
  }

// to render add category page
const addCategory = async (req, res) => {
    try {
      console.log('started');
      return res.render('addCategory')
      console.log('finished');
    } catch (error) {
      console.log('error adding category');
    }
  }
  // const validator = require('validator');

  const allowedImageFormats = ['jpeg', 'jpg', 'png', 'webp'];
  
   // to add a category
  const addCat = async (req, res) => {
    try {
        console.log("req", req.body, req.file); // Check if file is properly received
        const { catName, description } = req.body;
    const cat=await Category.findOne({catName:catName})
        // Validation: Check if category name and description have at least one character
        if (!catName || !description || catName.trim().length === 0 || description.trim().length === 0) {
            console.log('Category name or description is empty');
            return res.render('addCategory', { category:cat,error: 'Category name and description must have at least one character' });
        }

        // Validation: Check if the image is of the allowed formats
        const allowedImageFormats = /\.(jpeg|jpg|png|webp)$/i;
        if (req.file && !allowedImageFormats.test(req.file.filename)) {
            console.log('Invalid image format');
            return res.render('addCategory', { category:cat,error: 'Image must be in jpeg, jpg, png, or webp format' });
        }

        // Check if category name already exists
        const existingCategory = await Category.findOne({ catName: catName });
        const error = 'Category with the same name already exists';
        if (existingCategory) {
            // Category with the same name already exists, render addCategory page with error message
            console.log('Category with the same name already exists');
            return res.render('addCategory', {category:existingCategory, error: error });
        } else {
            // Create new category instance
            const newCategory = new Category({
                catName: catName,
                description: description,
                image: req.file ? req.file.filename : null // Store image path if file is uploaded
            });

            // Save the new category to the database
            const savedCategory = await newCategory.save();
            if (savedCategory) {
                console.log('New category added successfully');
                return res.redirect('/admin/allcategory');
            } else {
                console.log('Error saving new category');
                return res.status(500).json({ error: 'Error in adding category' });
            }
        }
    } catch (error) {
        console.log('Error in adding category:', error);
        return res.status(500).json({ error: 'Error in adding category' });
    }
};

  //to render edit category page
const editCategory = async (req, res) => {
    try {
      console.log('editing start');
      const id = req.query.id
      console.log(id);
      const catData = await Category.findById({ _id: id })
      console.log(catData);
      if (catData) {
        res.render('editCategory', { category: catData })
      } else {
        res.redirect('/admin/allCategory')
      }
  
    } catch (error) {
      console.log('error loading edit cat page');
      console.log(error);
    }
  }

  //to edit a category
  const editCat = async (req, res) => {
    try {
        const { catName, description } = req.body;
        const image = req.file ? req.file.filename : req.body.image;
       const cat=await Category.findOne({catName:catName})
        // Validation: Check if category name and description have at least one character
        if (!catName || !description || catName.trim().length === 0 || description.trim().length === 0) {
            console.log('Category name or description is empty');
            return res.render('editCategory', {category: cat, error: 'Category name and description must have at least one character' });
        }

        // Validation: Check if the image is of the allowed formats
        const allowedImageFormats = /\.(jpeg|jpg|png|webp)$/i;
        if (!allowedImageFormats.test(image)) {
            console.log('Invalid image format');
            return res.render('editCategory', { category: cat,error: 'Image must be in jpeg, jpg, png, or webp format' });
        }

        // Check if the edited category name already exists
        const existingCategory = await Category.findOne({ catName: catName, _id: { $ne: req.body.id } });
        if (existingCategory) {
            console.log('Category with the same name already exists');
            return res.render('editCategory', { category: existingCategory, error: 'Category with the same name already exists' });
        }

        const catData = await Category.findByIdAndUpdate(
            { _id: req.body.id },
            {
                $set: {
                    catName: catName,
                    description: description,
                    image: image
                }
            },
            { new: true }
        );

        console.log('Updated category:', catData);
        console.log('Category updated successfully');
        res.redirect('/admin/allCategory');
    } catch (error) {
        console.log('Error editing category:', error);
        res.status(500).send('Error editing category');
    }
};



  // to block and unblock categories
const catBlock = async (req, res) => {
    try {
      const categoryId = req.params.cat_id;
      const action = req.body.action;
  
      // Find the category by ID
      const category = await Category.findById(categoryId);
  
      // Touserhomele the is_Blocked property based on the action
      category.is_Blocked = action === "unblock" ? false : true;
  
      // Save the updated category
      const updatedCategory = await category.save();
  
      res.status(200).json({ success: true, category: updatedCategory });
    } catch (error) {
      console.log('Error in blocking/unblocking category:', error);
      res.status(500).json({ success: false, error: 'Error in blocking/unblocking category' });
    }
  }


  module.exports={
    allCategory,
    addCategory,
    addCat,
    editCategory,
    editCat,
    catBlock
  }