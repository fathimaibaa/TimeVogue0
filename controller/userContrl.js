
const User = require('../models/userModel')
const Product = require('../models/productModel')
const Coupon = require('../models/couponModel');
const Category = require('../models/categoryModel')
const Wallet = require('../models/walletModel')
const asyncHandler = require('express-async-handler')
const { sendOtp, generateOTP } = require('../utility/nodeMailer')
const { forgetPassMail } = require('../utility/forgetPassMail')
const { isValidQueryId } = require('../middlewares/idValidation')
const { generateReferralCode, creditforRefferedUser, creditforNewUser } = require('../helpers/referralHelper')
const otpSetup = require("../utility/otpSetup");
const otpdb = require("../models/otpModel");
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const WalletTransaction=require('../models/walletTransactionModel')
const loadLandingPage = asyncHandler(async (req, res) => {
    try {
        const products = await Product.find({ isListed: true }).populate('images')
    

       
        res.render('./shop/pages/index',{products:products})
    } catch (error) {
        throw new Error(error)
    }

})

const loadRegister = async (req, res) => {
    try {
        res.render('./shop/pages/register')
    } catch (error) {
        throw new Error(error)
    }
}


const insertUser = async (req, res) => {
    try {
        const emailCheck = req.body.email;
        const checkData = await User.findOne({ email: emailCheck });
        if (checkData) {
            return res.render('./shop/pages/register', { userCheck: "User already exists, please try with a new email" });
        } else {
            const UserData = {
                userName: req.body.userName,
                email: req.body.email,
                password: req.body.password,
            };
            if (req.body.referralCode !== '') {
                UserData.referralCode = req.body.referralCode
            }
            

            const OTP = generateOTP() 

            req.session.otpUser = { ...UserData, otp: OTP };
           
            

            
            try {
                sendOtp(req.body.email, OTP, req.body.userName);
                return res.redirect('/sendOTP');
            } catch (error) {
                console.error('Error sending OTP:', error);
                return res.status(500).send('Error sending OTP');
            }
        }
    } catch (error) {
        throw new Error(error);
    }
}

const sendOTPpage = asyncHandler(async (req, res) => {
    try {
        const email = req.session.otpUser.email
        res.render('./shop/pages/verifyOTP', { email })
    } catch (error) {
        throw new Error(error)
    }

})


const verifyOTP = asyncHandler(async (req, res) => {
    try {

        const enteredOTP = req.body.otp;
        const storedOTP = req.session.otpUser.otp; 
        const user = req.session.otpUser;
       

        if (enteredOTP == storedOTP) {
            
            let userFound = null;
            if (user.referralCode && user.referralCode !== '') {
                const referralCode = user.referralCode.trim()
                userFound = await creditforRefferedUser(referralCode)
                delete user.referralCode
            }
            const newUser = await User.create(user);
        
            if (newUser) {
                const referalCode = generateReferralCode(8)

                const createWallet = await Wallet.create({ user: newUser._id })
                

                newUser.wallet = createWallet._id
                newUser.referralCode = referalCode;
                newUser.save();
                
                if (userFound) {
                    await creditforNewUser(newUser)
                }
            }
            delete req.session.otpUser.otp;
            if (!userFound && user.referralCode) {
                req.flash('warning', 'Registration success , Please login , Invalid referral code!')
            } else {
                req.flash('success', 'Registration success , Please login')
            }
            res.redirect('/login');
        } else {
            const message = 'Verification failed, please check the OTP or resend it.';
            
            res.render('./shop/pages/verifyOTP', { errorMessage: message })
        }
    } catch (error) {
        throw new Error(error);
    }
});


const reSendOTP = async (req, res) => {
    try {
        const OTP = generateOTP() 
        req.session.otpUser.otp = { otp: OTP };
        

        const email = req.session.otpUser.email
        const userName = req.session.otpUser.userName


       
        try {
            sendOtp(email, OTP, userName);
            
            return res.render('./shop/pages/reSendOTP', { email });
        } catch (error) {
            console.error('Error sending OTP:', error);
            return res.status(500).send('Error sending OTP');
        }

    } catch (error) {
        throw new Error(error)
    }
}


