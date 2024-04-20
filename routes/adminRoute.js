const express = require('express')
const adminRoute = express()
const path = require('path')
const fs = require('fs');
const session = require('express-session')
const config = require('../config/config')
const adminController = require('../controller/adminCon')
const productController=require('../controller/productCon')
const categoryController=require('../controller/categoryCon')
const copuonController=require('../controller/couponCon')
const offerController=require('../controller/offerCon')
const salesController=require('../controller/salesCon')
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
adminRoute.get('/login',auth.isLogout,adminController.loginPage)
adminRoute.get('/logoout', adminController.logout)
adminRoute.post('/login', adminController.verifyLogin)

//dashboard /login load
adminRoute.get('/dashboard',auth.isLogin, adminController.loadDashboard)   
adminRoute.post('/dashboard', adminController.loadDashboard)

//to block and unblock user and userlist
adminRoute.get('/users',auth.isLogin, adminController.allUsers)
adminRoute.patch('/blockAndUnblock', adminController.userBlock);

// all category related 
adminRoute.get('/allcategory',auth.isLogin, categoryController.allCategory)
adminRoute.get('/addcategory',auth.isLogin, categoryController.addCategory)
adminRoute.post('/addcategory', upload.single('image'), categoryController.addCat)
adminRoute.get('/editCategory',auth.isLogin,categoryController.editCategory)
adminRoute.post('/editCategory',upload.single('image'),categoryController.editCat)
adminRoute.patch('/catblock/:cat_id', categoryController.catBlock);

// all product related
adminRoute.get('/allProduct',auth.isLogin,productController.loadProduct)
adminRoute.post('/allProduct',productController.loadProduct)
adminRoute.get('/addProduct',auth.isLogin,productController.loadAddProduct)
adminRoute.post('/addproduct', upload.array('cropImages', 4), productController.addProduct);
adminRoute.get('/editProduct',auth.isLogin,productController.loadEditProduct)
adminRoute.post('/editProduct',upload.array('cropImages', 4),productController.editProduct)
adminRoute.patch('/blockProduct/:productId', productController.blockProduct);

//order related details of users
adminRoute.get('/orderDetails',auth.isLogin,adminController.orderDetails)
adminRoute.get('/singleorderview',auth.isLogin,adminController.singleProduct)
adminRoute.post('/updatestatus',adminController.updateStatus)


//coupon related details
adminRoute.get('/coupon',auth.isLogin,copuonController.couponPage)
adminRoute.get('/addcoupon',auth.isLogin,copuonController.loadAddCoupon)
adminRoute.post('/addcoupon',copuonController.addCoupon)
adminRoute.get('/editcoupon',auth.isLogin,copuonController.loadEditCoupon)
adminRoute.post('/editcoupon',copuonController.editCoupon)
adminRoute.post('/deletecoupon',copuonController.deleteCoupon)

//offer related details
adminRoute.get('/offer',auth.isLogin,offerController.offerPage)
adminRoute.get('/addoffer',auth.isLogin,offerController.loadAddOffer)
adminRoute.post('/addoffer',offerController.addOffer)
adminRoute.get('/editOffer',auth.isLogin,offerController.loadEditOffer)
adminRoute.post('/editOffer',offerController.editOffer)
adminRoute.post('/deleteoffer',offerController.deleteOffer)


// sales report details

adminRoute.get('/salesreport',auth.isLogin,salesController.loadSalesReport)
adminRoute.get('/salesDaily',auth.isLogin,salesController.dailySalesReport)
adminRoute.get('/salesWeekly',auth.isLogin,salesController.generateWeeklyReport)
adminRoute.get('/salesMonthly',auth.isLogin,salesController.generateMonthlyReport)
adminRoute.get('/salesYearly',auth.isLogin,salesController.generateYearlyReport)
adminRoute.get('/customDateReport',auth.isLogin,salesController.generateCustomDateReport)



//graph
adminRoute.post('/graph',salesController.graphData)




module.exports = adminRoute