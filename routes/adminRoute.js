const express = require('express')
const adminRoute = express()
const path = require('path')
const fs = require('fs');
const session = require('express-session')
const config = require('../config/config')
const adminController = require('../controller/adminCon')
const productController=require('../controller/productCon')
const auth=require('../middleware/adminAuth')
const upload=require('../middleware/upload')
const multer = require('multer')
adminRoute.set('view engine', 'ejs')
adminRoute.set('views', 'views/admin')
adminRoute.use(express.json())
adminRoute.use(express.urlencoded({ extended: true }))
adminRoute.use(express.static('public'))







    
adminRoute.get('/', adminController.loginPage);
adminRoute.get('/login',adminController.loginPage)
adminRoute.get('/logoout', adminController.logout)
adminRoute.post('/login', adminController.verifyLogin)

adminRoute.get('/dashboard', adminController.loadDasboard)   
adminRoute.post('/dashboard', adminController.loadDasboard)
adminRoute.get('/users', adminController.allUsers)
adminRoute.patch('/blockAndUnblock', adminController.userBlock);

adminRoute.get('/allcategory', adminController.allCategory)
adminRoute.get('/addcategory', adminController.addCategory)

adminRoute.post('/addcategory', upload.single('image'), adminController.addCat)

adminRoute.get('/editCategory',adminController.editCategory)
adminRoute.post('/editCategory',upload.single('image'),adminController.editCat)

adminRoute.patch('/catblock/:cat_id', adminController.catBlock);


     
adminRoute.get('/allProduct',productController.loadProduct)
adminRoute.post('/allProduct',productController.loadProduct)

adminRoute.get('/addProduct',productController.loadAddProduct)
adminRoute.post('/addproduct', upload.array('images', 4), productController.addProduct);

adminRoute.get('/editProduct',productController.loadEditProduct)
adminRoute.post('/editProduct',upload.array('images', 4),productController.editProduct)

adminRoute.patch('/blockProduct/:productId', productController.blockProduct);


// adminRoute.get('/salesReport',adminController.loadSalesReport)











module.exports = adminRoute