const verifyResendOTP = asyncHandler(async (req, res) => {
    try {
        const enteredOTP = req.body.otp;
        
        const storedOTP = req.session.otpUser.otp;
        

        const user = req.session.otpUser;

        if (enteredOTP == storedOTP.otp) {
           


            let userFound = null;
            if (user.referralCode && user.referralCode !== '') {
                const referralCode = user.referralCode.trim()
                userFound = await creditforRefferedUser(referralCode)
                delete user.referralCode
            }


            const newUser = await User.create(user);
            if (newUser) {


                const referalCode = generateReferralCode(8)
                const createWallet = await Wallet.create({ user: newUser._id })
                newUser.wallet = createWallet._id
                newUser.referralCode = referalCode;
                newUser.save();
                if (userFound) {
                    await creditforNewUser(newUser._id)
                }

               
            } else { }
            delete req.session.otpUser.otp;

            if (!userFound && user.referralCode) {
                req.flash('warning', 'Registration success , Please login , Invalid referral code!')
            } else {
                req.flash('success', 'Registration success , Please login')
            }

            res.redirect('/login');
        } else {
           
        }
    } catch (error) {
        throw new Error(error);
    }
});



const loadLogin = async (req, res) => {
    try {
        
        res.render('./shop/pages/login')
    } catch (error) {
        throw new Error(error)
    }
}


const forgotPasswordpage = asyncHandler(async (req, res) => {
    try {
        res.render('./shop/pages/forgetPassEmail')
    } catch (error) {
        throw new Error(error)
    }
})


const sendResetLink = asyncHandler(async (req, res) => {
    try {
      
        const email = req.body.email;
        const user = await User.findOne({ email: email });

        if (!user) {
            req.flash('danger', `User Not found for this ${email}`)
            res.redirect("/forgetPassword");

        }

        const resetToken = await user.createResetPasswordToken();
        await user.save();

        const resetUrl = `${req.protocol}://${req.get("host")}/resetPassword/${resetToken}`;
      

        try {
            forgetPassMail(email, resetUrl, user.userName);
            req.flash('info', `Reset Link sent to this ${email}`)
            res.redirect("/forgetPassword");

        } catch (error) {
            user.passwordResetToken = undefined;
            user.passwordResetTokenExpires = undefined;
            console.error(error);
           

            req.flash('Warning', 'Error in sending Email')
            return res.redirect("/forgetPassword");
        }

    } catch (error) {
        throw new Error(error)
    }
})


const resetPassPage = asyncHandler(async (req, res) => {
    try {

        const token = crypto.createHash("sha256").update(req.params.token).digest("hex");
        const user = await User.findOne({ passwordResetToken: token, passwordResetTokenExpires: { $gt: Date.now() } });

        if (!user) {
            req.flash('warning', 'Token expired or Invalid')
            res.redirect("/forgetPassword");
        }

        res.render("./shop/pages/resetPassword", { token });

    } catch (error) {
        throw new Error(error)
    }
})




const resetPassword = asyncHandler(async (req, res) => {



    const token = req.params.token;
    try {
        const user = await User.findOne({ passwordResetToken: token, passwordResetTokenExpires: { $gt: Date.now() } });

        if (!user) {
     
            req.flash('warning', 'Token expired or Invalid')
            res.redirect("/forgetPassword");
        }
        const salt = bcrypt.genSaltSync(10);
        hashedPassword = await bcrypt.hash(req.body.password, salt);

        user.password = hashedPassword;
        user.passwordResetToken = null;
        user.passwordResetTokenExpires = null;
        user.passwordChangedAt = Date.now();

        await user.save();  

        
        req.flash("success", "Password changed");
        res.redirect("/login");

    } catch (error) {
        throw new Error(error)
    }
})








 

const userLogout = async (req, res) => {
    try {
        req.logout(function (err) {

            if (err) {
                next(err);
            }
        })
        res.redirect('/')
    } catch (error) {
        
    }
}


const userProfile = async (req, res) => {
    try {
        const user = req.user;
       
        const wallet = await Wallet.findOne({ user: user._id });
        res.render('./shop/pages/profile',{user,wallet})
    } catch (error) {
        
    }
}


const UpdatePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id;
        const user = await User.findById(userId);

        

        if (!oldPassword) {
            return res.status(400).json({ error: 'Old password not provided' });
        }

        const isPasswordValid = await user.isPasswordMatched(oldPassword);

        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Old password is incorrect' });
        }
       
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        user.password = hashedNewPassword;
        await user.save();
        
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};









