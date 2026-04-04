const { CART_LIMITS } = require('./constants');

/**
 * Validates that a given item has all required fields and
 * they fall within the accepted ranges.
 */
function validateItem(name, price, quantity, category) {
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new Error('Item name must be a non-empty string');
  }

  if (typeof price !== 'number' || isNaN(price)) {
    throw new Error('Price must be a valid number');
  }

  if (price < CART_LIMITS.MIN_PRICE) {
    throw new Error(`Price must be at least ${CART_LIMITS.MIN_PRICE}`);
  }

  if (price > CART_LIMITS.MAX_PRICE) {
    throw new Error(`Price cannot exceed ${CART_LIMITS.MAX_PRICE}`);
  }

  if (typeof quantity !== 'number' || !Number.isInteger(quantity)) {
    throw new Error('Quantity must be an integer');
  }

  if (quantity <= 0) {
    throw new Error('Quantity must be greater than zero');
  }

  if (quantity > CART_LIMITS.MAX_QUANTITY_PER_ITEM) {
    throw new Error(`Quantity cannot exceed ${CART_LIMITS.MAX_QUANTITY_PER_ITEM} per item`);
  }

  const validCategories = ['electronics', 'clothing', 'food', 'books'];
  if (category && !validCategories.includes(category)) {
    throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
  }

  return true;
}

/**
 * Rounds a number to 2 decimal places.
 * Needed because floating point math can produce weird results.
 */
function roundToTwo(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Checks if a coupon object is valid for use
 */
function validateCoupon(coupon) {
  if (!coupon) {
    return { valid: false, reason: 'Coupon not found' };
  }

  if (coupon.isExpired) {
    return { valid: false, reason: 'Coupon has expired' };
  }

  if (coupon.isUsed) {
    return { valid: false, reason: 'Coupon has already been used' };
  }

  return { valid: true, reason: null };
}

module.exports = {
  validateItem,
  roundToTwo,
  validateCoupon
};
