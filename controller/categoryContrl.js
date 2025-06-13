const category = require('../models/categoryModel')
const expressHandler = require('express-async-handler')


const categoryManagement = expressHandler(async (req, res) => {
    try {
        const messages = req.flash();
        const findCategory = await category.find()
        res.render('./admin/pages/categories', { catList: findCategory, title: 'Categories',messages  })
    } catch (error) {
        throw new Error(error)
    }
})


const addCategory = expressHandler(async (req, res) => {
    try {
        const messages = req.flash();
        res.render('./admin/pages/addCategory', { title: 'addCategory',messages })
    } catch (error) {
        throw new Error(error)
    }
})


const insertCategory = expressHandler(async (req, res) => {
    try {
        
        const categoryName = req.body.addCategory;
        const regexCategoryName = new RegExp(`^${categoryName}$`, 'i');
        const findCat = await category.findOne({ categoryName: regexCategoryName });

        if (findCat) {
            const catCheck = `Category ${categoryName} Already existing`;
            res.render('./admin/pages/addCategory', { catCheck, title: 'addCategory' });
        } else {
            const result = new category({
                categoryName: categoryName,
            });
            await result.save();

            res.render('./admin/pages/addCategory', {
                message: `Category ${categoryName} added successfully`,
                title: 'addCategory',
            });
        }

    } catch (error) {
        throw new Error(error);
    }
});



const list = expressHandler(async (req, res) => {
    try {

        const id = req.params.id
       

        const listing = await category.findByIdAndUpdate({ _id: id }, { $set: { isListed: true } })
       
        res.redirect('/admin/category')

    } catch (error) {
        throw new Error(error)
    }
})


const unList = expressHandler(async (req, res) => {
    try {
        const id = req.params.id
       

        const listing = await category.findByIdAndUpdate({ _id: id }, { $set: { isListed: false } })
       
        res.redirect('/admin/category')

    } catch (error) {
        throw new Error(error)
    }

})




const searchCategory = expressHandler(async (req, res) => {
    
    try {
        const data = req.body.search
        const searching = await category.find({ categoryName: { $regex: data, $options: 'i' } });
        if (searching) {
            res.render('./admin/pages/categories', { title: 'Searching', catList: searching })

        } else {
            res.render('./admin/pages/categories', { title: 'Searching' })
        }

    } catch (error) {
        throw new Error(error)
    }
})



const editCategory = expressHandler(async (req, res) => {

    try {
        const { id } = req.params
        const catName = await category.findById(id);
        if (catName) {
            res.render('./admin/pages/editCategory', { title: 'editCategory', values: catName });
        } else {
           
        }
    } catch (error) {
        throw new Error(error)
    }
})

const updateCategory = expressHandler(async (req, res) => {
    try {
        const id = req.params.id
        const { updatedName, offer, description, startDate, endDate, } = req.body
        const cat = await category.findById(id)
        cat.categoryName = updatedName;
        cat.offer = offer;
        cat.description = description;
        cat.startDate = startDate;
        cat.endDate = endDate
        const saved = await cat.save()
        res.redirect('/admin/category')
    } catch (error) {
        throw new Error(error)
    }
})


module.exports = {
    categoryManagement,
    addCategory,
    insertCategory,
    list,
    unList,
    editCategory,
    updateCategory,
    searchCategory

}