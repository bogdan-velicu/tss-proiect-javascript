const ShoppingCart = require('../src/ShoppingCart');
const PricingEngine = require('../src/PricingEngine');
const { validateItem, roundToTwo, validateCoupon } = require('../src/utils/validators');
const { CART_LIMITS } = require('../src/utils/constants');

describe('Statement and Branch Coverage Tests', () => {
  let cart;
  let engine;

  beforeEach(() => {
    cart = new ShoppingCart();
    engine = new PricingEngine();
  });

  // ==================== ShoppingCart Coverage ====================

  describe('ShoppingCart - getItem', () => {
    test('returns item when found', () => {
      cart.addItem('Laptop', 999, 1, 'electronics');
      const item = cart.getItem('Laptop');
      expect(item).not.toBeNull();
      expect(item.name).toBe('Laptop');
    });

    test('returns null when not found', () => {
      const item = cart.getItem('NonExistent');
      expect(item).toBeNull();
    });
  });

  describe('ShoppingCart - isEmpty', () => {
    test('returns true for empty cart', () => {
      expect(cart.isEmpty()).toBe(true);
    });

    test('returns false for non-empty cart', () => {
      cart.addItem('Item', 10, 1);
      expect(cart.isEmpty()).toBe(false);
    });
  });

  describe('ShoppingCart - getSubtotal', () => {
    test('returns 0 for empty cart', () => {
      expect(cart.getSubtotal()).toBe(0);
    });

    test('calculates subtotal correctly for single item', () => {
      cart.addItem('Item', 25, 4);
      expect(cart.getSubtotal()).toBe(100);
    });

    test('calculates subtotal correctly for multiple items', () => {
      cart.addItem('A', 10, 2);
      cart.addItem('B', 20, 3);
      expect(cart.getSubtotal()).toBe(80); // 20 + 60
    });
  });

  describe('ShoppingCart - setCoupon / removeCoupon', () => {
    test('sets coupon code (uppercased and trimmed)', () => {
      cart.setCoupon('  save10  ');
      expect(cart.appliedCoupon).toBe('SAVE10');
    });

    test('throws for invalid coupon code', () => {
      expect(() => cart.setCoupon('')).toThrow('non-empty string');
      expect(() => cart.setCoupon(null)).toThrow('non-empty string');
      expect(() => cart.setCoupon(123)).toThrow('non-empty string');
    });

    test('removeCoupon clears the coupon', () => {
      cart.setCoupon('SAVE10');
      cart.removeCoupon();
      expect(cart.appliedCoupon).toBeNull();
    });
  });

  describe('ShoppingCart - getSummary', () => {
    test('returns correct summary for empty cart', () => {
      const summary = cart.getSummary();
      expect(summary.items).toEqual([]);
      expect(summary.uniqueItems).toBe(0);
      expect(summary.totalItems).toBe(0);
      expect(summary.subtotal).toBe(0);
      expect(summary.coupon).toBeNull();
    });

    test('returns correct summary with items and coupon', () => {
      cart.addItem('Laptop', 500, 2, 'electronics');
      cart.addItem('Book', 15, 1, 'books');
      cart.setCoupon('SAVE10');

      const summary = cart.getSummary();
      expect(summary.uniqueItems).toBe(2);
      expect(summary.totalItems).toBe(3);
      expect(summary.subtotal).toBe(1015);
      expect(summary.coupon).toBe('SAVE10');
      expect(summary.items).toHaveLength(2);
    });

    test('summary items are copies (not references)', () => {
      cart.addItem('Item', 10, 1);
      const summary = cart.getSummary();
      summary.items[0].price = 999;
      expect(cart.getItem('Item').price).toBe(10); // original unchanged
    });
  });

  describe('ShoppingCart - getUniqueItemCount', () => {
    test('returns 0 for empty cart', () => {
      expect(cart.getUniqueItemCount()).toBe(0);
    });

    test('returns correct count', () => {
      cart.addItem('A', 10, 1);
      cart.addItem('B', 20, 5);
      cart.addItem('C', 30, 3);
      expect(cart.getUniqueItemCount()).toBe(3);
    });
  });

  describe('ShoppingCart - getItemsSortedBy', () => {
    beforeEach(() => {
      cart.addItem('Banana', 3, 10, 'food');
      cart.addItem('Apple', 2, 5, 'food');
      cart.addItem('Cherry', 5, 1, 'food');
    });

    test('sort by name ascending', () => {
      const sorted = cart.getItemsSortedBy('name', true);
      expect(sorted[0].name).toBe('Apple');
      expect(sorted[2].name).toBe('Cherry');
    });

    test('sort by name descending', () => {
      const sorted = cart.getItemsSortedBy('name', false);
      expect(sorted[0].name).toBe('Cherry');
      expect(sorted[2].name).toBe('Apple');
    });

    test('sort by price ascending', () => {
      const sorted = cart.getItemsSortedBy('price', true);
      expect(sorted[0].price).toBe(2);
      expect(sorted[2].price).toBe(5);
    });

    test('sort by price descending', () => {
      const sorted = cart.getItemsSortedBy('price', false);
      expect(sorted[0].price).toBe(5);
      expect(sorted[2].price).toBe(2);
    });

    test('sort by quantity', () => {
      const sorted = cart.getItemsSortedBy('quantity', true);
      expect(sorted[0].quantity).toBe(1);
      expect(sorted[2].quantity).toBe(10);
    });

    test('invalid sort field throws', () => {
      expect(() => cart.getItemsSortedBy('weight')).toThrow('Invalid sort field');
    });

    test('sort does not mutate original array', () => {
      const originalFirst = cart.items[0].name;
      cart.getItemsSortedBy('name', true);
      expect(cart.items[0].name).toBe(originalFirst);
    });
  });

  describe('ShoppingCart - getMostExpensiveItem', () => {
    test('returns null for empty cart', () => {
      expect(cart.getMostExpensiveItem()).toBeNull();
    });

    test('returns most expensive item', () => {
      cart.addItem('Cheap', 5, 1);
      cart.addItem('Expensive', 500, 1);
      cart.addItem('Mid', 50, 1);
      const item = cart.getMostExpensiveItem();
      expect(item.name).toBe('Expensive');
    });

    test('returns first item when all same price', () => {
      cart.addItem('A', 10, 1);
      cart.addItem('B', 10, 1);
      const item = cart.getMostExpensiveItem();
      expect(item.name).toBe('A');
    });
  });

  describe('ShoppingCart - getCheapestItem', () => {
    test('returns null for empty cart', () => {
      expect(cart.getCheapestItem()).toBeNull();
    });

    test('returns cheapest item', () => {
      cart.addItem('Cheap', 5, 1);
      cart.addItem('Expensive', 500, 1);
      cart.addItem('Mid', 50, 1);
      const item = cart.getCheapestItem();
      expect(item.name).toBe('Cheap');
    });
  });

  describe('ShoppingCart - removeItem edge cases', () => {
    test('throws for invalid name type', () => {
      expect(() => cart.removeItem(null)).toThrow('non-empty string');
      expect(() => cart.removeItem(123)).toThrow('non-empty string');
      expect(() => cart.removeItem('')).toThrow('non-empty string');
    });
  });

  describe('ShoppingCart - updateQuantity edge cases', () => {
    test('throws for invalid name', () => {
      expect(() => cart.updateQuantity(null, 5)).toThrow('non-empty string');
      expect(() => cart.updateQuantity('', 5)).toThrow('non-empty string');
    });

    test('throws for non-integer quantity', () => {
      cart.addItem('Item', 10, 1);
      expect(() => cart.updateQuantity('Item', 2.5)).toThrow('must be an integer');
      expect(() => cart.updateQuantity('Item', 'five')).toThrow('must be an integer');
    });

    test('throws when update would exceed cart limit', () => {
      cart.addItem('A', 1, 50);
      cart.addItem('B', 1, 40);
      cart.addItem('C', 1, 5);
      // Try updating C to a value that would push total over 100
      expect(() => cart.updateQuantity('C', 15)).toThrow('exceed cart limit');
    });
  });

  // ==================== PricingEngine Coverage ====================

  describe('PricingEngine - calculateTotalTax', () => {
    test('throws for non-array input', () => {
      expect(() => engine.calculateTotalTax('not an array')).toThrow('must be an array');
    });

    test('calculates total tax across mixed categories', () => {
      const items = [
        { price: 100, quantity: 1, category: 'electronics' }, // 19
        { price: 100, quantity: 1, category: 'food' },        // 5
        { price: 100, quantity: 1, category: 'clothing' }     // 9
      ];
      const tax = engine.calculateTotalTax(items);
      expect(tax).toBe(33);
    });

    test('empty array returns 0', () => {
      expect(engine.calculateTotalTax([])).toBe(0);
    });
  });

  describe('PricingEngine - calculateTotal branch coverage', () => {
    test('empty cart returns all zeros', () => {
      const result = engine.calculateTotal(cart);
      expect(result.subtotal).toBe(0);
      expect(result.total).toBe(0);
      expect(result.discount).toBe(0);
      expect(result.loyaltyPoints).toBe(0);
    });

    test('invalid cart object throws', () => {
      expect(() => engine.calculateTotal(null)).toThrow('Invalid cart object');
      expect(() => engine.calculateTotal({})).toThrow('Invalid cart object');
    });

    test('cart with items but no coupon', () => {
      cart.addItem('Laptop', 500, 2, 'electronics');
      const result = engine.calculateTotal(cart);
      expect(result.subtotal).toBe(1000);
      expect(result.couponDiscount).toBe(0);
      expect(result.total).toBeGreaterThan(0);
    });

    test('cart with valid coupon applied', () => {
      cart.addItem('Item', 100, 1, 'electronics');
      cart.setCoupon('SAVE10');
      const result = engine.calculateTotal(cart);
      expect(result.couponDiscount).toBeGreaterThan(0);
    });

    test('cart with invalid/expired coupon (silently ignored)', () => {
      cart.addItem('Item', 100, 1, 'electronics');
      cart.setCoupon('SUMMER20'); // expired
      const result = engine.calculateTotal(cart);
      expect(result.couponDiscount).toBe(0);
    });

    test('cart with volume discount (5+ items)', () => {
      cart.addItem('Item', 20, 10, 'electronics');
      const result = engine.calculateTotal(cart);
      expect(result.volumeDiscount).toBeGreaterThan(0);
    });

    test('cart with coupon that does not meet min order', () => {
      cart.addItem('Item', 5, 1, 'electronics');
      cart.setCoupon('SAVE10'); // min 50
      const result = engine.calculateTotal(cart);
      expect(result.couponDiscount).toBe(0); // silently skipped
    });

    test('cart total includes shipping for small orders', () => {
      cart.addItem('Item', 10, 1, 'electronics');
      const result = engine.calculateTotal(cart);
      expect(result.shipping).toBe(15);
    });

    test('cart total has free shipping for large orders', () => {
      cart.addItem('Item', 300, 1, 'electronics');
      const result = engine.calculateTotal(cart);
      expect(result.shipping).toBe(0);
    });

    test('savings equals total discount', () => {
      cart.addItem('Item', 20, 10, 'electronics');
      const result = engine.calculateTotal(cart);
      expect(result.savings).toBe(result.discount);
    });
  });

  // ==================== Utility Functions Coverage ====================

  describe('Utility Functions - roundToTwo', () => {
    test('rounds to 2 decimal places', () => {
      expect(roundToTwo(1.005)).toBe(1.01);
      expect(roundToTwo(1.004)).toBe(1);
      expect(roundToTwo(10)).toBe(10);
      expect(roundToTwo(0.1 + 0.2)).toBeCloseTo(0.3, 2);
    });
  });

  describe('Utility Functions - validateCoupon', () => {
    test('null coupon is invalid', () => {
      const result = validateCoupon(null);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Coupon not found');
    });

    test('expired coupon is invalid', () => {
      const result = validateCoupon({ isExpired: true, isUsed: false });
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('expired');
    });

    test('used coupon is invalid', () => {
      const result = validateCoupon({ isExpired: false, isUsed: true });
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('already been used');
    });

    test('valid coupon returns valid: true', () => {
      const result = validateCoupon({ isExpired: false, isUsed: false });
      expect(result.valid).toBe(true);
      expect(result.reason).toBeNull();
    });
  });

  describe('Utility Functions - validateItem', () => {
    test('valid item returns true', () => {
      expect(validateItem('Test', 10, 1, 'electronics')).toBe(true);
    });

    test('valid item without category returns true', () => {
      expect(validateItem('Test', 10, 1, null)).toBe(true);
    });
  });

  describe('PricingEngine - applyCoupon with fixed type', () => {
    test('applies FLAT25 coupon correctly', () => {
      const discount = engine.applyCoupon('FLAT25', 150);
      expect(discount).toBe(25);
    });
  });

  describe('PricingEngine - getCoupon edge cases', () => {
    test('case insensitive lookup', () => {
      const coupon = engine.getCoupon('save10');
      expect(coupon.code).toBe('SAVE10');
    });
  });

  describe('PricingEngine - custom coupons DB', () => {
    test('engine with custom coupons', () => {
      const customCoupons = {
        'CUSTOM': {
          code: 'CUSTOM',
          type: 'percentage',
          value: 15,
          minOrderValue: 0,
          isExpired: false,
          isUsed: false,
          maxUses: 1
        }
      };
      const customEngine = new PricingEngine(customCoupons);
      const discount = customEngine.applyCoupon('CUSTOM', 100);
      expect(discount).toBe(15);
    });
  });

  describe('PricingEngine - unsupported coupon type', () => {
    test('throws for unsupported coupon type', () => {
      const weirdCoupons = {
        'WEIRD': {
          code: 'WEIRD',
          type: 'unknown_type',
          value: 10,
          minOrderValue: 0,
          isExpired: false,
          isUsed: false,
          maxUses: 1
        }
      };
      const customEngine = new PricingEngine(weirdCoupons);
      expect(() => customEngine.applyCoupon('WEIRD', 100)).toThrow('Unsupported coupon type');
    });
  });
});

