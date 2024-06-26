const express = require('express');
const userRoute = express.Router();
const passport = require('passport');
const userController = require('../controller/userCon');
const addressController=require('../controller/addressCon')
const productController=require('../controller/productCon')
const cartController=require('../controller/cartCon')
const orderController=require('../controller/orderCon')
const paymentController=require('../controller/paymentCon')
const couponController=require('../controller/couponCon')
const referralController=require('../controller/referralCon')

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
userRoute.get('/otp', auth.isLogout,auth.isBlocked, userController.verifyOtp)
userRoute.post('/otp', auth.isLogout, userController.verifyOtp)
userRoute.get('/resend-otp', auth.isLogout, userController.resendOtp)
userRoute.post('/resend-otp', auth.isLogout, userController.resendOtp)

//logged in user
userRoute.get('/signin', auth.isLogin, userController.verifyLogin)
userRoute.post('/signin', auth.isLogout, userController.verifyLogin)
userRoute.get('/userhome',auth.isBlocked, auth.isLogin, userController.allProducts)


// all product list for logged in user
userRoute.get('/productdetails/:id', auth.isBlocked,userController.loadProductDetails)

// user profile edit 
userRoute.get('/profile', auth.isBlocked,auth.isLogin, userController.loadProfilePage);
userRoute.get('/editprofile', auth.isLogin,auth.isBlocked, userController.loadEditProfile);
userRoute.post('/editprofile', auth.isLogin, userController.editProfile);
userRoute.get('/profileotp', auth.isLogin,auth.isBlocked,userController.renderProfileOTPPage);
userRoute.post('/profileotp',auth.isLogin, userController.verifyProfileOtp);


//filtering of products 
userRoute.get('/lowhigh', productController.lowhigh)
userRoute.get('/highlow', productController.highlow)
userRoute.get('/AToZ',productController.AToZ)
userRoute.get('/ZToA',productController.ZToA)

// all address related add,delete ,edit
userRoute.get('/alladdress',auth.isLogin,auth.isBlocked,addressController.loadAddressPage)
userRoute.get('/addaddress',auth.isLogin,auth.isBlocked,addressController.loadAddAddress)
userRoute.post('/addaddress',auth.isLogin,addressController.addAddress)
userRoute.get('/editaddress', auth.isLogin,auth.isBlocked,addressController.loadEditAddress);
userRoute.post('/editaddress',auth.isLogin,addressController.editAddress)
userRoute.get('/deleteaddress',auth.isLogin,auth.isBlocked,addressController.deleteAddress)




//cart
userRoute.get('/cart',auth.isLogin,auth.isBlocked,cartController.loadCartPage);
userRoute.post('/addToCart',auth.isLogin,cartController.addProductsToCart);
userRoute.patch('/removeFromCart',auth.isLogin,cartController.removeProduct);
userRoute.patch('/updateCart',auth.isLogin,cartController.updateCart);


//checkout
userRoute.get('/checkout',auth.isLogin,auth.isBlocked,cartController.loadCheckoutPage)
userRoute.post('/checkaddress',auth.isLogin,addressController.checkoutAddAddress)
userRoute.get('/ordersuccess',auth.isLogin,auth.isBlocked,cartController.orderSuccess)
userRoute.post('/placeorder',auth.isLogin,orderController.placeOrder)

//razorpay checkout
userRoute.post('/createorder',auth.isLogin,paymentController.createOrder)
userRoute.post('/verification',auth.isLogin,paymentController.verifypayment)
userRoute.post('/retry',auth.isLogin,paymentController.retry)
userRoute.post('/retrypayment',auth.isLogin,paymentController.retryPayment)

// my orders
userRoute.get('/myorder',auth.isLogin,auth.isBlocked,orderController.loadOrderDetails)
userRoute.get('/singleorder',auth.isLogin,auth.isBlocked,orderController.singleOrder)
userRoute.patch('/cancelorder',auth.isLogin,orderController.cancelOrder)
userRoute.patch('/returnorder',auth.isLogin,orderController.returnOrder)


// all wallet related
userRoute.get('/wallet',auth.isLogin,auth.isBlocked,paymentController.wallet)
userRoute.post('/addfunds',auth.isLogin,paymentController.addFunds)
userRoute.post('/fundVerification',auth.isLogin,paymentController.fundverification)
userRoute.post('/addwallet',auth.isLogin,paymentController.addToWallet)
userRoute.post('/placeorderwallet',paymentController.placeOrderWallet)

//all wishlist related
userRoute.get('/wishlist',auth.isLogin,auth.isBlocked,userController.wishlist)
userRoute.post('/addToWishlist',auth.isLogin,userController.addToWishlist)
userRoute.patch('/removeFromWishlist',auth.isLogin,userController.removeFromWishlist)

//userside coupon related
userRoute.patch('/applyCoupon',auth.isLogin,couponController.verifyCoupon)    
userRoute.patch('/removeCoupon',auth.isLogin,couponController.removeCoupon)

//invoice
userRoute.get('/invoice',auth.isBlocked,auth.isLogin,orderController.loadInvoice)
  
//referral
userRoute.get('/refferal',auth.isBlocked,referralController.refferal)




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