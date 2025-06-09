const { checkCartItemsMatch } = require("../helpers/cartHelper");


function calculateSubtotal(userWithCart) {
    const cartItems = userWithCart.cart.map(cartItem => ({ 
        product: cartItem.product,
        quantity: cartItem.quantity,

    }));

    
    const checkingQuantity = cartItems.some(item => parseFloat(item.product.quantity) < item.quantity);
    if (checkingQuantity) return false;
   

    const result = [];
    
    const cartSubtotal = cartItems.reduce((total, item) => {
        return total + item.product.salePrice * item.quantity;
    }, 0);

    const processingFee = 50;
    const orderTotal = cartSubtotal + processingFee;

    result.push(cartItems, cartSubtotal, processingFee, orderTotal);
    return result;
}



module.exports = { calculateSubtotal }