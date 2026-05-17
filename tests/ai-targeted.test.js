// =========================================================================
// Teste generate de AI folosind PROMPTURI TINTITE pe metodologie.
// 5 prompts, 3 platforme distincte:
//
//   P1 — Clase de echivalenta (EP) pe addItem        → ChatGPT (gpt-5)
//   P2 — BVA pe calculateShipping                    → ChatGPT (gpt-5)
//   P3 — Statement/Branch coverage pe addItem        → Google Gemini
//   P4 — MC/DC pe calculateShipping                  → ChatGPT (gpt-5)
//   P5 — Mutation testing tintit (10 mutanti)        → Claude Sonnet 4.6
//
// Codul este verbatim din raspunsurile AI (cu mici curatari de artefacte
// de format tip "JavaScript" header). Eventualele halucinatii de API,
// constante sau semantica sunt PASTRATE intentionat — vezi raport-ai.md.
//
// Capturi de ecran cu prompturile + raspunsurile: screenshots/ai-prompts/
// =========================================================================

const ShoppingCart = require('../src/ShoppingCart');
const PricingEngine = require('../src/PricingEngine');

// -------------------------------------------------------------------------
// P1 (ChatGPT) — Clase de echivalenta pentru addItem
// Screenshot: screenshots/ai-prompts/prompt1_ep_addItem.png
// -------------------------------------------------------------------------

describe('addItem - clase de echivalenta', () => {

  test('G1 - valid electronics', () => {
    const cart = new ShoppingCart();
    expect(() => cart.addItem('Laptop', 1999.99, 1, 'electronics')).not.toThrow();
  });

  test('G2 - valid clothing', () => {
    const cart = new ShoppingCart();
    expect(() => cart.addItem('Tricou', 99.99, 2, 'clothing')).not.toThrow();
  });

  test('G3 - valid food', () => {
    const cart = new ShoppingCart();
    expect(() => cart.addItem('Mere', 10.5, 5, 'food')).not.toThrow();
  });

  test('G4 - valid books', () => {
    const cart = new ShoppingCart();
    expect(() => cart.addItem('Clean Code', 120, 1, 'books')).not.toThrow();
  });

  test('G5 - valid null category', () => {
    const cart = new ShoppingCart();
    expect(() => cart.addItem('Generic Item', 50, 3, null)).not.toThrow();
  });

  test('G6 - invalid empty name', () => {
    const cart = new ShoppingCart();
    expect(() => cart.addItem('', 100, 1, 'electronics')).toThrow();
  });

  test('G7 - invalid whitespace name', () => {
    const cart = new ShoppingCart();
    expect(() => cart.addItem('   ', 100, 1, 'electronics')).toThrow();
  });

  test('G8 - invalid non-string name', () => {
    const cart = new ShoppingCart();
    expect(() => cart.addItem(null, 100, 1, 'electronics')).toThrow();
  });

  test('G9 - invalid price below minimum', () => {
    const cart = new ShoppingCart();
    expect(() => cart.addItem('Laptop', 0, 1, 'electronics')).toThrow();
  });

  test('G10 - invalid price above maximum', () => {
    const cart = new ShoppingCart();
    expect(() => cart.addItem('Laptop', 1000000, 1, 'electronics')).toThrow();
  });

  test('G11 - invalid non-number price', () => {
    const cart = new ShoppingCart();
    expect(() => cart.addItem('Laptop', '100', 1, 'electronics')).toThrow();
  });

  test('G12 - invalid quantity below minimum', () => {
    const cart = new ShoppingCart();
    expect(() => cart.addItem('Laptop', 100, 0, 'electronics')).toThrow();
  });

  test('G13 - invalid quantity above maximum', () => {
    const cart = new ShoppingCart();
    expect(() => cart.addItem('Laptop', 100, 51, 'electronics')).toThrow();
  });

  test('G14 - invalid non-integer quantity', () => {
    const cart = new ShoppingCart();
    expect(() => cart.addItem('Laptop', 100, 1.5, 'electronics')).toThrow();
  });

  test('G15 - invalid non-number quantity', () => {
    const cart = new ShoppingCart();
    expect(() => cart.addItem('Laptop', 100, '2', 'electronics')).toThrow();
  });

  test('G16 - invalid category value', () => {
    const cart = new ShoppingCart();
    expect(() => cart.addItem('Laptop', 100, 1, 'toys')).toThrow();
  });

  test('G17 - invalid non-string category', () => {
    const cart = new ShoppingCart();
    expect(() => cart.addItem('Laptop', 100, 1, 123)).toThrow();
  });
});

