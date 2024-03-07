const express = require('express')
const adminRoute = express()
const multer = require('multer')
const path = require('path')
const fs = require('fs');
const session = require('express-session')
const config = require('../config/config')
const adminController = require('../controller/adminCon')
const productController=require('../controller/productCon')
const auth=require('../middleware/adminAuth')


adminRoute.set('view engine', 'ejs')
adminRoute.set('views', 'views/admin')
adminRoute.use(express.json())
adminRoute.use(express.urlencoded({ extended: true }))
adminRoute.use(express.static('public'))



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/userImages'))
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name)
    }
})

const upload = multer({ 
    storage: storage,
    limits: { fieldSize: 10 * 1024 * 1024 } // Adjust size limit as needed (10MB in this example)
});

    
adminRoute.get('/', adminController.loginPage);
adminRoute.get('/login',adminController.loginPage)
adminRoute.get('/logoout', adminController.logout)
adminRoute.post('/', adminController.verifyLogin)

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











module.exports = adminRoute