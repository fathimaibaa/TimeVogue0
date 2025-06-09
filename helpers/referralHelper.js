const Wallet = require('../models/walletModel')
const WalletTransaction = require("../models/walletTransactionModel");
const User = require('../models/userModel')
const ObjectId = require('mongoose').Types.ObjectId;


const generateReferralCode = (length) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  code += 'Time-';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    code += charset[randomIndex];
  }
  code += '-vogue';
  return code;
};


const creditforRefferedUser = async (code) => {
    
  const findUser = await User.findOne({ referralCode: code })
  
  if (!findUser) return false

  const walletId = findUser.wallet
  

  const updatedWallet = await Wallet.findByIdAndUpdate(
    walletId, { $inc: { balance: 50 } })
  

  const transaction = new WalletTransaction({
    wallet: updatedWallet._id,
    amount: 30,
    type: 'credit',
    event: 'Referral cashback',
  });
  const transactionDone = await transaction.save();
  await Wallet.findByIdAndUpdate(walletId,
    { $push: { transactions: transactionDone._id } })

  return true
}


const creditforNewUser = async (user) => {
  const updatedWallet = await Wallet.findByIdAndUpdate(
    user.wallet, { $inc: { balance: 100 } })
  const transaction = new WalletTransaction({
    wallet: user.wallet,
    amount: 50,
    type: 'credit',
    event: ' New User referral cashback',
  });
  const transactionDone = await transaction.save();
  await Wallet.findByIdAndUpdate(user.wallet,
    { $push: { transactions: transactionDone._id } })
  
}

module.exports = {
  generateReferralCode,
  creditforRefferedUser,
  creditforNewUser
}  