// -------------------------------------------------------------------------
// P2 (ChatGPT) — BVA pentru calculateShipping
// Screenshot: screenshots/ai-prompts/prompt2_bva_shipping.png
// -------------------------------------------------------------------------

describe('calculateShipping - BVA', () => {
  let engine;

  beforeEach(() => {
    engine = new PricingEngine();
  });

  describe('Pragul subtotal = 200', () => {
    test('BVA: subtotal = 199.99, shippingType = standard', () => {
      expect(engine.calculateShipping(199.99, 'standard')).toBe(15);
    });

    test('BVA: subtotal = 200, shippingType = standard', () => {
      expect(engine.calculateShipping(200, 'standard')).toBe(0);
    });

    test('BVA: subtotal = 200.01, shippingType = standard', () => {
      expect(engine.calculateShipping(200.01, 'standard')).toBe(0);
    });

    test('BVA: subtotal = 199.99, shippingType = express', () => {
      expect(engine.calculateShipping(199.99, 'express')).toBe(25);
    });

    test('BVA: subtotal = 200, shippingType = express', () => {
      expect(engine.calculateShipping(200, 'express')).toBe(25);
    });

    test('BVA: subtotal = 200.01, shippingType = express', () => {
      expect(engine.calculateShipping(200.01, 'express')).toBe(25);
    });
  });

  describe('Pragul subtotal = 0', () => {
    test('BVA: subtotal = -0.01', () => {
      expect(() => engine.calculateShipping(-0.01, 'standard')).toThrow();
    });

    test('BVA: subtotal = 0, shippingType = standard', () => {
      expect(engine.calculateShipping(0, 'standard')).toBe(15);
    });

    test('BVA: subtotal = 0.01, shippingType = standard', () => {
      expect(engine.calculateShipping(0.01, 'standard')).toBe(15);
    });

    test('BVA: subtotal = 0, shippingType = express', () => {
      expect(engine.calculateShipping(0, 'express')).toBe(25);
    });

    test('BVA: subtotal = 0.01, shippingType = express', () => {
      expect(engine.calculateShipping(0.01, 'express')).toBe(25);
    });
  });

  describe('Valori invalide', () => {
    test('BVA: subtotal = NaN', () => {
      expect(() => engine.calculateShipping(NaN, 'standard')).toThrow();
    });

    test('BVA: subtotal = "200"', () => {
      expect(() => engine.calculateShipping('200', 'standard')).toThrow();
    });

    test('BVA: shippingType invalid', () => {
      expect(() => engine.calculateShipping(200, 'overnight')).toThrow();
    });
  });
});

// -------------------------------------------------------------------------
// P3 (Gemini) — Statement / Branch Coverage pentru addItem (5 cai CFG)
// Screenshot: screenshots/ai-prompts/prompt3_scbc_addItem.png
// -------------------------------------------------------------------------

describe('addItem - statement/branch coverage', () => {
  let cart;

  beforeEach(() => {
    cart = new ShoppingCart();
  });

  // P1: validateItem arunca eroare
  test('P1 - should throw error when validateItem fails due to invalid input', () => {
    expect(() => {
      cart.addItem('', -5, 2, 'InvalidCategory');
    }).toThrow();
  });

  // P2: D1=true (cart full)
  test('P2 - should throw "cart full" error when quantity exceeds MAX_ITEMS', () => {
    expect(() => {
      cart.addItem('Laptop', 1000, 101, 'Electronics');
    }).toThrow('cart full');
  });

  // P3: D1=false, D2=true, D3=true (qty overflow)
  test('P3 - should throw "qty overflow" error when updating an existing item exceeds MAX_QUANTITY_PER_ITEM', () => {
    cart.addItem('Apple', 1.5, 30, 'Fruits');
    expect(() => {
      cart.addItem('Apple', 1.5, 25, 'Fruits');
    }).toThrow('qty overflow');
  });

  // P4: D1=false, D2=true, D3=false (update existent)
  test('P4 - should successfully update an existing item when constraints are met', () => {
    cart.addItem('Apple', 1.5, 10, 'Fruits');
    const updatedItem = cart.addItem('Apple', 1.8, 20, 'Fruits');

    expect(updatedItem).toEqual({
      name: 'Apple',
      price: 1.8,
      quantity: 30,
      category: 'Fruits'
    });
  });

  // P5: D1=false, D2=false (adauga nou)
  test('P5 - should successfully add a new item to an empty or non-conflicting cart', () => {
    const newItem = cart.addItem('Banana', 0.8, 15, 'Fruits');

    expect(newItem).toEqual({
      name: 'Banana',
      price: 0.8,
      quantity: 15,
      category: 'Fruits'
    });
  });
});

