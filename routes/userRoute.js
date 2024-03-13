const express = require('express');
const userRoute = express.Router();
const passport = require('passport');
const userController = require('../controller/userCon');
const addressController=require('../controller/addressCon')
const productController=require('../controller/productCon')
const cartController=require('../controller/cartCon')
const config = require('../config/config')
const auth = require('../middleware/userAuth')   
const sharp = require('sharp');

// Middleware
userRoute.use(express.json());
userRoute.use(express.static('public'));
userRoute.use(express.urlencoded({ extended: true }));




// User Login Otp Verification Routes   

// to load homepage before login and logout section

userRoute.get('/', userController.home);
userRoute.get('/home', auth.isLogin, userController.home);
userRoute.get('/login', auth.isLogout, userController.login);
userRoute.get('/logout', auth.isLogin, userController.logout);

// to create new user
userRoute.get('/newUser', auth.isLogout, userController.userRegistration);
userRoute.post('/newUser', auth.isLogout, userController.createUser);

// otp for new user
userRoute.get('/otp', auth.isLogout, userController.verifyOtp)
userRoute.post('/otp', auth.isLogout, userController.verifyOtp)
userRoute.get('/resend-otp', auth.isLogout, userController.resendOtp)
userRoute.post('/resend-otp', auth.isLogout, userController.resendOtp)

//logged in user
userRoute.get('/signin', auth.isLogin, userController.verifyLogin)
userRoute.post('/signin', auth.isLogout, userController.verifyLogin)
userRoute.get('/userhome', auth.isLogin, userController.allProducts)


// all product list for logged in user
userRoute.get('/productdetails/:id', userController.loadProductDetails)

// user profile edit 
userRoute.get('/profile', auth.isLogin, userController.loadProfilePage);
userRoute.get('/editprofile', auth.isLogin, userController.loadEditProfile);
userRoute.post('/editprofile', auth.isLogin, userController.editProfile);
userRoute.get('/profileotp', auth.isLogin,userController.renderProfileOTPPage);
userRoute.post('/profileotp',auth.isLogin, userController.verifyProfileOtp);


//filtering of products 
userRoute.get('/lowhigh', productController.lowhigh)
userRoute.get('/highlow', productController.highlow)
userRoute.get('/AToZ',productController.AToZ)
userRoute.get('/ZToA',productController.ZToA)

// all address related add,delete ,edit
userRoute.get('/alladdress',auth.isLogin,addressController.loadAddressPage)
userRoute.get('/addaddress',addressController.loadAddAddress)
userRoute.post('/addaddress',addressController.addAddress)
userRoute.get('/editaddress', addressController.loadEditAddress);
userRoute.post('/editaddress',addressController.editAddress)
userRoute.get('/deleteaddress',addressController.deleteAddress)




//cart
userRoute.get('/cart',auth.isLogin,cartController.loadCartPage);
userRoute.post('/addToCart',cartController.addProductsToCart);
userRoute.patch('/removeFromCart',cartController.removeProduct);






// Google OAuth routes
userRoute.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

userRoute.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  // Successful authentication, redirect to home page or dashboard
  res.render('users/userhome');
});


// Facebook OAuth routes
userRoute.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));
userRoute.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect to a different page
    res.render('users/userHome');
  });





module.exports = userRoute;