const shopping = asyncHandler(async (req, res) => {
   
    try {
        const user = req.user;
        const page = req.query.p || 1;
        const limit = 3;

        const listedCategories = await Category.find({ isListed: true });
        const categoryMapping = {};

        listedCategories.forEach(category => {
            categoryMapping[category.categoryName] = category._id;
        });

        const filter = { isListed: true };
       
        let cat = '6521056a158326ec6474a2ea'

        if (req.query.category) {
          
            if (categoryMapping.hasOwnProperty(req.query.category)) {
                filter.categoryName = categoryMapping[req.query.category];
            } else {
                filter.categoryName = cat
            }
        }
 
    if (req.query.search) {
    filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
       
    ];
    
    if (req.query.search && req.query.category) {
        if (categoryMapping.hasOwnProperty(req.query.category)) {
            filter.categoryName = categoryMapping[req.query.category];
        } else {
            filter.categoryName = cat
        }
    }
    }

     let sortCriteria = {};

        
        if (req.query.sort === 'lowtoHigh') {
            sortCriteria.salePrice = 1;
        } else if (req.query.sort === 'highToLow') {
            sortCriteria.salePrice = -1;
        }
       
        if (req.query.category && req.query.sort) {
            if (categoryMapping.hasOwnProperty(req.query.category)) {
                filter.categoryName = categoryMapping[req.query.category];
            } else {
                filter.categoryName = cat
            }

            if (req.query.sort) {
                sortCriteria.salePrice = 1;
            }
            if (req.query.sort === 'highToLow') {
                sortCriteria.salePrice = -1;
            }
        }
           
        if (req.query.category && req.query.sort) {
         if (categoryMapping.hasOwnProperty(req.query.category)) {
        filter.categoryName = categoryMapping[req.query.category];
            } else {
        filter.categoryName = cat
         }

        if (req.query.sort) {
        sortCriteria.salePrice = 1;
         }
        if (req.query.sort === 'highToLow') {
        sortCriteria.salePrice = -1;
     }
        }


        const findProducts = await Product.find(filter).populate('images')
            .skip((page - 1) * limit)
            .limit(limit)
            .sort(sortCriteria);
            
            let userWishlist;
            let cartProductIds;
        if (user) {
            if (user.cart || user.wishlist) {
                cartProductIds = user.cart.map(cartItem => cartItem.product.toString());
                userWishlist = user.wishlist;
             }

        } else {
            cartProductIds = null;
            userWishlist = false;
        }

        const count = await Product.find(filter)
            
            .countDocuments();
            let selectedCategory = [];
            if (filter.categoryName) {
                selectedCategory.push(filter.categoryName)
            }
           
    

        res.render('./shop/pages/shopping', {
            products: findProducts,
            category: listedCategories,
            cartProductIds,
            user,
            userWishlist,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            selectedCategory
         });
    } catch (error) {
        throw new Error(error);
    }
});





const viewProduct = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id
        const user = req.user
       
        const findProduct = await Product.findOne({ _id: id }).populate('categoryName').populate('images').exec()
       

        if (!findProduct) {
            return res.status(404).render('./shop/pages/page404')
        }

        const products = await Product.find({ isListed: true }).populate('images').limit(3)

        let cartProductIds;
        if (user) {
         cartProductIds = user.cart.map(cartItem => cartItem.product.toString());
        } else {
            cartProductIds = null;

        }
        let wishlist = false
        if (user) {
            wishlist = user.wishlist;
        }
       
        res.render('./shop/pages/productDetail', { product: findProduct, products: products ,cartProductIds,wishlist,
            })
    } 
    catch (error) {
        throw new Error(error)
    }
})





const contact = asyncHandler(async (req, res) => {
    try {
        res.render('./shop/pages/contact')
    } catch (error) {
        throw new Error(error)
    }
})


const aboutUs = asyncHandler(async (req, res) => {
    try {
        res.render('./shop/pages/aboutus')
    } catch (error) {
        throw new Error(error)
    }
})



async function editProfilePost(req, res) {
    
    const userId =req.user.id;
    const user = await User.findOne({ _id: userId });

   
    const newuserName = req.body.userName;
    const newEmail = req.body.email;


   
    user.userName = newuserName;
    user.email = newEmail;
    await user.save();

   
    res.redirect('/profile')
}

const walletTransactionspage = asyncHandler(async (req, res) => {
    try {
        const walletId = req.params.id;
        const walletTransactions = await WalletTransaction.find({ wallet: walletId }).sort({ timestamp: -1 });
        res.render("shop/pages/walletTransaction", {
            title: "Wallet Transactions",
            page: "Wallet-Transactions",
            walletTransactions,
        });
    } catch (error) {
        throw new Error(error);
    }
});



const wishlist = asyncHandler(async (req, res) => {
    try {
        const user = req.user
        const userWishlist = await User.findById({ _id: user.id }).populate({
            path: 'wishlist',
            populate: {
                path: 'images',
            },
        });
      
        res.render('./shop/pages/wishlist', { wishlist: userWishlist.wishlist ,})
    } catch (error) {
        throw new Error(error)
    }
})


