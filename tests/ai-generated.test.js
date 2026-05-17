// Teste generate automat de ChatGPT (GPT-4)
// Prompt utilizat: "Am urmatoarea clasa JavaScript. Genereaza teste unitare complete
// folosind Jest care sa acopere toate functionalitatile, inclusiv cazuri de eroare si valori limita."
// Codul sursa furnizat: ShoppingCart.js (227 linii), PricingEngine.js (299 linii),
// constants.js, validators.js — intr-o singura conversatie, fara iteratii suplimentare.

const ShoppingCart = require('../src/ShoppingCart');
const PricingEngine = require('../src/PricingEngine');
const { SAMPLE_COUPONS } = require('../src/utils/constants');

// ============================================================
// ShoppingCart Tests
// ============================================================

describe('ShoppingCart', () => {
  let cart;

  beforeEach(() => {
    cart = new ShoppingCart();
  });

  describe('addItem', () => {
    test('should add a valid item to the cart', () => {
      const item = cart.addItem('Laptop', 999.99, 1, 'electronics');
      expect(item).toBeDefined();
      expect(item.name).toBe('Laptop');
      expect(item.price).toBe(999.99);
      expect(item.quantity).toBe(1);
      expect(item.category).toBe('electronics');
    });

    test('should add item with default quantity', () => {
      const item = cart.addItem('Phone', 499.99);
      expect(item.quantity).toBe(1);
    });

    test('should add item with null category', () => {
      const item = cart.addItem('Widget', 10, 1, null);
      expect(item.category).toBeNull();
    });

    test('should throw for empty name', () => {
      expect(() => cart.addItem('', 10, 1)).toThrow('Item name must be a non-empty string');
    });

    test('should throw for non-string name', () => {
      expect(() => cart.addItem(123, 10, 1)).toThrow('Item name must be a non-empty string');
    });

    test('should throw for null name', () => {
      expect(() => cart.addItem(null, 10, 1)).toThrow('Item name must be a non-empty string');
    });

    test('should throw for invalid price - zero', () => {
      expect(() => cart.addItem('Book', 0, 1)).toThrow();
    });

    test('should throw for invalid price - negative', () => {
      expect(() => cart.addItem('Book', -5, 1)).toThrow();
    });

    test('should throw for invalid price - exceeds max', () => {
      expect(() => cart.addItem('Book', 1000000, 1)).toThrow();
    });

    test('should throw for NaN price', () => {
      expect(() => cart.addItem('Book', NaN, 1)).toThrow('Price must be a valid number');
    });

    test('should throw for string price', () => {
      expect(() => cart.addItem('Book', 'abc', 1)).toThrow('Price must be a valid number');
    });

    test('should throw for zero quantity', () => {
      expect(() => cart.addItem('Book', 10, 0)).toThrow('Quantity must be greater than zero');
    });

    test('should throw for negative quantity', () => {
      expect(() => cart.addItem('Book', 10, -1)).toThrow('Quantity must be greater than zero');
    });

    test('should throw for quantity exceeding limit', () => {
      expect(() => cart.addItem('Book', 10, 51)).toThrow();
    });

    test('should throw for non-integer quantity', () => {
      expect(() => cart.addItem('Book', 10, 2.5)).toThrow('Quantity must be an integer');
    });

    test('should throw for invalid category', () => {
      expect(() => cart.addItem('Book', 10, 1, 'sports')).toThrow('Invalid category');
    });

    test('should update quantity for duplicate item', () => {
      cart.addItem('Laptop', 999.99, 1, 'electronics');
      const updated = cart.addItem('Laptop', 999.99, 2, 'electronics');
      expect(updated.quantity).toBe(3);
    });

    test('should trim item name', () => {
      const item = cart.addItem('  Book  ', 10, 1);
      expect(item.name).toBe('Book');
    });

    test('should throw when cart is full', () => {
      for (let i = 0; i < 10; i++) {
        cart.addItem(`Item${i}`, 10, 10);
      }
      expect(() => cart.addItem('OneMore', 10, 1)).toThrow();
    });
  });

  describe('removeItem', () => {
    test('should remove existing item', () => {
      cart.addItem('Laptop', 999.99, 1);
      const removed = cart.removeItem('Laptop');
      expect(removed.name).toBe('Laptop');
      expect(cart.isEmpty()).toBe(true);
    });

    test('should throw for item not found', () => {
      expect(() => cart.removeItem('NonExistent')).toThrow('not found in cart');
    });

    test('should throw for invalid name', () => {
      expect(() => cart.removeItem('')).toThrow('Item name must be a non-empty string');
    });

    test('should throw for null name', () => {
      expect(() => cart.removeItem(null)).toThrow('Item name must be a non-empty string');
    });
  });

  describe('updateQuantity', () => {
    test('should update item quantity', () => {
      cart.addItem('Book', 10, 1);
      const updated = cart.updateQuantity('Book', 5);
      expect(updated.quantity).toBe(5);
    });

    test('should remove item when quantity is 0', () => {
      cart.addItem('Book', 10, 1);
      cart.updateQuantity('Book', 0);
      expect(cart.isEmpty()).toBe(true);
    });

    test('should throw for negative quantity', () => {
      cart.addItem('Book', 10, 1);
      expect(() => cart.updateQuantity('Book', -1)).toThrow('Quantity cannot be negative');
    });

    test('should throw for item not found', () => {
      expect(() => cart.updateQuantity('NonExistent', 5)).toThrow('not found in cart');
    });

    test('should throw for non-integer quantity', () => {
      cart.addItem('Book', 10, 1);
      expect(() => cart.updateQuantity('Book', 2.5)).toThrow('Quantity must be an integer');
    });

    test('should throw for invalid name', () => {
      expect(() => cart.updateQuantity(null, 5)).toThrow('Item name must be a non-empty string');
    });
  });

  describe('getItem', () => {
    test('should return item if found', () => {
      cart.addItem('Laptop', 999.99, 1);
      const item = cart.getItem('Laptop');
      expect(item).not.toBeNull();
      expect(item.name).toBe('Laptop');
    });

    test('should return null if not found', () => {
      expect(cart.getItem('NonExistent')).toBeNull();
    });
  });

  describe('getTotalItemCount', () => {
    test('should return 0 for empty cart', () => {
      expect(cart.getTotalItemCount()).toBe(0);
    });

    test('should return sum of all quantities', () => {
      cart.addItem('A', 10, 3);
      cart.addItem('B', 20, 2);
      expect(cart.getTotalItemCount()).toBe(5);
    });
  });

  describe('getUniqueItemCount', () => {
    test('should return number of distinct products', () => {
      cart.addItem('A', 10, 2);
      cart.addItem('B', 20, 1);
      expect(cart.getUniqueItemCount()).toBe(2);
    });
  });

  describe('getSubtotal', () => {
    test('should return 0 for empty cart', () => {
      expect(cart.getSubtotal()).toBe(0);
    });

    test('should calculate subtotal correctly', () => {
      cart.addItem('A', 10, 2);
      cart.addItem('B', 5.50, 4);
      expect(cart.getSubtotal()).toBe(42);
    });

    test('should round to 2 decimal places', () => {
      cart.addItem('A', 0.1, 3);
      expect(cart.getSubtotal()).toBe(0.3);
    });
  });

  describe('isEmpty', () => {
    test('should return true for empty cart', () => {
      expect(cart.isEmpty()).toBe(true);
    });

    test('should return false when cart has items', () => {
      cart.addItem('Laptop', 999.99, 1);
      expect(cart.isEmpty()).toBe(false);
    });
  });

  describe('clear', () => {
    test('should empty the cart', () => {
      cart.addItem('Laptop', 999.99, 1);
      cart.clear();
      expect(cart.isEmpty()).toBe(true);
    });

    test('should reset applied coupon', () => {
      cart.setCoupon('SAVE10');
      cart.clear();
      expect(cart.appliedCoupon).toBeNull();
    });
  });

  describe('setCoupon / removeCoupon', () => {
    test('should set coupon code', () => {
      cart.setCoupon('save10');
      expect(cart.appliedCoupon).toBe('SAVE10');
    });

    test('should throw for empty coupon code', () => {
      expect(() => cart.setCoupon('')).toThrow('Coupon code must be a non-empty string');
    });

    test('should throw for non-string coupon', () => {
      expect(() => cart.setCoupon(null)).toThrow('Coupon code must be a non-empty string');
    });

    test('should remove coupon', () => {
      cart.setCoupon('SAVE10');
      cart.removeCoupon();
      expect(cart.appliedCoupon).toBeNull();
    });
  });

  describe('getItemsSortedBy', () => {
    test('should sort by name ascending', () => {
      cart.addItem('Zebra', 10, 1);
      cart.addItem('Apple', 20, 1);
      const sorted = cart.getItemsSortedBy('name');
      expect(sorted[0].name).toBe('Apple');
    });

    test('should sort by price descending', () => {
      cart.addItem('A', 10, 1);
      cart.addItem('B', 50, 1);
      const sorted = cart.getItemsSortedBy('price', false);
      expect(sorted[0].price).toBe(50);
    });

    test('should throw for invalid field', () => {
      expect(() => cart.getItemsSortedBy('invalid')).toThrow('Invalid sort field');
    });
  });

  describe('getMostExpensiveItem / getCheapestItem', () => {
    test('should return null for empty cart', () => {
      expect(cart.getMostExpensiveItem()).toBeNull();
      expect(cart.getCheapestItem()).toBeNull();
    });

    test('should return most expensive item', () => {
      cart.addItem('A', 10, 1);
      cart.addItem('B', 100, 1);
      expect(cart.getMostExpensiveItem().name).toBe('B');
    });

    test('should return cheapest item', () => {
      cart.addItem('A', 10, 1);
      cart.addItem('B', 100, 1);
      expect(cart.getCheapestItem().name).toBe('A');
    });
  });

  describe('getSummary', () => {
    test('should return complete cart summary', () => {
      cart.addItem('Laptop', 999.99, 1);
      cart.setCoupon('SAVE10');
      const summary = cart.getSummary();
      expect(summary).toHaveProperty('items');
      expect(summary).toHaveProperty('uniqueItems');
      expect(summary).toHaveProperty('totalItems');
      expect(summary).toHaveProperty('subtotal');
      expect(summary.coupon).toBe('SAVE10');
    });
  });
});

