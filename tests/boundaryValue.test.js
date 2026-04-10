const ShoppingCart = require('../src/ShoppingCart');
const PricingEngine = require('../src/PricingEngine');
const { CART_LIMITS, SHIPPING } = require('../src/utils/constants');

describe('Boundary Value Analysis Tests', () => {
  let cart;
  let engine;

  beforeEach(() => {
    cart = new ShoppingCart();
    engine = new PricingEngine();
  });

  // ==================== Price Boundaries ====================

  describe('BVA - Price Boundaries', () => {
    test('Price at MIN_PRICE (0.01) - valid', () => {
      const item = cart.addItem('Cheap', 0.01, 1);
      expect(item.price).toBe(0.01);
    });

    test('Price just below MIN_PRICE (0.009) - invalid', () => {
      expect(() => cart.addItem('TooLow', 0.009, 1)).toThrow('Price must be at least');
    });

    test('Price at 0 - invalid', () => {
      expect(() => cart.addItem('Free', 0, 1)).toThrow('Price must be at least');
    });

    test('Price just above MIN_PRICE (0.02) - valid', () => {
      const item = cart.addItem('AlmostCheap', 0.02, 1);
      expect(item.price).toBe(0.02);
    });

    test('Price at MAX_PRICE (999999.99) - valid', () => {
      const item = cart.addItem('Expensive', 999999.99, 1);
      expect(item.price).toBe(999999.99);
    });

    test('Price just above MAX_PRICE (1000000) - invalid', () => {
      expect(() => cart.addItem('TooExpensive', 1000000, 1)).toThrow('Price cannot exceed');
    });

    test('Price just below MAX_PRICE (999999.98) - valid', () => {
      const item = cart.addItem('AlmostMax', 999999.98, 1);
      expect(item.price).toBe(999999.98);
    });
  });

  // ==================== Quantity Boundaries ====================

  describe('BVA - Quantity Boundaries', () => {
    test('Quantity at minimum (1) - valid', () => {
      const item = cart.addItem('Item', 10, 1);
      expect(item.quantity).toBe(1);
    });

    test('Quantity at 0 - invalid', () => {
      expect(() => cart.addItem('Item', 10, 0)).toThrow('Quantity must be greater than zero');
    });

    test('Quantity at -1 - invalid', () => {
      expect(() => cart.addItem('Item', 10, -1)).toThrow('Quantity must be greater than zero');
    });

    test('Quantity at MAX_QUANTITY_PER_ITEM (50) - valid', () => {
      const item = cart.addItem('Item', 10, 50);
      expect(item.quantity).toBe(50);
    });

    test('Quantity at MAX_QUANTITY_PER_ITEM + 1 (51) - invalid', () => {
      expect(() => cart.addItem('Item', 10, 51)).toThrow('Quantity cannot exceed');
    });

    test('Quantity at MAX_QUANTITY_PER_ITEM - 1 (49) - valid', () => {
      const item = cart.addItem('Item', 10, 49);
      expect(item.quantity).toBe(49);
    });
  });

  // ==================== Cart Capacity Boundaries ====================

  describe('BVA - Cart Capacity Boundaries', () => {
    test('Cart at MAX_ITEMS (100) - valid', () => {
      cart.addItem('Bulk', 1, 50);
      cart.addItem('Bulk2', 1, 50);
      expect(cart.getTotalItemCount()).toBe(100);
    });

    test('Cart exceeding MAX_ITEMS (101) - invalid', () => {
      cart.addItem('Bulk', 1, 50);
      cart.addItem('Bulk2', 1, 50);
      expect(() => cart.addItem('Extra', 1, 1)).toThrow('Cart limit');
    });

    test('Cart at MAX_ITEMS - 1 (99) - valid, can add 1 more', () => {
      cart.addItem('Bulk', 1, 50);
      cart.addItem('Bulk2', 1, 49);
      const item = cart.addItem('LastOne', 1, 1);
      expect(item.name).toBe('LastOne');
      expect(cart.getTotalItemCount()).toBe(100);
    });

    test('Adding item that would exceed capacity', () => {
      cart.addItem('Bulk', 1, 50);
      cart.addItem('Bulk2', 1, 45);
      expect(() => cart.addItem('TooMany', 1, 10)).toThrow('Cart limit');
    });
  });

  // ==================== UpdateQuantity Boundaries ====================

  describe('BVA - UpdateQuantity Boundaries', () => {
    test('Update to 0 removes item', () => {
      cart.addItem('Item', 10, 5);
      cart.updateQuantity('Item', 0);
      expect(cart.isEmpty()).toBe(true);
    });

    test('Update to -1 throws error', () => {
      cart.addItem('Item', 10, 5);
      expect(() => cart.updateQuantity('Item', -1)).toThrow('cannot be negative');
    });

    test('Update to 1 - valid', () => {
      cart.addItem('Item', 10, 5);
      const updated = cart.updateQuantity('Item', 1);
      expect(updated.quantity).toBe(1);
    });

    test('Update to MAX_QUANTITY_PER_ITEM (50) - valid', () => {
      cart.addItem('Item', 10, 1);
      const updated = cart.updateQuantity('Item', 50);
      expect(updated.quantity).toBe(50);
    });

    test('Update to MAX_QUANTITY_PER_ITEM + 1 (51) - invalid', () => {
      cart.addItem('Item', 10, 1);
      expect(() => cart.updateQuantity('Item', 51)).toThrow('Quantity cannot exceed');
    });

    test('Update non-existent item throws', () => {
      expect(() => cart.updateQuantity('Ghost', 5)).toThrow('not found');
    });
  });

  // ==================== Shipping Threshold Boundaries ====================

  describe('BVA - Free Shipping Threshold', () => {
    test('Subtotal exactly at threshold (200) - free shipping', () => {
      const cost = engine.calculateShipping(200);
      expect(cost).toBe(0);
    });

    test('Subtotal just below threshold (199.99) - standard cost', () => {
      const cost = engine.calculateShipping(199.99);
      expect(cost).toBe(15);
    });

    test('Subtotal just above threshold (200.01) - free shipping', () => {
      const cost = engine.calculateShipping(200.01);
      expect(cost).toBe(0);
    });

    test('Subtotal at 0 - standard cost', () => {
      const cost = engine.calculateShipping(0);
      expect(cost).toBe(15);
    });

    test('Express shipping at threshold - still charged', () => {
      const cost = engine.calculateShipping(200, 'express');
      expect(cost).toBe(30);
    });

    test('Express shipping above threshold - still charged', () => {
      const cost = engine.calculateShipping(500, 'express');
      expect(cost).toBe(30);
    });
  });

  // ==================== Percentage Discount Boundaries ====================

  describe('BVA - Percentage Discount Boundaries', () => {
    test('0% discount', () => {
      const discount = engine.applyPercentageDiscount(100, 0);
      expect(discount).toBe(0);
    });

    test('100% discount', () => {
      const discount = engine.applyPercentageDiscount(100, 100);
      expect(discount).toBe(100);
    });

    test('Negative percentage - invalid', () => {
      expect(() => engine.applyPercentageDiscount(100, -1)).toThrow('between 0 and 100');
    });

    test('Over 100% - invalid', () => {
      expect(() => engine.applyPercentageDiscount(100, 101)).toThrow('between 0 and 100');
    });

    test('1% discount', () => {
      const discount = engine.applyPercentageDiscount(100, 1);
      expect(discount).toBe(1);
    });

    test('99% discount', () => {
      const discount = engine.applyPercentageDiscount(100, 99);
      expect(discount).toBe(99);
    });

    test('Negative amount - invalid', () => {
      expect(() => engine.applyPercentageDiscount(-10, 10)).toThrow('non-negative');
    });
  });

  // ==================== Fixed Discount Boundaries ====================

  describe('BVA - Fixed Discount Boundaries', () => {
    test('Discount equal to amount', () => {
      const discount = engine.applyFixedDiscount(50, 50);
      expect(discount).toBe(50);
    });

    test('Discount greater than amount (capped)', () => {
      const discount = engine.applyFixedDiscount(50, 100);
      expect(discount).toBe(50); // capped at amount
    });

    test('Discount of 0', () => {
      const discount = engine.applyFixedDiscount(50, 0);
      expect(discount).toBe(0);
    });

    test('Discount just below amount', () => {
      const discount = engine.applyFixedDiscount(50, 49.99);
      expect(discount).toBe(49.99);
    });

    test('Amount of 0', () => {
      const discount = engine.applyFixedDiscount(0, 25);
      expect(discount).toBe(0); // capped at 0
    });

    test('Negative discount - invalid', () => {
      expect(() => engine.applyFixedDiscount(50, -5)).toThrow('non-negative');
    });

    test('Negative amount - invalid', () => {
      expect(() => engine.applyFixedDiscount(-10, 5)).toThrow('non-negative');
    });
  });

  // ==================== Volume Discount Tier Boundaries ====================

  describe('BVA - Volume Discount Tier Boundaries', () => {
    test('4 items - no discount', () => {
      expect(engine.calculateVolumeDiscount(4, 200)).toBe(0);
    });

    test('5 items - 2% discount', () => {
      expect(engine.calculateVolumeDiscount(5, 200)).toBe(4);
    });

    test('9 items - still 2%', () => {
      expect(engine.calculateVolumeDiscount(9, 200)).toBe(4);
    });

    test('10 items - 5% discount', () => {
      expect(engine.calculateVolumeDiscount(10, 200)).toBe(10);
    });

    test('19 items - still 5%', () => {
      expect(engine.calculateVolumeDiscount(19, 200)).toBe(10);
    });

    test('20 items - 7% discount', () => {
      expect(engine.calculateVolumeDiscount(20, 200)).toBe(14);
    });

    test('29 items - still 7%', () => {
      expect(engine.calculateVolumeDiscount(29, 200)).toBe(14);
    });

    test('30 items - 10% discount', () => {
      expect(engine.calculateVolumeDiscount(30, 200)).toBe(20);
    });

    test('0 items - no discount', () => {
      expect(engine.calculateVolumeDiscount(0, 200)).toBe(0);
    });
  });

  // ==================== Loyalty Points Bonus Thresholds ====================

  describe('BVA - Loyalty Points Bonus Thresholds', () => {
    test('Total 99.99 - no bonus', () => {
      const points = engine.calculateLoyaltyPoints(99.99);
      expect(points).toBe(9); // floor(99.99/10) = 9, no bonus
    });

    test('Total 100 - 10 bonus', () => {
      const points = engine.calculateLoyaltyPoints(100);
      expect(points).toBe(20); // 10 + 10
    });

    test('Total 199.99 - still 10 bonus', () => {
      const points = engine.calculateLoyaltyPoints(199.99);
      expect(points).toBe(29); // 19 + 10
    });

    test('Total 200 - 20 bonus', () => {
      const points = engine.calculateLoyaltyPoints(200);
      expect(points).toBe(40); // 20 + 20
    });

    test('Total 499.99 - still 20 bonus', () => {
      const points = engine.calculateLoyaltyPoints(499.99);
      expect(points).toBe(69); // 49 + 20
    });

    test('Total 500 - 50 bonus', () => {
      const points = engine.calculateLoyaltyPoints(500);
      expect(points).toBe(100); // 50 + 50
    });

    test('Total 0 - no points', () => {
      const points = engine.calculateLoyaltyPoints(0);
      expect(points).toBe(0);
    });
  });

  // ==================== Buy X Get Y Free Boundaries ====================

  describe('BVA - Buy-X-Get-Y-Free Boundaries', () => {
    test('Exactly enough items for one set (buy 2 get 1)', () => {
      const items = [{ price: 30, quantity: 3 }];
      const discount = engine.applyBuyXGetYFree(items, 2, 1);
      expect(discount).toBe(30); // cheapest item free
    });

    test('One item short of qualifying', () => {
      const items = [{ price: 30, quantity: 2 }];
      const discount = engine.applyBuyXGetYFree(items, 2, 1);
      expect(discount).toBe(0);
    });

    test('Exactly enough for two sets', () => {
      const items = [{ price: 20, quantity: 6 }];
      const discount = engine.applyBuyXGetYFree(items, 2, 1);
      expect(discount).toBe(40); // 2 free items at 20 each
    });

    test('Empty cart returns 0', () => {
      const discount = engine.applyBuyXGetYFree([], 2, 1);
      expect(discount).toBe(0);
    });

    test('Multiple items with different prices', () => {
      const items = [
        { price: 10, quantity: 1 },
        { price: 20, quantity: 1 },
        { price: 30, quantity: 1 }
      ];
      const discount = engine.applyBuyXGetYFree(items, 2, 1);
      expect(discount).toBe(10); // cheapest one free
    });

    test('Invalid buy quantity', () => {
      const items = [{ price: 10, quantity: 3 }];
      expect(() => engine.applyBuyXGetYFree(items, 0, 1)).toThrow('at least 1');
    });

    test('Invalid free quantity', () => {
      const items = [{ price: 10, quantity: 3 }];
      expect(() => engine.applyBuyXGetYFree(items, 2, 0)).toThrow('at least 1');
    });
  });
});
