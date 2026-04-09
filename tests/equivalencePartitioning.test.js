const ShoppingCart = require('../src/ShoppingCart');
const PricingEngine = require('../src/PricingEngine');
const { SAMPLE_COUPONS } = require('../src/utils/constants');

describe('Equivalence Partitioning Tests', () => {
  let cart;
  let engine;

  beforeEach(() => {
    cart = new ShoppingCart();
    engine = new PricingEngine();
  });

  // ==================== ShoppingCart Tests ====================

  describe('EC1-EC3: Item Name Validation', () => {
    test('EC1: Valid name - non-empty string', () => {
      const item = cart.addItem('Laptop', 999.99, 1, 'electronics');
      expect(item.name).toBe('Laptop');
    });

    test('EC2: Invalid name - empty string', () => {
      expect(() => cart.addItem('', 10, 1)).toThrow('Item name must be a non-empty string');
    });

    test('EC3: Invalid name - non-string type (number)', () => {
      expect(() => cart.addItem(123, 10, 1)).toThrow('Item name must be a non-empty string');
    });

    test('EC3b: Invalid name - null', () => {
      expect(() => cart.addItem(null, 10, 1)).toThrow('Item name must be a non-empty string');
    });

    test('EC3c: Invalid name - whitespace only', () => {
      expect(() => cart.addItem('   ', 10, 1)).toThrow('Item name must be a non-empty string');
    });
  });

  describe('EC4-EC6: Price Validation', () => {
    test('EC4: Valid price - within range', () => {
      const item = cart.addItem('Book', 29.99, 1, 'books');
      expect(item.price).toBe(29.99);
    });

    test('EC5: Invalid price - below minimum (0)', () => {
      expect(() => cart.addItem('Book', 0, 1)).toThrow('Price must be at least');
    });

    test('EC5b: Invalid price - negative', () => {
      expect(() => cart.addItem('Book', -5, 1)).toThrow('Price must be at least');
    });

    test('EC6: Invalid price - above maximum', () => {
      expect(() => cart.addItem('Book', 1000000, 1)).toThrow('Price cannot exceed');
    });

    test('EC6b: Invalid price - not a number', () => {
      expect(() => cart.addItem('Book', 'abc', 1)).toThrow('Price must be a valid number');
    });

    test('EC6c: Invalid price - NaN', () => {
      expect(() => cart.addItem('Book', NaN, 1)).toThrow('Price must be a valid number');
    });
  });

  describe('EC7-EC9: Quantity Validation', () => {
    test('EC7: Valid quantity - within range', () => {
      const item = cart.addItem('Pen', 2.50, 10);
      expect(item.quantity).toBe(10);
    });

    test('EC8: Invalid quantity - zero', () => {
      expect(() => cart.addItem('Pen', 2.50, 0)).toThrow('Quantity must be greater than zero');
    });

    test('EC8b: Invalid quantity - negative', () => {
      expect(() => cart.addItem('Pen', 2.50, -1)).toThrow('Quantity must be greater than zero');
    });

    test('EC9: Invalid quantity - exceeds per-item limit', () => {
      expect(() => cart.addItem('Pen', 2.50, 51)).toThrow('Quantity cannot exceed');
    });

    test('EC9b: Invalid quantity - not an integer', () => {
      expect(() => cart.addItem('Pen', 2.50, 2.5)).toThrow('Quantity must be an integer');
    });

    test('EC9c: Invalid quantity - string', () => {
      expect(() => cart.addItem('Pen', 2.50, 'five')).toThrow('Quantity must be an integer');
    });
  });

  describe('EC10: Category Validation', () => {
    test('EC10a: Valid category - electronics', () => {
      const item = cart.addItem('Phone', 500, 1, 'electronics');
      expect(item.category).toBe('electronics');
    });

    test('EC10b: Valid category - clothing', () => {
      const item = cart.addItem('Shirt', 30, 1, 'clothing');
      expect(item.category).toBe('clothing');
    });

    test('EC10c: Valid category - food', () => {
      const item = cart.addItem('Apple', 2, 5, 'food');
      expect(item.category).toBe('food');
    });

    test('EC10d: Valid category - books', () => {
      const item = cart.addItem('Novel', 15, 1, 'books');
      expect(item.category).toBe('books');
    });

    test('EC10e: Valid category - null (no category)', () => {
      const item = cart.addItem('Widget', 10, 1, null);
      expect(item.category).toBeNull();
    });

    test('EC10f: Invalid category', () => {
      expect(() => cart.addItem('Thing', 10, 1, 'toys')).toThrow('Invalid category');
    });
  });

  describe('EC11: Cart Operations', () => {
    test('EC11a: Add and retrieve item', () => {
      cart.addItem('Laptop', 1000, 1, 'electronics');
      const item = cart.getItem('Laptop');
      expect(item).not.toBeNull();
      expect(item.name).toBe('Laptop');
    });

    test('EC11b: Add duplicate item updates quantity', () => {
      cart.addItem('Laptop', 1000, 1, 'electronics');
      cart.addItem('Laptop', 1000, 2, 'electronics');
      const item = cart.getItem('Laptop');
      expect(item.quantity).toBe(3);
    });

    test('EC11c: Remove existing item', () => {
      cart.addItem('Laptop', 1000, 1, 'electronics');
      const removed = cart.removeItem('Laptop');
      expect(removed.name).toBe('Laptop');
      expect(cart.isEmpty()).toBe(true);
    });

    test('EC11d: Remove non-existing item throws', () => {
      expect(() => cart.removeItem('Ghost')).toThrow('not found in cart');
    });

    test('EC11e: Update quantity of existing item', () => {
      cart.addItem('Laptop', 1000, 1, 'electronics');
      cart.updateQuantity('Laptop', 5);
      expect(cart.getItem('Laptop').quantity).toBe(5);
    });

    test('EC11f: Update quantity to 0 removes item', () => {
      cart.addItem('Laptop', 1000, 1, 'electronics');
      cart.updateQuantity('Laptop', 0);
      expect(cart.isEmpty()).toBe(true);
    });

    test('EC11g: Clear cart', () => {
      cart.addItem('A', 10, 1);
      cart.addItem('B', 20, 2);
      cart.setCoupon('SAVE10');
      cart.clear();
      expect(cart.isEmpty()).toBe(true);
      expect(cart.appliedCoupon).toBeNull();
    });
  });

  // ==================== PricingEngine Tests ====================

  describe('EC12: Coupon Validation', () => {
    test('EC12a: Valid coupon - SAVE10', () => {
      const coupon = engine.getCoupon('SAVE10');
      expect(coupon.code).toBe('SAVE10');
    });

    test('EC12b: Expired coupon - SUMMER20', () => {
      expect(() => engine.getCoupon('SUMMER20')).toThrow('expired');
    });

    test('EC12c: Used coupon - USED50', () => {
      expect(() => engine.getCoupon('USED50')).toThrow('already been used');
    });

    test('EC12d: Non-existent coupon', () => {
      expect(() => engine.getCoupon('FAKECODE')).toThrow('not found');
    });

    test('EC12e: Invalid coupon code type', () => {
      expect(() => engine.getCoupon(null)).toThrow('non-empty string');
    });

    test('EC12f: Coupon with minimum order value not met', () => {
      expect(() => engine.applyCoupon('SAVE10', 30)).toThrow('Minimum order value');
    });

    test('EC12g: Coupon with minimum order value met', () => {
      const discount = engine.applyCoupon('SAVE10', 100);
      expect(discount).toBe(10); // 10% of 100
    });
  });

  describe('EC13: Shipping Calculation', () => {
    test('EC13a: Standard shipping below threshold', () => {
      const cost = engine.calculateShipping(100);
      expect(cost).toBe(15);
    });

    test('EC13b: Free standard shipping above threshold', () => {
      const cost = engine.calculateShipping(250);
      expect(cost).toBe(0);
    });

    test('EC13c: Express shipping (always charged)', () => {
      const cost = engine.calculateShipping(250, 'express');
      expect(cost).toBe(30);
    });

    test('EC13d: Invalid shipping type', () => {
      expect(() => engine.calculateShipping(100, 'overnight')).toThrow('Invalid shipping type');
    });

    test('EC13e: Negative subtotal', () => {
      expect(() => engine.calculateShipping(-10)).toThrow('non-negative');
    });
  });

  describe('EC14: Volume Discount Tiers', () => {
    test('EC14a: No discount (< 5 items)', () => {
      const discount = engine.calculateVolumeDiscount(3, 100);
      expect(discount).toBe(0);
    });

    test('EC14b: 2% discount (5-9 items)', () => {
      const discount = engine.calculateVolumeDiscount(7, 100);
      expect(discount).toBe(2);
    });

    test('EC14c: 5% discount (10-19 items)', () => {
      const discount = engine.calculateVolumeDiscount(15, 100);
      expect(discount).toBe(5);
    });

    test('EC14d: 7% discount (20-29 items)', () => {
      const discount = engine.calculateVolumeDiscount(25, 100);
      expect(discount).toBe(7);
    });

    test('EC14e: 10% discount (30+ items)', () => {
      const discount = engine.calculateVolumeDiscount(35, 100);
      expect(discount).toBe(10);
    });
  });

  describe('EC15: Tax Calculation by Category', () => {
    test('EC15a: Electronics tax (19%)', () => {
      const tax = engine.calculateItemTax(100, 1, 'electronics');
      expect(tax).toBe(19);
    });

    test('EC15b: Clothing tax (9%)', () => {
      const tax = engine.calculateItemTax(100, 1, 'clothing');
      expect(tax).toBe(9);
    });

    test('EC15c: Food tax (5%)', () => {
      const tax = engine.calculateItemTax(100, 1, 'food');
      expect(tax).toBe(5);
    });

    test('EC15d: Books tax (5%)', () => {
      const tax = engine.calculateItemTax(100, 1, 'books');
      expect(tax).toBe(5);
    });

    test('EC15e: Default tax (19%)', () => {
      const tax = engine.calculateItemTax(100, 1, 'other');
      expect(tax).toBe(19);
    });

    test('EC15f: Invalid price for tax', () => {
      expect(() => engine.calculateItemTax(-1, 1)).toThrow('non-negative');
    });

    test('EC15g: Invalid quantity for tax', () => {
      expect(() => engine.calculateItemTax(10, -1)).toThrow('non-negative');
    });
  });

  describe('Loyalty Points', () => {
    test('No bonus points (total < 100)', () => {
      const points = engine.calculateLoyaltyPoints(50);
      expect(points).toBe(5); // 50/10 = 5
    });

    test('10 bonus points (100 <= total < 200)', () => {
      const points = engine.calculateLoyaltyPoints(150);
      expect(points).toBe(25); // 15 + 10
    });

    test('20 bonus points (200 <= total < 500)', () => {
      const points = engine.calculateLoyaltyPoints(300);
      expect(points).toBe(50); // 30 + 20
    });

    test('50 bonus points (total >= 500)', () => {
      const points = engine.calculateLoyaltyPoints(500);
      expect(points).toBe(100); // 50 + 50
    });

    test('Invalid amount', () => {
      expect(() => engine.calculateLoyaltyPoints(-10)).toThrow('non-negative');
    });
  });
});
