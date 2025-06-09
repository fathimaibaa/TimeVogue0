const asyncHandler = require("express-async-handler");
const {
    getOrders,
    getSingleOrder,
    
    cancelOrderById,
    cancelSingleOrder,
    
} = require("../helpers/orderHelper");
const OrderItem = require("../models/orderItemModel");
const moment=require('moment');



exports.orderspage = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;

        const orders = await getOrders(userId);

        res.render("shop/pages/orders", {
            title: "Orders",
            page: "orders",
            orders,
        });
    } catch (error) {
        throw new Error(error);
    }
});


exports.singleOrder = asyncHandler(async (req, res) => {
    try {
        const orderId = req.params.id;

        const { order, orders } = await getSingleOrder(orderId);
       
        res.render("shop/pages/singleOrder.ejs", {
            title: order.product.title,
            page: order.product.title,
            order,
           
            orders,
            moment:require('moment'),
        });
    } catch (error) {
        throw new Error(error);
    }
});


exports.cancelOrder = asyncHandler(async (req, res) => {
    try {
        const orderId = req.params.id;

        const result = await cancelOrderById(orderId);

        if (result === "redirectBack") {
            res.redirect("back");
        } else {
            res.json(result);
        }
    } catch (error) {
        throw new Error(error);
    }
});

exports.cancelSingleOrder = asyncHandler(async (req, res) => {
    try {
        const orderItemId = req.params.id;

        const result = await cancelSingleOrder(orderItemId, req.user._id);

        if (result === "redirectBack") {
            res.redirect("back");
        } else {
            res.json(result);
        }
    } catch (error) {
        throw new Error(error);
    }
});



