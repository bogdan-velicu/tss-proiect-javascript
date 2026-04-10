const { TAX_RATES, SHIPPING, DISCOUNT_TYPES, SAMPLE_COUPONS } = require('./utils/constants');
const { roundToTwo, validateCoupon } = require('./utils/validators');

class PricingEngine {
  constructor(couponsDb = SAMPLE_COUPONS) {
    this.coupons = { ...couponsDb };
  }

  /**
   * Calculates tax for a single item based on its category.
   * Different categories have different tax rates.
   */
  calculateItemTax(price, quantity, category = 'default') {
    if (typeof price !== 'number' || price < 0) {
      throw new Error('Price must be a non-negative number');
    }
    if (typeof quantity !== 'number' || quantity < 0) {
      throw new Error('Quantity must be a non-negative number');
    }

    const rate = TAX_RATES[category] || TAX_RATES.default;
    const itemTotal = price * quantity;
    return roundToTwo(itemTotal * rate);
  }

  /**
   * Calculates total tax for all items in a cart
   */
  calculateTotalTax(cartItems) {
    if (!Array.isArray(cartItems)) {
      throw new Error('Cart items must be an array');
    }

    const totalTax = cartItems.reduce((sum, item) => {
      return sum + this.calculateItemTax(item.price, item.quantity, item.category);
    }, 0);

    return roundToTwo(totalTax);
  }

  /**
   * Determines shipping cost based on the subtotal.
   * Orders above the threshold get free shipping.
   */
  calculateShipping(subtotal, shippingType = 'standard') {
    if (typeof subtotal !== 'number' || subtotal < 0) {
      throw new Error('Subtotal must be a non-negative number');
    }

    const validTypes = ['standard', 'express'];
    if (!validTypes.includes(shippingType)) {
      throw new Error(`Invalid shipping type. Use: ${validTypes.join(', ')}`);
    }

    // free shipping for orders over threshold (standard only)
    if (shippingType === 'standard' && subtotal >= SHIPPING.FREE_THRESHOLD) {
      return 0;
    }

    return shippingType === 'express' ? SHIPPING.EXPRESS_COST : SHIPPING.STANDARD_COST;
  }

  /**
   * Applies a percentage-based discount to the given amount.
   * Percentage should be between 0 and 100 (inclusive).
   */
  applyPercentageDiscount(amount, percentage) {
    if (typeof amount !== 'number' || amount < 0) {
      throw new Error('Amount must be a non-negative number');
    }

    if (typeof percentage !== 'number' || percentage < 0 || percentage > 100) {
      throw new Error('Percentage must be between 0 and 100');
    }

    const discount = amount * (percentage / 100);
    return roundToTwo(discount);
  }

  /**
   * Applies a fixed discount. The discount can't exceed
   * the original amount (no negative totals).
   */
  applyFixedDiscount(amount, discountValue) {
    if (typeof amount !== 'number' || amount < 0) {
      throw new Error('Amount must be a non-negative number');
    }

    if (typeof discountValue !== 'number' || discountValue < 0) {
      throw new Error('Discount value must be a non-negative number');
    }

    // don't allow discount to exceed the amount
    const effectiveDiscount = Math.min(discountValue, amount);
    return roundToTwo(effectiveDiscount);
  }

  /**
   * Calculates buy-X-get-Y-free discount for a set of items.
   * Finds the cheapest eligible item to make free.
   */
  applyBuyXGetYFree(cartItems, buyQuantity, freeQuantity) {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return 0;
    }

    if (buyQuantity < 1 || freeQuantity < 1) {
      throw new Error('Buy and free quantities must be at least 1');
    }

    // count total items in the cart
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const requiredItems = buyQuantity + freeQuantity;

    if (totalItems < requiredItems) {
      return 0; // not enough items for this promotion
    }

    // figure out how many free items the customer gets
    const sets = Math.floor(totalItems / requiredItems);
    const freeItemCount = sets * freeQuantity;

    // sort by price ascending to discount the cheapest ones
    const allItems = [];
    for (const item of cartItems) {
      for (let i = 0; i < item.quantity; i++) {
        allItems.push(item.price);
      }
    }
    allItems.sort((a, b) => a - b);

    // sum up the cheapest items as the discount
    let discount = 0;
    for (let i = 0; i < freeItemCount && i < allItems.length; i++) {
      discount += allItems[i];
    }