const addTowishlist = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.id
        
        const user = await User.findById(userId);
        if (user.wishlist.includes(productId)) {
            
            await User.findByIdAndUpdate(userId, { $pull: { wishlist: productId } })
            return res.json({ success: false, message: 'Product removed from wishlist' });
        }

        await User.findByIdAndUpdate(userId, { $push: { wishlist: productId } })
        res.json({ success: true, message: 'Product Added to wishlist' })
    } catch (error) {
        throw new Error(error)
    }
})



const removeItemfromWishlist = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.id
        await User.findByIdAndUpdate(userId, { $pull: { wishlist: productId } })
        res.redirect('/wishlist')
    } catch (error) {
        throw new Error(error)
    }
})





const loadforgotPassword = async (req, res) => {
    try {
      const messages = req.flash();
      res.render("./shop/pages/forgotPassword", { title:"WAT", messages });
    } catch (error) {
      throw new Error(error);
    }
  }
  
  
  
  const forgotPassword =async (req, res) => {
    try {
      const email = req.body.email;
      co
      const user = await User.findOne({ email });
      if (!user) {
        req.flash("danger", "enter a registered email addresss");
        res.redirect("back");
      } else {
       
        const resetToken = await user.createResetPasswordToken();
        await user.save();
        
        const name = user.userName;
        const sendToken = await otpSetup.sendToken(email, resetToken, name);
        req.flash('success',"verify link send to the email address")
        res.redirect('/forgotPassword')
      }
    } catch (error) {
      throw new Error(error);
    }
  }
  
  
  const emailcheck = async (req, res) => {
    try {
      const existingEmail = await User.findOne({ email: req.body.email });
  
      if (!existingEmail) {
        res.json("please register your email address");
      } else {
        res.json("");
      }
    } catch (error) {
      throw new Error(error);
    }
  }
  
 
  
  const resetPassword1 =async (req, res) => {
    try {
      const resetToken = req.params.id; 
    
  
      const passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      
      const tokenCheck = await User.findOne({ passwordResetToken });
      
      const time = tokenCheck.passwordResetTokenExpires;
      if (time < Date.now()) {
       
        req.flash("danger", "the link expired,try new one");
        res.redirect("/forgotPassword");
      } else {
        
        req.session.email = tokenCheck.email;
        res.redirect("/newPassword");
      }
    } catch (error) {
      throw new Error(error);
    }
  }
  
  
  
  const loadnewPassword =async (req, res) => {
    try {
      res.render("./shop/pages/newPassword", {title:"TimeVogue"});
    } catch (error) {
      throw new Error(error);
    }
  }
  
  
  
  const newPassword = async (req, res) => {
    try {
      const newPassword = req.body.newPassword;
      const email = req.session.email;
      const user = await User.findOne({ email });
      if (user) {
        const salt = bcrypt.genSaltSync(10);
        
        const password = await bcrypt.hash(newPassword, salt);
        user.password = password;
        user.passwordChangedAt = Date.now();
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpires = undefined;
        await user.save();

        // req.flash('success', 'Password changed successfully!');



        req.session.email = null;
        res.redirect("/login");
      
      } else {
        // req.flash('error', 'Some internal error');
      res.redirect("/login");
      }
    } catch (error) {
      throw new Error(error);
    }
  }
  
 
  
  const changePassword = async (req, res) => {
    try {
      const email = req.user.email;
      const user = await User.findOne({ email: email });
      const resetToken = await user.createResetPasswordToken();
      await user.save();
     
   
      const name = user.userName;
      const sendToken = await otpSetup.sendToken(email, resetToken, name);
  
      
      res.status(200).json({ message: "Password change initiated successfully" });
      
      
    } catch (error) {
      
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  









  






module.exports = {
    loadLandingPage,
    loadRegister,
    insertUser,
    sendOTPpage,
    verifyOTP,
    reSendOTP,
    verifyResendOTP,
    loadLogin,
    userLogout,
    userProfile,
    shopping,
    viewProduct,
    contact,
    aboutUs,
   
    walletTransactionspage,
    
    removeItemfromWishlist,
    addTowishlist,
    wishlist,
    newPassword,
    forgotPasswordpage,
    sendResetLink,
    resetPassPage,
    resetPassword,
    editProfilePost,
    loadforgotPassword,
    forgotPassword,
    emailcheck,
  resetPassword1,
  loadnewPassword,
  newPassword,
  changePassword
}