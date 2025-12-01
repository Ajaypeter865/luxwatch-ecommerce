

async function recalcCartTotals(cart) {
  // Ensure totals reflect product totalPrice fields (or compute price*qty).
  const subTotal = (cart.products || []).reduce((sum, it) => {
    // robust: if totalPrice missing, compute from price*quantity
    const itemTotal = (typeof it.totalPrice === 'number' ? it.totalPrice : (it.price * it.quantity));
    return sum + itemTotal;
  }, 0);

  cart.subTotal = subTotal;
  // Ensure shipping exists
  cart.shipping = cart.shipping || 0;

  // Apply discount if coupon present
  let discountAmount = 0;
  if (cart.appliedCoupon) {
    discountAmount = Number(cart.appliedCoupon.discountAmount || 0);
  }

  cart.grandTotal = +(cart.subTotal + cart.shipping - discountAmount).toFixed(2);
  if (cart.grandTotal < 0) cart.grandTotal = 0;
  return cart;
}


module.exports = {
    recalcCartTotals
}