// ============================================================
// PricingEngine Tests
// ============================================================

describe('PricingEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new PricingEngine();
  });

  describe('calculateItemTax', () => {
    test('should calculate electronics tax at 19%', () => {
      expect(engine.calculateItemTax(100, 1, 'electronics')).toBe(19);
    });

    test('should calculate clothing tax at 9%', () => {
      expect(engine.calculateItemTax(100, 1, 'clothing')).toBe(9);
    });

    test('should calculate food tax at 5%', () => {
      expect(engine.calculateItemTax(100, 1, 'food')).toBe(5);
    });

    test('should calculate books tax at 5%', () => {
      expect(engine.calculateItemTax(100, 1, 'books')).toBe(5);
    });

    test('should use default rate for unknown category', () => {
      expect(engine.calculateItemTax(100, 1, 'default')).toBe(19);
    });

    test('should use default rate when no category given', () => {
      expect(engine.calculateItemTax(100, 1)).toBe(19);
    });

    test('should handle quantity multiplier', () => {
      expect(engine.calculateItemTax(50, 2, 'electronics')).toBe(19);
    });

    test('should throw for negative price', () => {
      expect(() => engine.calculateItemTax(-1, 1)).toThrow();
    });

    test('should throw for negative quantity', () => {
      expect(() => engine.calculateItemTax(10, -1)).toThrow();
    });
  });

  describe('calculateTotalTax', () => {
    test('should return 0 for empty array', () => {
      expect(engine.calculateTotalTax([])).toBe(0);
    });

    test('should throw if not an array', () => {
      expect(() => engine.calculateTotalTax(null)).toThrow('Cart items must be an array');
    });

    test('should sum tax across multiple items', () => {
      const items = [
        { price: 100, quantity: 1, category: 'electronics' },
        { price: 100, quantity: 1, category: 'food' }
      ];
      expect(engine.calculateTotalTax(items)).toBe(24);
    });
  });

  describe('calculateShipping', () => {
    test('should charge standard shipping for small order', () => {
      expect(engine.calculateShipping(100)).toBe(15);
    });

    test('should return 0 for large order (standard)', () => {
      expect(engine.calculateShipping(300)).toBe(0);
    });

    test('should charge express shipping regardless of subtotal', () => {
      expect(engine.calculateShipping(50, 'express')).toBe(30);
    });

    test('should charge express even for large subtotal', () => {
      expect(engine.calculateShipping(500, 'express')).toBe(30);
    });

    test('should throw for negative subtotal', () => {
      expect(() => engine.calculateShipping(-1)).toThrow();
    });

    test('should throw for invalid shipping type', () => {
      expect(() => engine.calculateShipping(100, 'overnight')).toThrow('Invalid shipping type');
    });
  });

  describe('applyPercentageDiscount', () => {
    test('should calculate discount correctly', () => {
      expect(engine.applyPercentageDiscount(200, 10)).toBe(20);
    });

    test('should return 0 for 0% discount', () => {
      expect(engine.applyPercentageDiscount(200, 0)).toBe(0);
    });

    test('should handle 100% discount', () => {
      expect(engine.applyPercentageDiscount(200, 100)).toBe(200);
    });

    test('should throw for negative amount', () => {
      expect(() => engine.applyPercentageDiscount(-1, 10)).toThrow();
    });

    test('should throw for percentage over 100', () => {
      expect(() => engine.applyPercentageDiscount(200, 101)).toThrow();
    });

    test('should throw for negative percentage', () => {
      expect(() => engine.applyPercentageDiscount(200, -1)).toThrow();
    });
  });

  describe('applyFixedDiscount', () => {
    test('should apply fixed discount', () => {
      expect(engine.applyFixedDiscount(100, 25)).toBe(25);
    });

    test('should cap discount at amount', () => {
      expect(engine.applyFixedDiscount(20, 50)).toBe(20);
    });

    test('should return 0 for 0 discount', () => {
      expect(engine.applyFixedDiscount(100, 0)).toBe(0);
    });

    test('should throw for negative amount', () => {
      expect(() => engine.applyFixedDiscount(-1, 10)).toThrow();
    });

    test('should throw for negative discount', () => {
      expect(() => engine.applyFixedDiscount(100, -5)).toThrow();
    });
  });

  describe('applyBuyXGetYFree', () => {
    test('should return 0 for empty cart', () => {
      expect(engine.applyBuyXGetYFree([], 2, 1)).toBe(0);
    });

    test('should return 0 when not enough items', () => {
      const items = [{ price: 10, quantity: 1 }];
      expect(engine.applyBuyXGetYFree(items, 2, 1)).toBe(0);
    });

    test('should discount cheapest item', () => {
      const items = [
        { price: 30, quantity: 1 },
        { price: 10, quantity: 1 },
        { price: 20, quantity: 1 }
      ];
      expect(engine.applyBuyXGetYFree(items, 2, 1)).toBe(10);
    });

    test('should throw for buyQuantity < 1', () => {
      const items = [{ price: 10, quantity: 3 }];
      expect(() => engine.applyBuyXGetYFree(items, 0, 1)).toThrow();
    });
  });

  describe('getCoupon', () => {
    test('should return valid coupon', () => {
      const coupon = engine.getCoupon('SAVE10');
      expect(coupon.code).toBe('SAVE10');
    });

    test('should be case-insensitive', () => {
      const coupon = engine.getCoupon('save10');
      expect(coupon.code).toBe('SAVE10');
    });

    test('should throw for expired coupon', () => {
      expect(() => engine.getCoupon('SUMMER20')).toThrow();
    });

    test('should throw for used coupon', () => {
      expect(() => engine.getCoupon('USED50')).toThrow();
    });

    test('should throw for non-existent coupon', () => {
      expect(() => engine.getCoupon('FAKE123')).toThrow();
    });

    test('should throw for empty string', () => {
      expect(() => engine.getCoupon('')).toThrow('Coupon code must be a non-empty string');
    });
  });

  describe('applyCoupon', () => {
    test('should apply percentage coupon SAVE10', () => {
      const discount = engine.applyCoupon('SAVE10', 100);
      expect(discount).toBe(10);
    });

    test('should apply fixed coupon FLAT25', () => {
      const discount = engine.applyCoupon('FLAT25', 200);
      expect(discount).toBe(25);
    });

    test('should throw when below minimum order value', () => {
      expect(() => engine.applyCoupon('SAVE10', 30)).toThrow('Minimum order value');
    });

    test('should throw for invalid coupon code', () => {
      expect(() => engine.applyCoupon('INVALID', 100)).toThrow();
    });
  });

  describe('calculateVolumeDiscount', () => {
    test('should return 0 for less than 5 items', () => {
      expect(engine.calculateVolumeDiscount(4, 100)).toBe(0);
    });

    test('should return 2% for 5-9 items', () => {
      expect(engine.calculateVolumeDiscount(5, 100)).toBe(2);
    });

    test('should return 5% for 10-19 items', () => {
      expect(engine.calculateVolumeDiscount(10, 100)).toBe(5);
    });

    test('should return 7% for 20-29 items', () => {
      expect(engine.calculateVolumeDiscount(20, 100)).toBe(7);
    });

    test('should return 10% for 30+ items', () => {
      expect(engine.calculateVolumeDiscount(30, 100)).toBe(10);
    });

    test('should throw for negative values', () => {
      expect(() => engine.calculateVolumeDiscount(-1, 100)).toThrow();
    });
  });

  describe('calculateLoyaltyPoints', () => {
    test('should return 0 for 0 amount', () => {
      expect(engine.calculateLoyaltyPoints(0)).toBe(0);
    });

    test('should return 1 point per 10 RON', () => {
      expect(engine.calculateLoyaltyPoints(50)).toBe(5);
    });

    test('should give bonus for orders over 100', () => {
      expect(engine.calculateLoyaltyPoints(100)).toBe(20);
    });

    test('should give bonus for orders over 200', () => {
      expect(engine.calculateLoyaltyPoints(200)).toBe(40);
    });

    test('should give bonus for orders over 500', () => {
      expect(engine.calculateLoyaltyPoints(500)).toBe(100);
    });

    test('should throw for negative amount', () => {
      expect(() => engine.calculateLoyaltyPoints(-1)).toThrow();
    });
  });

  describe('calculateTotal', () => {
    test('should return zeros for empty cart', () => {
      const cart = new ShoppingCart();
      const result = engine.calculateTotal(cart);
      expect(result.total).toBe(0);
      expect(result.subtotal).toBe(0);
    });

    test('should throw for invalid cart object', () => {
      expect(() => engine.calculateTotal(null)).toThrow('Invalid cart object');
      expect(() => engine.calculateTotal({})).toThrow('Invalid cart object');
    });

    test('should calculate full total with tax and shipping', () => {
      const cart = new ShoppingCart();
      cart.addItem('Book', 50, 1, 'books');
      const result = engine.calculateTotal(cart);
      expect(result.subtotal).toBe(50);
      expect(result.shipping).toBe(15);
      expect(result.total).toBeGreaterThan(50);
    });

    test('should apply coupon discount', () => {
      const cart = new ShoppingCart();
      cart.addItem('Laptop', 500, 1, 'electronics');
      cart.setCoupon('SAVE10');
      const result = engine.calculateTotal(cart);
      expect(result.couponDiscount).toBeGreaterThan(0);
    });

    test('should apply free shipping for large orders', () => {
      const cart = new ShoppingCart();
      cart.addItem('TV', 300, 1, 'electronics');
      const result = engine.calculateTotal(cart);
      expect(result.shipping).toBe(0);
    });

    test('should calculate volume discount for many items', () => {
      const cart = new ShoppingCart();
      cart.addItem('Pen', 2, 10, 'books');
      const result = engine.calculateTotal(cart);
      expect(result.volumeDiscount).toBeGreaterThan(0);
    });
  });
});
