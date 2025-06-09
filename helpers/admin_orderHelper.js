const Product = require("../models/productModel");
const OrderItem = require("../models/orderItemModel");
const Order = require("../models/orderModel");
const Coupon = require("../models/couponModel");
const status = require("../utility/status");

async function handleOrderPayment(order, orders) {
    const orderTotal = parseInt(order.price * order.quantity);

    if (orders.coupon) {
        const appliedCoupon = orders.coupon;
       
        let amountToBeRefunded = 0;
        if (appliedCoupon.type === "fixedAmount") {
            const percentage = Math.round((orderTotal / (orders.totalPrice + orders.discount)) * 100);
            const returnAmount = orderTotal - (appliedCoupon.value * percentage) / 100;
            amountToBeRefunded = returnAmount;
        } else if (appliedCoupon.type === "percentage") {
            const returnAmount = orderTotal - (orderTotal * appliedCoupon.value) / 100;
            amountToBeRefunded = returnAmount;
        }
    }


}



module.exports = {
    updateOrderStatus: async (orderId, newStatus) => {
        return OrderItem.findByIdAndUpdate(orderId, { status: newStatus });
    },

    handleCancelledOrder: async (order) => {
        if (order.isPaid !== "pending") {
            const product = await Product.findById(order.product);
            product.sold -= order.quantity;
            product.quantity += order.quantity;
            await product.save();
        }

        const orders = await Order.findOne({ orderItems: order._id });
        

        if (order.isPaid) {
            await handleOrderPayment(order, orders);
        }
        if (order.isPaid) {
            await handleOrderPayment(order, orders);
        }
    },

   
};

