const TAX_RATES = { electronics: 0.19, clothing: 0.09, food: 0.05, books: 0.05, default: 0.19 };
const SHIPPING = { FREE_THRESHOLD: 200, STANDARD_COST: 15, EXPRESS_COST: 30 };
const CART_LIMITS = { MAX_ITEMS: 100, MAX_QUANTITY_PER_ITEM: 50, MIN_PRICE: 0.01, MAX_PRICE: 999999.99 };
module.exports = { TAX_RATES, SHIPPING, CART_LIMITS };
