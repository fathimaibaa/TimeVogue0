const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const { status } = require("../utility/status");
const OrderItem = require("../models/orderItemModel");
const Wallet = require("../models/walletModel");
const WalletTransactoins = require("../models/walletTransactionModel");

const Coupon = require("../models/couponModel");
const User = require("../models/userModel");

module.exports = {
    getOrders: asyncHandler(async (userId) => {
        const orders = await Order.find({ user: userId })
            .populate({
                path: "orderItems",
                select: "product status _id",
                populate: {
                    path: "product",
                    select: "title images",
                    populate: {
                        path: "images",
                    },
                },
            })
            .select("orderId orderedDate shippingAddress city")
            .sort({ _id: -1 });

        return orders;
    }),

    getSingleOrder: asyncHandler(async (orderId) => {
        const order = await OrderItem.findById(orderId).populate({
            path: "product",
            model: "Product",
            populate: {
                path: "images",
                model: "Images",
            },
        });

        const orders = await Order.findOne({ orderItems: orderId }).select("shippingAddress city orderedDate");

        return { order, orders };
    }),

    cancelOrderById: asyncHandler(async (orderId) => {
        const order = await Order.findById(orderId).populate("orderItems");

        if (order.orderItems.every((item) => item.status === status.cancelled)) {
            return { message: "Order is already cancelled." };
        }

        if (
            order.payment_method === "online_payment" &&
            order.orderItems.every((item) => {
                return item.isPaid === "pending" ? false : true;
            })
        ) {
            
            for (const item of order.orderItems) {
                const orderItem = await OrderItem.findByIdAndUpdate(item._id, {
                    status: status.cancelled,
                });

                const cancelledProduct = await Product.findById(orderItem.product);
                cancelledProduct.quantity += orderItem.quantity;
                cancelledProduct.sold -= orderItem.quantity;
                await cancelledProduct.save();
            }

           
            order.status = status.cancelled;
            const updatedOrder = await order.save();

            return updatedOrder;
        } else if (order.payment_method === "cash_on_delivery") {
            
            for (const item of order.orderItems) {
                await OrderItem.findByIdAndUpdate(item._id, {
                    status: status.cancelled,
                });

                const cancelledProduct = await Product.findById(item.product);
                cancelledProduct.quantity += item.quantity;
                cancelledProduct.sold -= item.quantity;
                await cancelledProduct.save();
            }

           
            order.status = status.cancelled;
            await order.save();

            return "redirectBack";
        }
    }),

    cancelSingleOrder: asyncHandler(async (orderItemId, userId) => {
        const updatedOrder = await OrderItem.findByIdAndUpdate(orderItemId, {
            status: status.cancelled,
        });

        if (updatedOrder.isPaid !== "pending") {
            const cancelledProduct = await Product.findById(updatedOrder.product);
            cancelledProduct.quantity += updatedOrder.quantity;
            cancelledProduct.sold -= updatedOrder.quantity;
            await cancelledProduct.save();
        }

        const orders = await Order.findOne({ orderItems: orderItemId });
        if (
            (orders.payment_method === "online_payment" || orders.payment_method === "wallet_payment") &&
            updatedOrder.isPaid === "paid"
        ) {
            const wallet = await Wallet.findOne({ user: userId });
            const orderTotal = parseInt(updatedOrder.price) * updatedOrder.quantity;
            const order = await Order.findOne({ orderItems: orderItemId });
            const appliedCoupon = order.coupon;
            if (!wallet) {
                if (order.coupon) {
                    let amountToBeRefunded = 0;
                    if (appliedCoupon.type === "fixedAmount") {
                        const percentage = Math.round((orderTotal / (orders.totalPrice + orders.discount)) * 100);
                        const returnAmount = orderTotal - (appliedCoupon.value * percentage) / 100;
                        amountToBeRefunded = returnAmount;
                    } else if (appliedCoupon.type === "percentage") {
                        const returnAmount = orderTotal - (orderTotal * appliedCoupon.value) / 100;
                        amountToBeRefunded = returnAmount;
                    }
                    const newWallet = await Wallet.create({
                        balance: amountToBeRefunded,
                        user: orders.user,
                    });
                    const walletTransaction = await WalletTransactoins.create({
                        wallet: newWallet._id,
                        event: "Refund",
                        orderId: order.orderId,
                        amount: amountToBeRefunded,
                        type: "credit",
                    });
                } else {
                    const newWallet = await Wallet.create({
                        balance: orderTotal,
                        user: orders.user,
                    });
                    const walletTransaction = await WalletTransactoins.create({
                        wallet: newWallet._id,
                        event: "Refund",
                        orderId: order.orderId,
                        amount: orderTotal,
                        type: "credit",
                    });
                }
            } else {
                if (order.coupon) {
                    let amountToBeRefunded = 0;
                    if (appliedCoupon.type === "fixedAmount") {
                        const percentage = Math.round((orderTotal / (orders.totalPrice + orders.discount)) * 100);
                        const returnAmount = orderTotal - (appliedCoupon.value * percentage) / 100;
                        amountToBeRefunded = returnAmount;
                    } else if (appliedCoupon.type === "percentage") {
                        const returnAmount = orderTotal - (orderTotal * appliedCoupon.value) / 100;
                        amountToBeRefunded = returnAmount;
                    }
                    const existingWallet = await Wallet.findOneAndUpdate({ user: userId });
                    existingWallet.balance += amountToBeRefunded;
                    existingWallet.save();

                    const walletTransaction = await WalletTransactoins.create({
                        wallet: existingWallet._id,
                        amount: amountToBeRefunded,
                        event: "Refund",
                        orderId: order.orderId,
                        type: "credit",
                    });
                } else {
                    const existingWallet = await Wallet.findOneAndUpdate({ user: userId });
                    existingWallet.balance += orderTotal;
                    existingWallet.save();

                    const walletTransaction = await WalletTransactoins.create({
                        wallet: existingWallet._id,
                        amount: orderTotal,
                        event: "Refund",
                        orderId: order.orderId,
                        type: "credit",
                    });
                }
            }
        }
        return "redirectBack";
    }),

    returnOrder: asyncHandler(async (returnOrderId) => {
        const returnOrder = await OrderItem.findByIdAndUpdate(returnOrderId, {
            status: status.returnPending,
        });

        return "redirectBack";
    }),

   
};