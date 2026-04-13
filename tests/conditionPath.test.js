const ShoppingCart = require('../src/ShoppingCart');
const PricingEngine = require('../src/PricingEngine');
const { validateItem } = require('../src/utils/validators');

describe('Condition Coverage Tests', () => {
  let cart;
  let engine;

  beforeEach(() => {
    cart = new ShoppingCart();
    engine = new PricingEngine();
  });

  // ==================== Condition Coverage for validateItem ====================

  describe('validateItem - Condition Coverage', () => {
    // C1: !name => true/false
    // C2: typeof name !== 'string' => true/false
    // C3: name.trim().length === 0 => true/false

    test('C1=true: name is falsy (null)', () => {
      expect(() => validateItem(null, 10, 1, null)).toThrow('non-empty string');
    });

    test('C1=true: name is falsy (undefined)', () => {
      expect(() => validateItem(undefined, 10, 1, null)).toThrow('non-empty string');
    });

    test('C1=true: name is falsy (empty string)', () => {
      expect(() => validateItem('', 10, 1, null)).toThrow('non-empty string');
    });

    test('C1=false, C2=true: name is truthy but not string', () => {
      expect(() => validateItem(123, 10, 1, null)).toThrow('non-empty string');
    });

    test('C1=false, C2=false, C3=true: string of whitespace', () => {
      expect(() => validateItem('   ', 10, 1, null)).toThrow('non-empty string');
    });

    test('C1=false, C2=false, C3=false: valid name', () => {
      expect(validateItem('Laptop', 10, 1, null)).toBe(true);
    });

    // Price conditions
    // C4: typeof price !== 'number' => true/false
    // C5: isNaN(price) => true/false

    test('C4=true: price is not a number', () => {
      expect(() => validateItem('Item', 'abc', 1, null)).toThrow('valid number');
    });

    test('C4=false, C5=true: price is NaN', () => {
      expect(() => validateItem('Item', NaN, 1, null)).toThrow('valid number');
    });

    test('C4=false, C5=false: price is valid number', () => {
      expect(validateItem('Item', 10, 1, null)).toBe(true);
    });

    // C6: price < MIN_PRICE
    test('C6=true: price below minimum', () => {
      expect(() => validateItem('Item', 0.001, 1, null)).toThrow('at least');
    });

    test('C6=false: price at minimum', () => {
      expect(validateItem('Item', 0.01, 1, null)).toBe(true);
    });

    // C7: price > MAX_PRICE
    test('C7=true: price above maximum', () => {
      expect(() => validateItem('Item', 1000000, 1, null)).toThrow('cannot exceed');
    });

    test('C7=false: price at maximum', () => {
      expect(validateItem('Item', 999999.99, 1, null)).toBe(true);
    });

    // Quantity conditions
    // C8: typeof quantity !== 'number' || !Number.isInteger(quantity)
    test('C8=true: quantity is string', () => {
      expect(() => validateItem('Item', 10, 'five', null)).toThrow('integer');
    });

    test('C8=true: quantity is float', () => {
      expect(() => validateItem('Item', 10, 2.5, null)).toThrow('integer');
    });

    // C9: quantity <= 0
    test('C9=true: quantity is 0', () => {
      expect(() => validateItem('Item', 10, 0, null)).toThrow('greater than zero');
    });

    test('C9=true: quantity is negative', () => {
      expect(() => validateItem('Item', 10, -5, null)).toThrow('greater than zero');
    });

    // C10: quantity > MAX_QUANTITY_PER_ITEM
    test('C10=true: quantity exceeds limit', () => {
      expect(() => validateItem('Item', 10, 51, null)).toThrow('cannot exceed');
    });

    // Category conditions
    // C11: category && !validCategories.includes(category)
    test('C11=true: invalid category', () => {
      expect(() => validateItem('Item', 10, 1, 'toys')).toThrow('Invalid category');
    });

    test('C11=false: null category (no check)', () => {
      expect(validateItem('Item', 10, 1, null)).toBe(true);
    });

    test('C11=false: valid category', () => {
      expect(validateItem('Item', 10, 1, 'electronics')).toBe(true);
    });
  });

  // ==================== Condition Coverage for calculateShipping ====================

  describe('calculateShipping - Condition Coverage', () => {
    // C1: typeof subtotal !== 'number' || subtotal < 0
    test('C1: subtotal is string', () => {
      expect(() => engine.calculateShipping('abc')).toThrow('non-negative');
    });

    test('C1: subtotal is negative', () => {
      expect(() => engine.calculateShipping(-5)).toThrow('non-negative');
    });

    test('C1: subtotal is valid', () => {
      expect(engine.calculateShipping(100)).toBe(15);
    });

    // C2: !validTypes.includes(shippingType)
    test('C2=true: invalid shipping type', () => {
      expect(() => engine.calculateShipping(100, 'overnight')).toThrow('Invalid shipping type');
    });

    test('C2=false: standard shipping', () => {
      expect(engine.calculateShipping(100, 'standard')).toBe(15);
    });

    test('C2=false: express shipping', () => {
      expect(engine.calculateShipping(100, 'express')).toBe(30);
    });

    // C3: shippingType === 'standard' && subtotal >= SHIPPING.FREE_THRESHOLD
    test('C3: standard + above threshold => free', () => {
      expect(engine.calculateShipping(200, 'standard')).toBe(0);
    });

    test('C3: standard + below threshold => cost', () => {
      expect(engine.calculateShipping(100, 'standard')).toBe(15);
    });

    test('C3: express + above threshold => still costs', () => {
      expect(engine.calculateShipping(200, 'express')).toBe(30);
    });
  });

  // ==================== Condition Coverage for applyCoupon ====================

  describe('applyCoupon - Condition Coverage', () => {
    // C1: subtotal < coupon.minOrderValue
    test('C1=true: subtotal below min order value', () => {
      expect(() => engine.applyCoupon('SAVE10', 30)).toThrow('Minimum order value');
    });

    test('C1=false: subtotal meets min order value', () => {
      const discount = engine.applyCoupon('SAVE10', 100);
      expect(discount).toBe(10);
    });

    // Coupon type switch
    test('Percentage type coupon', () => {
      const discount = engine.applyCoupon('SAVE10', 200);
      expect(discount).toBe(20);
    });

    test('Fixed type coupon', () => {
      const discount = engine.applyCoupon('FLAT25', 150);
      expect(discount).toBe(25);
    });

    test('Unsupported coupon type', () => {
      const customEngine = new PricingEngine({
        'BAD': {
          code: 'BAD',
          type: 'weird_type',
          value: 10,
          minOrderValue: 0,
          isExpired: false,
          isUsed: false,
          maxUses: 1
        }
      });
      expect(() => customEngine.applyCoupon('BAD', 100)).toThrow('Unsupported coupon type');
    });
  });
});

