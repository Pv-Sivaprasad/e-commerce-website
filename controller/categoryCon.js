const mongoose=require('mongoose')
const Admin = require('../model/adminModel')
const Product = require('../model/productModel')
const Category = require('../model/categoryModel')
const fs = require('fs')
const path = require('path')
const sharp = require('sharp');




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

  //to add a new category
// const addCat = async (req, res) => {
//     try {
//       console.log("req", req.body, req.file); 
//       let { catName, description } = req.body;
  
//       // Check if category name already exists
//       const regexPattern = new RegExp(`^${catName}$`, 'i');
//       const alreadyExist = await Category.find({ catName: regexPattern });
  
//       if (alreadyExist.length > 0) {
//         return res.redirect('/admin/addCategory');
//       }
//       console.log("files", req.file);
//       // Create new category instance
//       const newCategory = new Category({
//         catName: catName,
//         description: description,
//         image: req.file ? req.file.filename : null // Store image path if file is uploaded
//       });
  
//       // Save the new category to the database
//       const save = await newCategory.save();
  
//       if (save) {
//         return res.redirect('/admin/allcategory');
//       } else {
//         console.log('error in returning');
//         return res.status(500).json({ error: 'Error in adding category' });
//       }
//     } catch (error) {
//       console.log('error in adding category');
//       console.log(error);
//       return res.status(500).json({ error: 'Error in adding category' });
//     }
//   }

const addCat = async (req, res) => {
    try {
        console.log("req", req.body, req.file); // Check if file is properly received
        const { catName, description } = req.body;

        // Check if category name already exists
        const existingCategory = await Category.findOne({ catName: catName });
        const error= 'Category with the same name already exists'

        if (existingCategory) {
            // Category with the same name already exists, render addCategory page with error message
            console.log('Category with the same name already exists');
            return res.render('addCategory', { error: error });
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

  //to edit the category
const editCat = async (req, res) => {
    try {
      const { catName, description } = req.body;
      const image = req.file ? req.file.filename : req.body.image;
  
      console.log(catName, description);
      console.log(image);
    
       
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