// -------------------------------------------------------------------------
// P4 (ChatGPT) — MC/DC pentru calculateShipping (C1 AND C2)
// Screenshot: screenshots/ai-prompts/prompt4_mcdc_shipping.png
//
// Tabel MC/DC produs de AI:
//   Test | C1 (standard) | C2 (subtotal >= 200) | D = C1 AND C2 | Pereche
//   t1   | T             | T                    | T             | C1 cu t3, C2 cu t2
//   t2   | T             | F                    | F             | C2 cu t1
//   t3   | F             | T                    | F             | C1 cu t1
// -------------------------------------------------------------------------

describe('calculateShipping - MC/DC', () => {
  test('MC/DC t1: C1=T, C2=T, D=T -> returneaza 0', () => {
    const result = PricingEngine.calculateShipping(250, 'standard');
    expect(result).toBe(0);
  });

  test('MC/DC t2: C1=T, C2=F, D=F -> returneaza cost transport diferit de 0', () => {
    const result = PricingEngine.calculateShipping(150, 'standard');
    expect(result).not.toBe(0);
  });

  test('MC/DC t3: C1=F, C2=T, D=F -> returneaza cost transport diferit de 0', () => {
    const result = PricingEngine.calculateShipping(250, 'express');
    expect(result).not.toBe(0);
  });
});

// -------------------------------------------------------------------------
// P5 (Claude) — Teste tintite pentru 10 mutanti din PricingEngine
// Screenshot: screenshots/ai-prompts/prompt5_mutants.png
// -------------------------------------------------------------------------

describe('PricingEngine - teste tintite mutanti', () => {
  let engine;

  beforeEach(() => {
    engine = new PricingEngine();
  });

  test('(M1) calculateItemTax: price = 0 este valid, tax = 0', () => {
    const result = engine.calculateItemTax(0, 'electronics', 1);
    expect(result).toBe(0);
  });

  test('(M2) calculateItemTax: quantity = 1 este valid, tax = 19 pentru price=100 electronics', () => {
    const result = engine.calculateItemTax(100, 'electronics', 1);
    expect(result).toBe(19);
  });

  test('(M3) calculateShipping: subtotal = 0 este valid, returneaza STANDARD_COST = 15', () => {
    const result = engine.calculateShipping(0);
    expect(result).toBe(15);
  });

  test('(M4) applyPercentageDiscount: percentage = 100 este valid, discount = 250 din 250', () => {
    const result = engine.applyPercentageDiscount(250, 100);
    expect(result).toBe(250);
  });

  test('(M5) applyFixedDiscount: discount = amount = 100, rezultat = 100', () => {
    const result = engine.applyFixedDiscount(100, 100);
    expect(result).toBe(100);
  });

  test('(M6) calculateVolumeDiscount: totalItems = 5, subtotal = 100 -> discount = 2', () => {
    const result = engine.calculateVolumeDiscount(5, 100);
    expect(result).toBe(2);
  });

  test('(M7) calculateVolumeDiscount: totalItems = 20, subtotal = 100 -> discount = 7', () => {
    const result = engine.calculateVolumeDiscount(20, 100);
    expect(result).toBe(7);
  });

  test('(M8) calculateVolumeDiscount: totalItems = 30, subtotal = 100 -> discount = 10', () => {
    const result = engine.calculateVolumeDiscount(30, 100);
    expect(result).toBe(10);
  });

  test('(M9) calculateLoyaltyPoints: totalAmount = 100 -> 10 puncte, fara bonus', () => {
    const result = engine.calculateLoyaltyPoints(100);
    expect(result).toBe(10);
  });

  test('(M10) calculateLoyaltyPoints: totalAmount = 50 -> 5 puncte (floor(50/10))', () => {
    const result = engine.calculateLoyaltyPoints(50);
    expect(result).toBe(5);
  });
});