    return roundToTwo(discount);
  }

  /**
   * Looks up a coupon and validates it.
   * Returns the coupon object or throws with a reason.
   */
  getCoupon(code) {
    if (!code || typeof code !== 'string') {
      throw new Error('Coupon code must be a non-empty string');
    }

    const coupon = this.coupons[code.toUpperCase()];
    const validation = validateCoupon(coupon);

    if (!validation.valid) {
      throw new Error(validation.reason);
    }

    return coupon;
  }

  /**
   * Applies a coupon to the given subtotal.
   * Checks min order value and returns the discount amount.
   */
  applyCoupon(code, subtotal) {
    const coupon = this.getCoupon(code);

    if (subtotal < coupon.minOrderValue) {
      throw new Error(
        `Minimum order value for this coupon is ${coupon.minOrderValue}. Current subtotal: ${subtotal}`
      );
    }

    switch (coupon.type) {
      case DISCOUNT_TYPES.PERCENTAGE:
        return this.applyPercentageDiscount(subtotal, coupon.value);

      case DISCOUNT_TYPES.FIXED:
        return this.applyFixedDiscount(subtotal, coupon.value);

      default:
        throw new Error(`Unsupported coupon type: ${coupon.type}`);
    }
  }

  /**
   * Calculates the volume discount based on total number of items.
   * The more you buy, the bigger the discount percentage.
   */
  calculateVolumeDiscount(totalItems, subtotal) {
    if (totalItems < 0 || subtotal < 0) {
      throw new Error('Total items and subtotal must be non-negative');
    }

    let discountPercentage = 0;

    if (totalItems >= 30) {
      discountPercentage = 10;
    } else if (totalItems >= 20) {
      discountPercentage = 7;
    } else if (totalItems >= 10) {
      discountPercentage = 5;
    } else if (totalItems >= 5) {
      discountPercentage = 2;
    }

    return this.applyPercentageDiscount(subtotal, discountPercentage);
  }

  /**
   * Calculates loyalty points earned from a purchase.
   * 1 point per 10 RON spent. Bonus points for large orders.
   */
  calculateLoyaltyPoints(totalAmount) {
    if (typeof totalAmount !== 'number' || totalAmount < 0) {
      throw new Error('Total amount must be a non-negative number');
    }

    let points = Math.floor(totalAmount / 10);

    // bonus points for larger orders
    if (totalAmount >= 500) {
      points += 50;
    } else if (totalAmount >= 200) {
      points += 20;
    } else if (totalAmount >= 100) {
      points += 10;
    }

    return points;
  }

  /**
   * Puts it all together - calculates the final price for a cart.
   * Applies discounts, tax, and shipping in the right order.
   */
  calculateTotal(cart) {
    if (!cart || typeof cart.getSubtotal !== 'function') {
      throw new Error('Invalid cart object');
    }

    if (cart.isEmpty()) {
      return {
        subtotal: 0,
        discount: 0,
        couponDiscount: 0,
        volumeDiscount: 0,
        tax: 0,
        shipping: 0,
        total: 0,
        loyaltyPoints: 0,
        savings: 0
      };
    }

    const subtotal = cart.getSubtotal();
    const totalItems = cart.getTotalItemCount();

    // calculate volume discount first
    const volumeDiscount = this.calculateVolumeDiscount(totalItems, subtotal);

    // apply coupon discount on the subtotal after volume discount
    let couponDiscount = 0;
    if (cart.appliedCoupon) {
      try {
        couponDiscount = this.applyCoupon(cart.appliedCoupon, subtotal - volumeDiscount);
      } catch (e) {
        // if coupon fails, we just skip it (don't break the checkout)
        couponDiscount = 0;
      }
    }

    const totalDiscount = roundToTwo(volumeDiscount + couponDiscount);
    const discountedSubtotal = roundToTwo(subtotal - totalDiscount);

    // tax is calculated on the discounted price
    const tax = this.calculateTotalTax(cart.items);
    const taxOnDiscounted = roundToTwo(tax * (discountedSubtotal / subtotal));

    // shipping is based on the discounted subtotal
    const shipping = this.calculateShipping(discountedSubtotal);

    const total = roundToTwo(discountedSubtotal + taxOnDiscounted + shipping);
    const loyaltyPoints = this.calculateLoyaltyPoints(total);

    return {
      subtotal,
      discount: totalDiscount,
      couponDiscount,
      volumeDiscount,
      tax: taxOnDiscounted,
      shipping,
      total,
      loyaltyPoints,
      savings: totalDiscount
    };
  }
}

module.exports = PricingEngine;