// ==================== Path Coverage Tests ====================

describe('Path Coverage Tests', () => {
  let cart;
  let engine;

  beforeEach(() => {
    cart = new ShoppingCart();
    engine = new PricingEngine();
  });

  // ==================== addItem Paths ====================

  describe('addItem - Path Coverage', () => {
    // P1: Validation fails (name) => throws
    test('P1: Invalid name path', () => {
      expect(() => cart.addItem('', 10, 1)).toThrow();
    });

    // P2: Validation fails (price) => throws
    test('P2: Invalid price path', () => {
      expect(() => cart.addItem('Item', -1, 1)).toThrow();
    });

    // P3: Cart capacity exceeded => throws
    test('P3: Cart full path', () => {
      cart.addItem('A', 1, 50);
      cart.addItem('B', 1, 50);
      expect(() => cart.addItem('C', 1, 1)).toThrow('Cart limit');
    });

    // P4: Existing item found, quantity update within limit => success
    test('P4: Update existing item path', () => {
      cart.addItem('Laptop', 500, 1, 'electronics');
      const updated = cart.addItem('Laptop', 500, 2, 'electronics');
      expect(updated.quantity).toBe(3);
    });

    // P5: Existing item found, quantity update exceeds limit => throws
    test('P5: Existing item quantity overflow path', () => {
      cart.addItem('Laptop', 500, 30, 'electronics');
      expect(() => cart.addItem('Laptop', 500, 25, 'electronics')).toThrow('exceed the limit');
    });

    // P6: New item added successfully => success
    test('P6: New item added path', () => {
      const item = cart.addItem('Laptop', 500, 1, 'electronics');
      expect(item.name).toBe('Laptop');
      expect(cart.getUniqueItemCount()).toBe(1);
    });

    // P7: New item with trimmed name
    test('P7: Name gets trimmed', () => {
      const item = cart.addItem('  Laptop  ', 500, 1, 'electronics');
      expect(item.name).toBe('Laptop');
    });

    // P8: Add item with no category
    test('P8: No category path', () => {
      const item = cart.addItem('Widget', 10, 1);
      expect(item.category).toBeNull();
    });
  });

  // ==================== updateQuantity Paths ====================

  describe('updateQuantity - Path Coverage', () => {
    // P1: Invalid name => throws
    test('P1: Invalid name', () => {
      expect(() => cart.updateQuantity(null, 5)).toThrow();
    });

    // P2: Invalid quantity type => throws
    test('P2: Non-integer quantity', () => {
      cart.addItem('Item', 10, 1);
      expect(() => cart.updateQuantity('Item', 2.5)).toThrow();
    });

    // P3: Negative quantity => throws
    test('P3: Negative quantity', () => {
      cart.addItem('Item', 10, 1);
      expect(() => cart.updateQuantity('Item', -1)).toThrow();
    });

    // P4: Item not found => throws
    test('P4: Item not found', () => {
      expect(() => cart.updateQuantity('Ghost', 5)).toThrow('not found');
    });

    // P5: Quantity = 0 => remove item
    test('P5: Zero quantity removes item', () => {
      cart.addItem('Item', 10, 5);
      cart.updateQuantity('Item', 0);
      expect(cart.isEmpty()).toBe(true);
    });

    // P6: Quantity exceeds per-item limit => throws
    test('P6: Exceeds per-item limit', () => {
      cart.addItem('Item', 10, 1);
      expect(() => cart.updateQuantity('Item', 51)).toThrow('cannot exceed');
    });

    // P7: Quantity exceeds cart limit => throws
    test('P7: Exceeds cart limit', () => {
      cart.addItem('A', 1, 50);
      cart.addItem('B', 1, 40);
      cart.addItem('C', 1, 5);
      expect(() => cart.updateQuantity('C', 15)).toThrow('exceed cart limit');
    });

    // P8: Valid update => success
    test('P8: Successful update', () => {
      cart.addItem('Item', 10, 1);
      const updated = cart.updateQuantity('Item', 25);
      expect(updated.quantity).toBe(25);
    });
  });

  // ==================== calculateTotal Paths ====================

  describe('calculateTotal - Path Coverage', () => {
    // P1: Invalid cart => throws
    test('P1: Invalid cart object', () => {
      expect(() => engine.calculateTotal(null)).toThrow();
    });

    // P2: Empty cart => all zeros
    test('P2: Empty cart', () => {
      const result = engine.calculateTotal(cart);
      expect(result.total).toBe(0);
    });

    // P3: Cart with items, no coupon, no volume discount
    test('P3: Simple cart, no discounts', () => {
      cart.addItem('Item', 50, 1, 'electronics');
      const result = engine.calculateTotal(cart);
      expect(result.subtotal).toBe(50);
      expect(result.couponDiscount).toBe(0);
      expect(result.volumeDiscount).toBe(0);
    });

    // P4: Cart with volume discount
    test('P4: Volume discount applied', () => {
      cart.addItem('Item', 10, 10, 'electronics');
      const result = engine.calculateTotal(cart);
      expect(result.volumeDiscount).toBeGreaterThan(0);
    });

    // P5: Cart with valid coupon
    test('P5: Coupon applied', () => {
      cart.addItem('Item', 100, 1, 'electronics');
      cart.setCoupon('SAVE10');
      const result = engine.calculateTotal(cart);
      expect(result.couponDiscount).toBeGreaterThan(0);
    });

    // P6: Cart with invalid coupon (silently fails)
    test('P6: Invalid coupon silently ignored', () => {
      cart.addItem('Item', 100, 1, 'electronics');
      cart.setCoupon('SUMMER20');
      const result = engine.calculateTotal(cart);
      expect(result.couponDiscount).toBe(0);
    });

    // P7: Cart with both volume discount and coupon
    test('P7: Volume + coupon', () => {
      cart.addItem('Item', 20, 10, 'electronics'); // subtotal 200, 10 items => 5%
      cart.setCoupon('SAVE10');
      const result = engine.calculateTotal(cart);
      expect(result.volumeDiscount).toBeGreaterThan(0);
      expect(result.couponDiscount).toBeGreaterThan(0);
    });

    // P8: Large order with free shipping
    test('P8: Free shipping for large order', () => {
      cart.addItem('Item', 300, 1, 'electronics');
      const result = engine.calculateTotal(cart);
      expect(result.shipping).toBe(0);
    });
  });

  // ==================== calculateVolumeDiscount Paths ====================

  describe('calculateVolumeDiscount - Path Coverage', () => {
    test('P1: Negative items throws', () => {
      expect(() => engine.calculateVolumeDiscount(-1, 100)).toThrow('non-negative');
    });

    test('P2: Negative subtotal throws', () => {
      expect(() => engine.calculateVolumeDiscount(5, -100)).toThrow('non-negative');
    });

    test('P3: 0 items, 0% discount', () => {
      expect(engine.calculateVolumeDiscount(0, 100)).toBe(0);
    });

    test('P4: 4 items, 0% discount', () => {
      expect(engine.calculateVolumeDiscount(4, 100)).toBe(0);
    });

    test('P5: 5 items, 2% discount', () => {
      expect(engine.calculateVolumeDiscount(5, 100)).toBe(2);
    });

    test('P6: 10 items, 5% discount', () => {
      expect(engine.calculateVolumeDiscount(10, 100)).toBe(5);
    });

    test('P7: 20 items, 7% discount', () => {
      expect(engine.calculateVolumeDiscount(20, 100)).toBe(7);
    });

    test('P8: 30 items, 10% discount', () => {
      expect(engine.calculateVolumeDiscount(30, 100)).toBe(10);
    });
  });
});
