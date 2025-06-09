const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const validateMongoDbId = require("../utility/validateMongodbId");
const { roles } = require("../utility/constants");

exports.customerpage = asyncHandler(async (req, res) => {
    try {
        const messages = req.flash();
        const customers = await User.find({ role: roles.user });
        res.render("admin/pages/customers", { title: "Customer", customers, messages, roles });
    } catch (error) {
        throw new Error(error);
    }
});


exports.viewCustomer = asyncHandler(async (req, res) => {
    try {
        const messages = req.flash();
        const id = req.params.id;
        validateMongoDbId(id);
        const customer = await User.findById(id);
        res.render("admin/pages/customer", { title: "Customer", customer, messages });
    } catch (error) {
        throw new Error(error);
    }
});


exports.blockCustomer = asyncHandler(async (req, res) => {
    const id = req.params.id;
    validateMongoDbId(id);
    try {
        const blockedCustomer = await User.findByIdAndUpdate(
            id,
            {
                isBlocked: true,
            },
            {
                new: true,
            }
        );
        if (blockedCustomer) {
            req.flash("success", `${blockedCustomer.email} Blocked Successfully`);
            res.redirect("/admin/customers");
        } else {
            req.flash("danger", `Can't block ${blockedCustomer}`);
            res.redirect("/admin/customers");
        }
    } catch (error) {
        throw new Error(error);
    }
});

exports.unblockCustomer = asyncHandler(async (req, res) => {
    const id = req.params.id;
    validateMongoDbId(id);
    try {
        const unblockCustomer = await User.findByIdAndUpdate(
            id,
            {
                isBlocked: false,
            },
            {
                new: true,
            }
        );
        if (unblockCustomer) {
            req.flash("success", `${unblockCustomer.email} Unblocked Successfully`);
            res.redirect("/admin/customers");
        } else {
            req.flash("danger", `Can't Unblock ${unblockCustomer}`);
            res.redirect("/admin/customers");
        }
    } catch (error) {
        throw new Error(error);
    }
});


exports.updateRole = asyncHandler(async (req, res) => {
    const id = req.params.id;
    validateMongoDbId(id);
    try {
        if (req.user.role === roles.admin && req.body.role === roles.superAdmin) {
            req.flash("warning", "unauthorized, admin can't update user role to super admin");
            res.redirect("/admin/customers");
        } else {
            const updatedCustomer = await User.findByIdAndUpdate(
                id,
                {
                    role: req.body.role,
                },
                {
                    new: true,
                }
            );
            if (updatedCustomer) {
                req.flash("success", `${updatedCustomer.firstName} updated to ${updatedCustomer.role}`);
                res.redirect("/admin/customers");
            } else {
                req.flash("danger", `Can't Update the role`);
            }
        }
    } catch (error) {
        throw new Error(error);
    }
});