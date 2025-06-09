const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const Images = require('../models/imageModel.js')
const asyncHandler = require('express-async-handler')
const sharp = require('sharp')
const path = require('path')
const fs = require('fs'); // add this at the top of your file if not already

const mongoose = require('mongoose');


const productManagement = asyncHandler(async (req, res) => {
    try {
        const findProduct = await Product.find().populate('categoryName').populate("images");
        res.render('./admin/pages/products', { title: 'Products', productList: findProduct })
    } catch (error) {
        throw new Error(error)
    }
})


const addProduct = asyncHandler(async (req, res) => {
    try {
        const category = await Category.find({ isListed: true })
        if (category) {
            res.render('./admin/pages/addProduct', { title: 'addProduct', catList: category })
        }
    } catch (error) {
        throw new Error(error)
    }
})



const insertProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      brand,
      productPrice,
      salePrice,
      categoryName,
      quantity,
      color
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(categoryName)) {
      return res.status(400).send('Invalid category ID');
    }

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).send('No image files uploaded');
    }

    const productImages = [];
    const uploadDir = path.join(__dirname, '../public/admin/uploads');

    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    for (const file of req.files) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const originalExt = path.extname(file.originalname);
      const originalFileName = path.basename(file.originalname, originalExt);
      const newFileName = `${originalFileName}-${uniqueSuffix}${originalExt}`;

      const originalPath = path.join(uploadDir, newFileName);
      const thumbName = `thumb-${newFileName}`;
      const thumbnailPath = path.join(uploadDir, thumbName);

      // Rename the original file to the unique one
      fs.renameSync(file.path, originalPath);

      // Create thumbnail
      await sharp(originalPath)
        .resize(300, 300)
        .toFile(thumbnailPath);

      const image = new Images({
        imageUrl: `admin/uploads/${newFileName}`,
        thumbnailUrl: `admin/uploads/${thumbName}`
      });
      await image.save();

      productImages.push(image._id);
    }

    const product = new Product({
      title,
      description,
      brand,
      productPrice: Number(productPrice),
      salePrice: Number(salePrice),
      categoryName: new mongoose.Types.ObjectId(categoryName),
      quantity: Number(quantity),
      images: productImages,
      color
    });

    await product.save();

    return res.redirect('/admin/products');
  } catch (error) {
    console.error('Error inserting product:', error);
    return res.status(500).send(error.message || 'Something went wrong');
  }
};

const listProduct = asyncHandler(async (req, res) => {
    try {

        const id = req.params.id
        

        const listing = await Product.findByIdAndUpdate({ _id: id }, { $set: { isListed: true } })
       
        res.redirect('/admin/products')

    } catch (error) {
        throw new Error(error)
    }
})


const unListProduct = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id
      

        const listing = await Product.findByIdAndUpdate({ _id: id }, { $set: { isListed: false } })
      
        res.redirect('/admin/products')

    } catch (error) {
        throw new Error(error)
    }

})


const editProductPage = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id
        const category = await Category.find({ isListed: true })
        const productFound = await Product.findById(id).populate('categoryName').populate("images");
       
        if (productFound) {
            res.render('./admin/pages/editProduct', { title: 'editProduct', product: productFound, catList: category })
        }
    } catch (error) {
        throw new Error(error)
    }
})

const updateProduct = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id;
      
        const updateProduct = await Product.findByIdAndUpdate({ _id: id }, req.body);

        res.redirect('/admin/products');

    } catch (error) {
        throw new Error(error)
    }

})


const editImage = asyncHandler(async (req, res) => {
  try {
    const imageId = req.params.id;
    const file = req.file;

    if (!file) {
      req.flash("error", "No file uploaded.");
      return res.redirect("back");
    }

    const uploadDir = path.join(__dirname, '../public/admin/uploads');

    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const originalExt = path.extname(file.originalname);
    const originalFileName = path.basename(file.originalname, originalExt);
    const newFileName = `${originalFileName}-${uniqueSuffix}${originalExt}`;
    const thumbName = `thumb-${newFileName}`;

    const originalPath = path.join(uploadDir, newFileName);
    const thumbnailPath = path.join(uploadDir, thumbName);

    // Move uploaded file to correct path
    fs.renameSync(file.path, originalPath);

    // Create thumbnail from the new image
    await sharp(originalPath)
      .resize(300, 300)
      .toFile(thumbnailPath);

    // Update DB entry
    await Images.findByIdAndUpdate(imageId, {
      imageUrl: `admin/uploads/${newFileName}`,
      thumbnailUrl: `admin/uploads/${thumbName}`
    });

    req.flash("success", "Image updated successfully");
    res.redirect("back");
  } catch (error) {
    console.error("Edit Image Error:", error);
    req.flash("error", "Failed to update image");
    res.redirect("back");
  }
});

const deleteImage = asyncHandler(async (req, res) => {
    try {
        const imageId = req.params.id;
       
        await Images.findByIdAndRemove(imageId);
        const product = await Product.findOneAndUpdate(
            { images: imageId },
            { $pull: { images: imageId } },
            { new: true }
        );
        res.json({ message: "Images Removed" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


module.exports = {
    addProduct,
    insertProduct,
    productManagement,
    listProduct,
    unListProduct,
    editProductPage,
    updateProduct,
    editImage,
    deleteImage
} 