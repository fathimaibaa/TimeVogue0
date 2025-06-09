const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Product=require('../models/productModel')
const crypto = require('crypto');
const Schema = mongoose.Schema;



const userSchema = new Schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    salt: String,
    isBlock: {
        type: Boolean,
        default: false
    },
    wallet: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' },
    referralCode:{
        type:String,
        unique:true,
        default:'ReferralCode'
    },

    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    cart: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
    }],addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address' }],
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
    
},{timestamps:true});



userSchema.pre('save', async function (next) {
    if (this.isNew) {
        const salt = bcrypt.genSaltSync(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

userSchema.methods.isPasswordMatched = async function (enteredPassword) {
    
    return await bcrypt.compare(enteredPassword, this.password);
};




// resetPassword
userSchema.methods.createResetPasswordToken = async function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
};


userSchema.methods.createResetPasswordToken = async function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    this.passwordResetTokenExpires = Date.now() + 1 * 60 * 1000;
   
    return resetToken;
  };










userSchema.methods.addToCart = async function (productId, quantity) {
    const product = await Product.findById(productId); 
    if (!product) {
        throw new Error('Product not found');
    }
    if (quantity > product.quantity) {

        throw new Error('Not enough stock available');
    }

    const existingCartItem = this.cart.find(item => item.product.equals(product._id));

    if (existingCartItem) {
        
        existingCartItem.quantity += quantity; 
    } else {
        
        this.cart.push({ product: product._id, quantity: 1 });
    }

    await this.save();
    return true; 
};


userSchema.methods.removeFromCart = function (productId) {
    
    this.cart = this.cart.filter(item => !item.product.equals(productId));
    return this.save();
};

userSchema.methods.clearCart = function () {
   
    this.cart = [];
    return this.save();
};





const User = mongoose.model('User', userSchema);
module.exports = User;