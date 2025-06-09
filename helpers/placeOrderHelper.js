
const Order = require('../models/orderModel')
const User = require('../models/userModel')



async function isValidCoupon(couponCode, user, total) {
    const currentDate = new Date();
    const findCoupon = await Coupon.findOne({ code: couponCode });

    if (findCoupon) {
        if (findCoupon.expirationDate && currentDate > findCoupon.expirationDate) {
            return { coupon: null, message: 'Coupon is expired' };

        } else if (findCoupon.maximumUses > 0) {
            if (user.coupons) {
                
                const couponId = String(findCoupon._id); 
                const isCouponused = user.coupons.find(coupon => String(coupon._id) === couponId);
               
                if (isCouponused) {
                    return { coupon: null, message: 'Coupon is invalid.' };
                }
            }
        }

        if (total < findCoupon.minimumPurchase || total > findCoupon.maximumPurchase) {
             
            const minimumPurchase = findCoupon.minimumPurchase;
            const maximumPurchase = findCoupon.maximumPurchase;
            return { coupon: null, message: `Order total must be greater than ${minimumPurchase} , less than ${maximumPurchase} to get this coupon ` };
        }

        return { coupon: findCoupon, message: findCoupon.description };

    } else {
        return { coupon: null, message: 'Coupon is not valid! , try another one.' };
    }
}


function calculateCouponDiscount(findCoupon, total) {
    const orderTotal = []
    const finalTotal = Math.ceil(total * ((100 - findCoupon.discountAmount) / 100))
    const discountAmount = total - finalTotal;

    orderTotal.push(finalTotal, discountAmount)
    return orderTotal
}





module.exports = {
   
    calculateCouponDiscount,
    isValidCoupon
   
}