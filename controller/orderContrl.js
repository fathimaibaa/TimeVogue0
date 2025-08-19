const asyncHandler = require("express-async-handler");
const {
    getOrders,
    getSingleOrder,
    
    cancelOrderById,
    cancelSingleOrder,
    
} = require("../helpers/orderHelper");
const OrderItem = require("../models/orderItemModel");
const moment=require('moment');



const Order = require('../models/orderModel'); // make sure path is correct

exports.orderspage = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ user: userId })
  .populate({
    path: 'orderItems',
    populate: {
      path: 'product',
      select: 'title images',
      populate: {
        path: 'images',          // Populate the 'images' array inside 'product'
        select: 'thumbnailUrl',  // Only get thumbnailUrl from Images collection
      },
    },
  })
  .lean();


    const filteredOrders = orders.filter(order =>
      order.orderItems.every(item => item.isPaid !== 'pending')
    );

    res.render('shop/pages/orders', {
      title: 'Orders',
      page: 'orders',
      orders: filteredOrders,
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



