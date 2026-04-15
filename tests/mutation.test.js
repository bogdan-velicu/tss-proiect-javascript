const ShoppingCart = require('../src/ShoppingCart');
const PricingEngine = require('../src/PricingEngine');
const { validateItem, roundToTwo, validateCoupon } = require('../src/utils/validators');
const { CART_LIMITS, SHIPPING } = require('../src/utils/constants');

describe('Mutation Killing Tests', () => {
  let cart;
  let engine;

  beforeEach(() => {
    cart = new ShoppingCart();
    engine = new PricingEngine();
  });

  // ==================== Arithmetic Operator Mutations ====================

  describe('Arithmetic Operator Mutations', () => {
    test('MUT-A1: getSubtotal uses multiplication (price * quantity), not addition', () => {
      cart.addItem('Item', 10, 3);
      expect(cart.getSubtotal()).toBe(30); // 10*3, not 10+3=13
    });

    test('MUT-A2: getSubtotal uses addition for accumulation', () => {
      cart.addItem('A', 10, 1);
      cart.addItem('B', 20, 1);
      expect(cart.getSubtotal()).toBe(30); // 10+20, not 10*20=200
    });

    test('MUT-A3: getTotalItemCount sums quantities correctly', () => {
      cart.addItem('A', 10, 3);
      cart.addItem('B', 20, 7);
      expect(cart.getTotalItemCount()).toBe(10); // 3+7, not 3*7=21
    });

    test('MUT-A4: calculateItemTax multiplies total by rate', () => {
      const tax = engine.calculateItemTax(100, 2, 'electronics');
      expect(tax).toBe(38); // 100*2*0.19=38, not 100+2*0.19
    });

    test('MUT-A5: applyPercentageDiscount divides by 100', () => {
      const discount = engine.applyPercentageDiscount(200, 10);
      expect(discount).toBe(20); // 200*(10/100)=20, not 200*10=2000
    });

    test('MUT-A6: roundToTwo multiplies by 100 and divides by 100', () => {
      expect(roundToTwo(1.555)).toBe(1.56); // properly rounded
      expect(roundToTwo(2.345)).toBe(2.35);
    });

    test('MUT-A7: loyalty points = floor(amount / 10)', () => {
      expect(engine.calculateLoyaltyPoints(95)).toBe(9); // floor(95/10)=9, not 95/10=9.5
      expect(engine.calculateLoyaltyPoints(99)).toBe(9);
    });

    test('MUT-A8: addItem - quantity accumulation uses +, not -', () => {
      cart.addItem('Item', 10, 3);
      cart.addItem('Item', 10, 2);
      expect(cart.getItem('Item').quantity).toBe(5); // 3+2, not 3-2=1
    });

    test('MUT-A9: calculateShipping returns correct constants', () => {
      expect(engine.calculateShipping(100, 'standard')).toBe(SHIPPING.STANDARD_COST);
      expect(engine.calculateShipping(100, 'express')).toBe(SHIPPING.EXPRESS_COST);
    });
  });

  // ==================== Comparison Operator Mutations ====================

  describe('Comparison Operator Mutations', () => {
    test('MUT-C1: price < MIN_PRICE (strict less than)', () => {
      // 0.01 should be valid (not < 0.01)
      expect(() => cart.addItem('Item', 0.01, 1)).not.toThrow();
      // 0.009 should be invalid (< 0.01)
      expect(() => cart.addItem('Item2', 0.009, 1)).toThrow();
    });

    test('MUT-C2: price > MAX_PRICE (strict greater than)', () => {
      // 999999.99 should be valid
      expect(() => cart.addItem('Item', 999999.99, 1)).not.toThrow();
      // 1000000 should be invalid
      expect(() => cart.addItem('Item2', 1000000, 1)).toThrow();
    });

    test('MUT-C3: quantity <= 0 (less than or equal)', () => {
      expect(() => cart.addItem('Item', 10, 0)).toThrow();
      expect(() => cart.addItem('Item', 10, 1)).not.toThrow();
    });

    test('MUT-C4: quantity > MAX_QUANTITY_PER_ITEM (strict greater)', () => {
      expect(() => cart.addItem('Item', 10, 50)).not.toThrow();
      expect(() => cart.addItem('Item2', 10, 51)).toThrow();
    });

    test('MUT-C5: shipping free threshold uses >= (not >)', () => {
      expect(engine.calculateShipping(200)).toBe(0);      // exactly at threshold: free
      expect(engine.calculateShipping(199.99)).toBe(15);   // just below: charged
    });

    test('MUT-C6: volume discount thresholds use >= (not >)', () => {
      expect(engine.calculateVolumeDiscount(5, 100)).toBe(2);   // exactly 5 => 2%
      expect(engine.calculateVolumeDiscount(4, 100)).toBe(0);   // below 5 => 0%
      expect(engine.calculateVolumeDiscount(10, 100)).toBe(5);  // exactly 10 => 5%
      expect(engine.calculateVolumeDiscount(9, 100)).toBe(2);   // below 10 => 2%
      expect(engine.calculateVolumeDiscount(20, 100)).toBe(7);  // exactly 20 => 7%
      expect(engine.calculateVolumeDiscount(30, 100)).toBe(10); // exactly 30 => 10%
    });

    test('MUT-C7: loyalty points thresholds use >= (not >)', () => {
      expect(engine.calculateLoyaltyPoints(100)).toBe(20);  // 10+10 bonus
      expect(engine.calculateLoyaltyPoints(99)).toBe(9);    // no bonus
      expect(engine.calculateLoyaltyPoints(200)).toBe(40);  // 20+20 bonus
      expect(engine.calculateLoyaltyPoints(199)).toBe(29);  // 19+10 bonus
      expect(engine.calculateLoyaltyPoints(500)).toBe(100); // 50+50 bonus
      expect(engine.calculateLoyaltyPoints(499)).toBe(69);  // 49+20 bonus
    });

    test('MUT-C8: getMostExpensiveItem uses > (strict greater)', () => {
      cart.addItem('A', 10, 1);
      cart.addItem('B', 20, 1);
      cart.addItem('C', 15, 1);
      const item = cart.getMostExpensiveItem();
      expect(item.name).toBe('B');
      expect(item.price).toBe(20);
    });

    test('MUT-C9: getCheapestItem uses < (strict less)', () => {
      cart.addItem('A', 10, 1);
      cart.addItem('B', 5, 1);
      cart.addItem('C', 15, 1);
      const item = cart.getCheapestItem();
      expect(item.name).toBe('B');
      expect(item.price).toBe(5);
    });

    test('MUT-C10: cart capacity uses > (currentTotal + quantity > MAX)', () => {
      cart.addItem('A', 1, 50);
      cart.addItem('B', 1, 50);
      // exactly at 100 should be fine (added above)
      expect(cart.getTotalItemCount()).toBe(100);
      // adding 1 more should fail
      expect(() => cart.addItem('C', 1, 1)).toThrow();
    });

    test('MUT-C11: fixedDiscount uses Math.min correctly', () => {
      // discount < amount => discount returned
      expect(engine.applyFixedDiscount(100, 30)).toBe(30);
      // discount > amount => amount returned (capped)
      expect(engine.applyFixedDiscount(20, 30)).toBe(20);
      // discount = amount => amount returned
      expect(engine.applyFixedDiscount(50, 50)).toBe(50);
    });
  });

  // ==================== Logical Operator Mutations ====================

  describe('Logical Operator Mutations', () => {
    test('MUT-L1: name validation uses OR (any condition fails)', () => {
      // All three conditions independently cause failure
      expect(() => validateItem(null, 10, 1, null)).toThrow();  // !name
      expect(() => validateItem(123, 10, 1, null)).toThrow();   // typeof !== string
      expect(() => validateItem('  ', 10, 1, null)).toThrow();  // trim().length === 0
    });

    test('MUT-L2: price validation checks both type and NaN', () => {
      expect(() => validateItem('A', 'text', 1, null)).toThrow(); // typeof !== number
      expect(() => validateItem('A', NaN, 1, null)).toThrow();    // isNaN
    });

    test('MUT-L3: quantity validation checks both type and integer', () => {
      expect(() => validateItem('A', 10, 'five', null)).toThrow(); // typeof !== number
      expect(() => validateItem('A', 10, 2.5, null)).toThrow();    // !isInteger
    });

    test('MUT-L4: category validation uses AND (both truthy and not included)', () => {
      // null category should pass (falsy, so AND short-circuits)
      expect(validateItem('A', 10, 1, null)).toBe(true);
      // valid category should pass
      expect(validateItem('A', 10, 1, 'electronics')).toBe(true);
      // invalid category should fail
      expect(() => validateItem('A', 10, 1, 'toys')).toThrow();
    });

    test('MUT-L5: shipping condition uses AND (standard AND above threshold)', () => {
      // standard + above threshold => free
      expect(engine.calculateShipping(200, 'standard')).toBe(0);
      // express + above threshold => NOT free (AND fails)
      expect(engine.calculateShipping(200, 'express')).toBe(30);
      // standard + below threshold => NOT free (AND fails)
      expect(engine.calculateShipping(100, 'standard')).toBe(15);
    });
  });

  // ==================== Statement Removal Mutations ====================

  describe('Statement Removal Mutations', () => {
    test('MUT-S1: addItem pushes item to array', () => {
      cart.addItem('Item', 10, 1);
      expect(cart.items.length).toBe(1);
      expect(cart.items[0].name).toBe('Item');
    });

    test('MUT-S2: removeItem splices item from array', () => {
      cart.addItem('A', 10, 1);
      cart.addItem('B', 20, 1);
      cart.removeItem('A');
      expect(cart.items.length).toBe(1);
      expect(cart.items[0].name).toBe('B');
    });

    test('MUT-S3: clear empties items array', () => {
      cart.addItem('A', 10, 1);
      cart.addItem('B', 20, 1);
      cart.clear();
      expect(cart.items.length).toBe(0);
    });

    test('MUT-S4: clear also resets coupon', () => {
      cart.setCoupon('SAVE10');
      cart.clear();
      expect(cart.appliedCoupon).toBeNull();
    });

    test('MUT-S5: setCoupon stores the code', () => {
      cart.setCoupon('save10');
      expect(cart.appliedCoupon).toBe('SAVE10');
    });

    test('MUT-S6: removeCoupon sets to null', () => {
      cart.setCoupon('SAVE10');
      cart.removeCoupon();
      expect(cart.appliedCoupon).toBeNull();
    });

    test('MUT-S7: updateQuantity actually changes quantity', () => {
      cart.addItem('Item', 10, 5);
      cart.updateQuantity('Item', 8);
      expect(cart.getItem('Item').quantity).toBe(8);
    });

    test('MUT-S8: addItem updates price for existing item', () => {
      cart.addItem('Item', 10, 1);
      cart.addItem('Item', 15, 1); // same name, different price
      expect(cart.getItem('Item').price).toBe(15);
    });
  });

  // ==================== Boundary Condition Mutations ====================

  describe('Boundary Condition Mutations', () => {
    test('MUT-B1: volume discount 5-item boundary', () => {
      // Mutant might change >= 5 to > 5
      expect(engine.calculateVolumeDiscount(5, 100)).toBe(2);  // should get discount
      expect(engine.calculateVolumeDiscount(4, 100)).toBe(0);  // should NOT
    });

    test('MUT-B2: volume discount 10-item boundary', () => {
      expect(engine.calculateVolumeDiscount(10, 100)).toBe(5);
      expect(engine.calculateVolumeDiscount(9, 100)).toBe(2);
    });

    test('MUT-B3: volume discount 20-item boundary', () => {
      expect(engine.calculateVolumeDiscount(20, 100)).toBe(7);
      expect(engine.calculateVolumeDiscount(19, 100)).toBe(5);
    });

    test('MUT-B4: volume discount 30-item boundary', () => {
      expect(engine.calculateVolumeDiscount(30, 100)).toBe(10);
      expect(engine.calculateVolumeDiscount(29, 100)).toBe(7);
    });

    test('MUT-B5: shipping threshold exact boundary', () => {
      expect(engine.calculateShipping(200)).toBe(0);
      expect(engine.calculateShipping(199.99)).toBe(15);
    });

    test('MUT-B6: loyalty 100 boundary', () => {
      expect(engine.calculateLoyaltyPoints(100)).toBe(20);   // 10 base + 10 bonus
      expect(engine.calculateLoyaltyPoints(99.99)).toBe(9);  // 9 base, no bonus
    });

    test('MUT-B7: loyalty 200 boundary', () => {
      expect(engine.calculateLoyaltyPoints(200)).toBe(40);   // 20 base + 20 bonus
      expect(engine.calculateLoyaltyPoints(199.99)).toBe(29); // 19 base + 10 bonus
    });

    test('MUT-B8: loyalty 500 boundary', () => {
      expect(engine.calculateLoyaltyPoints(500)).toBe(100);  // 50 base + 50 bonus
      expect(engine.calculateLoyaltyPoints(499.99)).toBe(69); // 49 base + 20 bonus
    });

    test('MUT-B9: buyXGetY required items boundary', () => {
      const items = [{ price: 10, quantity: 3 }];
      expect(engine.applyBuyXGetYFree(items, 2, 1)).toBe(10); // 3 items, need 3 => 1 free
      const items2 = [{ price: 10, quantity: 2 }];
      expect(engine.applyBuyXGetYFree(items2, 2, 1)).toBe(0); // 2 items, need 3 => no free
    });
  });

  // ==================== Return Value Mutations ====================

  describe('Return Value Mutations', () => {
    test('MUT-R1: isEmpty returns true for empty cart', () => {
      expect(cart.isEmpty()).toBe(true);
    });

    test('MUT-R2: isEmpty returns false for non-empty cart', () => {
      cart.addItem('Item', 10, 1);
      expect(cart.isEmpty()).toBe(false);
    });

    test('MUT-R3: getSubtotal returns 0 for empty cart', () => {
      expect(cart.getSubtotal()).toBe(0);
    });

    test('MUT-R4: getSubtotal returns correct value', () => {
      cart.addItem('Item', 25.50, 4);
      expect(cart.getSubtotal()).toBe(102);
    });

    test('MUT-R5: getMostExpensiveItem returns null for empty cart', () => {
      expect(cart.getMostExpensiveItem()).toBeNull();
    });

    test('MUT-R6: getCheapestItem returns null for empty cart', () => {
      expect(cart.getCheapestItem()).toBeNull();
    });

    test('MUT-R7: getItem returns null for non-existent item', () => {
      expect(cart.getItem('NonExistent')).toBeNull();
    });

    test('MUT-R8: getItem returns the correct item', () => {
      cart.addItem('Laptop', 999, 1, 'electronics');
      const item = cart.getItem('Laptop');
      expect(item).not.toBeNull();
      expect(item.name).toBe('Laptop');
      expect(item.price).toBe(999);
    });

    test('MUT-R9: calculateShipping returns 0 for free shipping', () => {
      expect(engine.calculateShipping(300)).toBe(0);
    });

    test('MUT-R10: calculateShipping returns 15 for standard', () => {
      expect(engine.calculateShipping(50)).toBe(15);
    });

    test('MUT-R11: calculateShipping returns 30 for express', () => {
      expect(engine.calculateShipping(50, 'express')).toBe(30);
    });

    test('MUT-R12: validateItem returns true on valid input', () => {
      expect(validateItem('Test', 10, 1, 'electronics')).toBe(true);
    });

    test('MUT-R13: validateCoupon returns correct valid/invalid objects', () => {
      const valid = validateCoupon({ isExpired: false, isUsed: false });
      expect(valid).toEqual({ valid: true, reason: null });

      const expired = validateCoupon({ isExpired: true, isUsed: false });
      expect(expired.valid).toBe(false);

      const used = validateCoupon({ isExpired: false, isUsed: true });
      expect(used.valid).toBe(false);

      const notFound = validateCoupon(null);
      expect(notFound.valid).toBe(false);
    });

    test('MUT-R14: calculateTotal returns all expected fields', () => {
      cart.addItem('Item', 100, 1, 'electronics');
      const result = engine.calculateTotal(cart);
      expect(result).toHaveProperty('subtotal');
      expect(result).toHaveProperty('discount');
      expect(result).toHaveProperty('couponDiscount');
      expect(result).toHaveProperty('volumeDiscount');
      expect(result).toHaveProperty('tax');
      expect(result).toHaveProperty('shipping');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('loyaltyPoints');
      expect(result).toHaveProperty('savings');
    });

    test('MUT-R15: calculateTotal empty cart returns all zeros', () => {
      const result = engine.calculateTotal(cart);
      expect(result.subtotal).toBe(0);
      expect(result.discount).toBe(0);
      expect(result.couponDiscount).toBe(0);
      expect(result.volumeDiscount).toBe(0);
      expect(result.tax).toBe(0);
      expect(result.shipping).toBe(0);
      expect(result.total).toBe(0);
      expect(result.loyaltyPoints).toBe(0);
      expect(result.savings).toBe(0);
    });

    test('MUT-R16: addItem returns the new item object', () => {
      const item = cart.addItem('Laptop', 500, 1, 'electronics');
      expect(item).toBeDefined();
      expect(item.name).toBe('Laptop');
      expect(item.price).toBe(500);
      expect(item.quantity).toBe(1);
      expect(item.category).toBe('electronics');
    });

    test('MUT-R17: removeItem returns the removed item', () => {
      cart.addItem('Laptop', 500, 1, 'electronics');
      const removed = cart.removeItem('Laptop');
      expect(removed).toBeDefined();
      expect(removed.name).toBe('Laptop');
    });

    test('MUT-R18: applyBuyXGetYFree returns 0 for empty array', () => {
      expect(engine.applyBuyXGetYFree([], 2, 1)).toBe(0);
    });

    test('MUT-R19: applyBuyXGetYFree returns 0 when not enough items', () => {
      const items = [{ price: 10, quantity: 1 }];
      expect(engine.applyBuyXGetYFree(items, 2, 1)).toBe(0);
    });

    test('MUT-R20: getUniqueItemCount returns correct count', () => {
      expect(cart.getUniqueItemCount()).toBe(0);
      cart.addItem('A', 10, 1);
      expect(cart.getUniqueItemCount()).toBe(1);
      cart.addItem('B', 20, 1);
      expect(cart.getUniqueItemCount()).toBe(2);
      cart.addItem('A', 10, 1); // duplicate - count stays 2
      expect(cart.getUniqueItemCount()).toBe(2);
    });
  });
});
