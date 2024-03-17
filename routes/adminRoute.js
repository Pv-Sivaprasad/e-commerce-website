const express = require('express')
const adminRoute = express()
const path = require('path')
const fs = require('fs');
const session = require('express-session')
const config = require('../config/config')
const adminController = require('../controller/adminCon')
const productController=require('../controller/productCon')
const categoryController=require('../controller/categoryCon')
const auth=require('../middleware/adminAuth')
const upload=require('../middleware/upload')
const multer = require('multer')
adminRoute.set('view engine', 'ejs')
adminRoute.set('views', 'views/admin')
adminRoute.use(express.json())
adminRoute.use(express.urlencoded({ extended: true }))
adminRoute.use(express.static('public'))
const sharp = require('sharp');







 //login and logout   
adminRoute.get('/', adminController.loginPage);
adminRoute.get('/login',adminController.loginPage)
adminRoute.get('/logoout', adminController.logout)
adminRoute.post('/login', adminController.verifyLogin)

//dashboard /login load
adminRoute.get('/dashboard', adminController.loadDasboard)   
adminRoute.post('/dashboard', adminController.loadDasboard)

//to block and unblock user and userlist
adminRoute.get('/users', adminController.allUsers)
adminRoute.patch('/blockAndUnblock', adminController.userBlock);


// all category related 
adminRoute.get('/allcategory', categoryController.allCategory)
adminRoute.get('/addcategory', categoryController.addCategory)
adminRoute.post('/addcategory', upload.single('image'), categoryController.addCat)
adminRoute.get('/editCategory',categoryController.editCategory)
adminRoute.post('/editCategory',upload.single('image'),categoryController.editCat)
adminRoute.patch('/catblock/:cat_id', categoryController.catBlock);


// all product related
adminRoute.get('/allProduct',productController.loadProduct)
adminRoute.post('/allProduct',productController.loadProduct)
adminRoute.get('/addProduct',productController.loadAddProduct)
adminRoute.post('/addproduct', upload.array('cropImages', 4), productController.addProduct);
adminRoute.get('/editProduct',productController.loadEditProduct)
adminRoute.post('/editProduct',upload.array('cropImages', 4),productController.editProduct)
adminRoute.patch('/blockProduct/:productId', productController.blockProduct);


//order related details of users
adminRoute.get('/orderDetails',adminController.orderDetails)
adminRoute.get('/singleorderview',adminController.singleProduct)
adminRoute.post('/updatestatus',adminController.updateStatus)













module.exports = adminRoute