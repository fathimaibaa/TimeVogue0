const express = require('express');
const userRoute = express.Router();
const passport = require('passport')
const userController = require("../controller/userContrl")
const cartController = require('../controller/cartContrl')
const checkoutController = require("../controller/checkoutController");
const addressController = require('../controller/addressContrl')
const orderController = require("../controller/orderContrl");
const moment=require('moment');

const { ensureNotAuthenticated, ensureAuthenticated } = require('../middlewares/userAuth')
const validateID = require('../middlewares/idValidation')



userRoute.use((req, res, next) => {
    req.app.set('layout', 'shop/layoutPage');
    next();
  }) 




userRoute.get('/', userController.loadLandingPage); 

userRoute.get('/register', ensureNotAuthenticated,userController.loadRegister); 
userRoute.post('/register',ensureNotAuthenticated, userController.insertUser);
userRoute.get('/sendOTP', ensureNotAuthenticated, userController.sendOTPpage); 
userRoute.post('/sendOTP', ensureNotAuthenticated, userController.verifyOTP);
userRoute.get('/reSendOTP', ensureNotAuthenticated, userController.reSendOTP); 
userRoute.post('/reSendOTP', ensureNotAuthenticated, userController.verifyResendOTP);

userRoute.get('/login',  ensureNotAuthenticated, userController.loadLogin);
userRoute.post('/login', ensureNotAuthenticated,
  passport.authenticate('local', {
    successRedirect: '/', 
    failureRedirect: '/login', 
    failureFlash: true, 
  }));


userRoute.get('/logout', ensureAuthenticated, userController.userLogout);


userRoute.get('/forgetPassword', ensureNotAuthenticated, userController.forgotPasswordpage);
userRoute.post('/forgetPassword', ensureNotAuthenticated, userController.sendResetLink);
userRoute.get('/resetPassword/:token', ensureNotAuthenticated, userController.resetPassPage);
userRoute.put('/resetPassword/:token', ensureNotAuthenticated, userController.resetPassword);






userRoute.get('/contact', userController.contact);
userRoute.get('/about', userController.aboutUs);

userRoute.get('/profile', ensureAuthenticated, userController.userProfile);

userRoute.post('/edit-profile', ensureAuthenticated,userController.editProfilePost);





userRoute.get("/forgotPassword", userController.loadforgotPassword);
userRoute.post("/forgotPassword", userController.forgotPassword);
userRoute.post("/resetPassword/:id", userController.resetPassword1);
userRoute.get("/newPassword", userController.loadnewPassword);
userRoute.post("/newPassword", userController.newPassword);
userRoute.get(
  "/changePassword",
  ensureAuthenticated,
  userController.changePassword
);


userRoute.get("/wallet/:id", userController.walletTransactionspage);






userRoute.get('/savedAddress', ensureAuthenticated, addressController.savedAddress)
userRoute.get('/addAddress', ensureAuthenticated, addressController.addAddressPage)
userRoute.post('/addAddress', ensureAuthenticated, addressController.insertAddress)
userRoute.get('/editAddress/:id',  ensureAuthenticated, addressController.editAddressPage)
userRoute.post('/editAddress/:id', ensureAuthenticated, addressController.updateAddress)
userRoute.get('/deleteAddress/:id', ensureAuthenticated, addressController.deleteAddress)




 
userRoute.get('/shop', userController.shopping);   
userRoute.get('/viewProduct/:id',  userController.viewProduct); 




userRoute.get('/wishlist', ensureAuthenticated,userController.wishlist);
userRoute.get('/addTo-wishlist/:id',  ensureAuthenticated, userController.addTowishlist);
userRoute.get('/removeWishlist/:id', ensureAuthenticated, userController.removeItemfromWishlist);


userRoute.get("/wallet/:id",ensureAuthenticated, userController.walletTransactionspage);








userRoute.get('/cart', ensureAuthenticated, cartController.cartpage);
userRoute.get('/cart/add/:id', ensureAuthenticated, cartController.addToCart);
userRoute.get('/remove/:id', ensureAuthenticated, cartController.removeFromCart);

userRoute.get('/cart/inc/:id',ensureAuthenticated, cartController.incQuantity);
userRoute.get('/cart/dec/:id', ensureAuthenticated, cartController.decQuantity);




userRoute.get("/orders", orderController.orderspage);
userRoute.get("/orders/:id", orderController.singleOrder);
userRoute.put("/orders/:id", orderController.cancelOrder);
userRoute.put("/orders/single/:id", orderController.cancelSingleOrder);














            
userRoute.post("/checkout", checkoutController.checkoutpage);
userRoute.get("/checkout/get", checkoutController.getCartData);
userRoute.post("/place-order", checkoutController.placeOrder);
userRoute.get("/order-placed/:id", checkoutController.orderPlaced);
userRoute.post("/verify-payment", checkoutController.verifyPayment);
userRoute.post("/update", checkoutController.updateCheckoutPage);
userRoute.post("/coupon", checkoutController.updateCoupon);
userRoute.get("/coupon/remove", checkoutController.removeAppliedCoupon);




















userRoute.get('*',(req,res)=>{res.render('./shop/pages/page404')})


module.exports = userRoute;