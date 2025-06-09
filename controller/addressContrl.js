const Address = require('../models/addressModel')
const User = require('../models/userModel')
const asyncHandler = require('express-async-handler')



const savedAddress = asyncHandler(async (req, res) => {
    try {
        const user = req.user
        const userWithAddresses = await User.findById(user).populate('addresses');
        const address = userWithAddresses.addresses
        res.render('./shop/pages/savedAddress', { address })
    } catch (error) {
        throw new Error(error)
    }
})


const addAddressPage = asyncHandler(async (req, res) => {
    try {
        res.render('./shop/pages/addAddress')
    } catch (error) {
        throw new Error(error)
    }
})


const insertAddress = asyncHandler(async (req, res) => {
    try {
        
        const user = req.user;
        const address = await Address.create(req.body);
        user.addresses.push(address._id); 
        await user.save(); 
        
        res.redirect('/savedAddress')
    } catch (error) {
        throw new Error(error)
    }
})


const editAddressPage = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id
        const addData = await Address.findOne({ _id: id });
        
        if (!addData) {
            return res.status(404).render('./shop/pages/404')
        }
        res.render('./shop/pages/editAddress', { addData })
    } catch (error) {
        throw new Error(error)
    }
})


const updateAddress = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id
       
        const addData = await Address.findOneAndUpdate({ _id: id }, req.body);
        

        res.redirect('/savedAddress')


    } catch (error) {
        throw new Error(error)
    }
})

const deleteAddress = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id
        const deleteAddress = await Address.findOneAndDelete({ _id: id });
        res.redirect('/savedAddress')


    } catch (error) {
        throw new Error(error)
    }
})


module.exports = {
    addAddressPage,
    insertAddress,
    savedAddress,
    editAddressPage,
    updateAddress,
    deleteAddress
}