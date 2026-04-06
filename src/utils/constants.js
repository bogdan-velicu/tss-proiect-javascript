// Application-wide constants for the shopping cart system

const TAX_RATES = {
  electronics: 0.19,
  clothing: 0.09,
  food: 0.05,
  books: 0.05,
  default: 0.19
};

const SHIPPING = {
  FREE_THRESHOLD: 200,
  STANDARD_COST: 15,
  EXPRESS_COST: 30
};

const CART_LIMITS = {
  MAX_ITEMS: 100,
  MAX_QUANTITY_PER_ITEM: 50,
  MIN_PRICE: 0.01,
  MAX_PRICE: 999999.99
};

const DISCOUNT_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
  BUY_X_GET_Y: 'buy_x_get_y'
};

// some sample coupons for testing
const SAMPLE_COUPONS = {
  'SAVE10': {
    code: 'SAVE10',
    type: DISCOUNT_TYPES.PERCENTAGE,
    value: 10,
    minOrderValue: 50,
    isExpired: false,
    isUsed: false,
    maxUses: 1
  },
  'FLAT25': {
    code: 'FLAT25',
    type: DISCOUNT_TYPES.FIXED,
    value: 25,
    minOrderValue: 100,
    isExpired: false,
    isUsed: false,
    maxUses: 5
  },
  'SUMMER20': {
    code: 'SUMMER20',
    type: DISCOUNT_TYPES.PERCENTAGE,
    value: 20,
    minOrderValue: 0,
    isExpired: true,
    isUsed: false,
    maxUses: 1
  },
  'USED50': {
    code: 'USED50',
    type: DISCOUNT_TYPES.PERCENTAGE,
    value: 50,
    minOrderValue: 0,
    isExpired: false,
    isUsed: true,
    maxUses: 1
  },
  'BUY2GET1': {
    code: 'BUY2GET1',
    type: DISCOUNT_TYPES.BUY_X_GET_Y,
    buyQuantity: 2,
    freeQuantity: 1,
    minOrderValue: 0,
    isExpired: false,
    isUsed: false,
    maxUses: 10
  }
};

module.exports = {
  TAX_RATES,
  SHIPPING,
  CART_LIMITS,
  DISCOUNT_TYPES,
  SAMPLE_COUPONS
};
