const express=require('express')
const adminRoute=express()
const session =require('express-session')
const config=require('../config/config')
const adminController=require('../controller/adminCon')


adminRoute.set('view engine','ejs')
adminRoute.set('views','views/admin')
adminRoute.use(express.json())
adminRoute.use(express.urlencoded({extended:true}))
adminRoute.use(express.static('public'))



    
adminRoute.get('/', adminController.loginPage);
adminRoute.post('/logout',adminController.logout)
adminRoute.post('/',adminController.verifyLogin)
adminRoute.get('/dashboard',adminController.loadDasboard)
adminRoute.get('/users',adminController.allUsers)
adminRoute.patch('/blockAndUnblock', adminController.userBlock);









module.exports=adminRoute