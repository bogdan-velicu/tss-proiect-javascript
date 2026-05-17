// =========================================================================
// Teste generate de AI folosind PROMPTURI TINTITE pe metodologie (iteratie 2).
// 5 prompts mai detaliate, fiecare cu instructiuni explicite pas-cu-pas,
// constante reale, semnaturi exacte si exemple. Trei platforme distincte:
//
//   P1 — Clase de echivalenta (EP) pe addItem        → ChatGPT (gpt-5)
//   P2 — BVA pe calculateShipping                    → ChatGPT (gpt-5)
//   P3 — Statement/Branch coverage pe addItem        → Google Gemini
//   P4 — MC/DC pe calculateShipping                  → ChatGPT (gpt-5)
//   P5 — Mutation testing tintit (10 mutanti)        → Claude Sonnet 4.6
//
// Codul este verbatim din raspunsurile AI (cu mici curatari de format).
//
// Capturi de ecran cu prompturile + raspunsurile: screenshots/ai-prompts/
// =========================================================================

const ShoppingCart = require('../src/ShoppingCart');
const PricingEngine = require('../src/PricingEngine');

// -------------------------------------------------------------------------
// P1 (ChatGPT) — Clase de echivalenta pentru addItem
// Screenshot: screenshots/ai-prompts/prompt1_ep_addItem.png
// -------------------------------------------------------------------------

describe('addItem - partitionare in clase de echivalenta', () => {
  let cart;

  beforeEach(() => {
    cart = new ShoppingCart();
  });

  // Clasa: N1 + P2 + Q1 + C1
  test('G1 - input complet valid (categorie valida)', () => {
    expect(() => cart.addItem("Telefon", 199.99, 2, "electronics")).not.toThrow();
  });

  // Clasa: N1 + P2 + Q1 + C2
  test('G2 - input valid cu categorie null', () => {
    expect(() => cart.addItem("Tricou", 49.99, 1, null)).not.toThrow();
  });

  // Clasa: N2 + P2 + Q1 + C1
  test('G3 - name gol arunca eroare', () => {
    expect(() => cart.addItem("   ", 100, 1, "clothing")).toThrow();
  });

  // Clasa: N3 + P2 + Q1 + C1
  test('G4 - name non-string arunca eroare', () => {
    expect(() => cart.addItem(123, 100, 1, "food")).toThrow();
  });

  // Clasa: N1 + P1 + Q1 + C1
  test('G5 - price prea mic arunca eroare', () => {
    expect(() => cart.addItem("Carte", 0, 1, "books")).toThrow();
  });

  // Clasa: N1 + P3 + Q1 + C1
  test('G6 - price prea mare arunca eroare', () => {
    expect(() => cart.addItem("Laptop", 1000000, 1, "electronics")).toThrow();
  });

  // Clasa: N1 + P4 + Q1 + C1
  test('G7 - price non-number arunca eroare', () => {
    expect(() => cart.addItem("Mouse", "100", 1, "electronics")).toThrow();
  });

  // Clasa: N1 + P2 + Q2 + C1
  test('G8 - quantity sub limita arunca eroare', () => {
    expect(() => cart.addItem("Paine", 5, 0, "food")).toThrow();
  });

  // Clasa: N1 + P2 + Q3 + C1
  test('G9 - quantity peste limita arunca eroare', () => {
    expect(() => cart.addItem("Hanorac", 120, 51, "clothing")).toThrow();
  });

  // Clasa: N1 + P2 + Q4 + C1
  test('G10 - quantity non-integer arunca eroare', () => {
    expect(() => cart.addItem("Casti", 80, 2.5, "electronics")).toThrow();
  });

  // Clasa: N1 + P2 + Q5 + C1
  test('G11 - quantity non-number arunca eroare', () => {
    expect(() => cart.addItem("Revista", 15, "3", "books")).toThrow();
  });

  // Clasa: N1 + P2 + Q1 + C3
  test('G12 - categorie invalida arunca eroare', () => {
    expect(() => cart.addItem("Jucarie", 25, 1, "toys")).toThrow();
  });

  // Clasa: N1 + P2 + Q1 + C4
  test('G13 - categorie non-string arunca eroare', () => {
    expect(() => cart.addItem("Pix", 3, 1, 123)).toThrow();
  });
});

// -------------------------------------------------------------------------
// P2 (ChatGPT) — BVA pentru calculateShipping
// Screenshot: screenshots/ai-prompts/prompt2_bva_shipping.png
// -------------------------------------------------------------------------

describe('calculateShipping - analiza valori de frontiera', () => {
  let engine;

  beforeEach(() => {
    engine = new PricingEngine();
  });

  describe('Pragul subtotal = 0', () => {

    // Prag: 0, Pozitie: prag-ε
    test('BVA subtotal=-0.01, standard -> error', () => {
      expect(() => engine.calculateShipping(-0.01, 'standard')).toThrow();
    });

    // Prag: 0, Pozitie: prag-ε
    test('BVA subtotal=-0.01, express -> error', () => {
      expect(() => engine.calculateShipping(-0.01, 'express')).toThrow();
    });

    // Prag: 0, Pozitie: prag
    test('BVA subtotal=0, standard -> 15', () => {
      expect(engine.calculateShipping(0, 'standard')).toBe(15);
    });

    // Prag: 0, Pozitie: prag
    test('BVA subtotal=0, express -> 30', () => {
      expect(engine.calculateShipping(0, 'express')).toBe(30);
    });

    // Prag: 0, Pozitie: prag+ε
    test('BVA subtotal=0.01, standard -> 15', () => {
      expect(engine.calculateShipping(0.01, 'standard')).toBe(15);
    });

    // Prag: 0, Pozitie: prag+ε
    test('BVA subtotal=0.01, express -> 30', () => {
      expect(engine.calculateShipping(0.01, 'express')).toBe(30);
    });
  });

  describe('Pragul subtotal = 200', () => {

    // Prag: 200, Pozitie: prag-ε
    test('BVA subtotal=199.99, standard -> 15', () => {
      expect(engine.calculateShipping(199.99, 'standard')).toBe(15);
    });

    // Prag: 200, Pozitie: prag-ε
    test('BVA subtotal=199.99, express -> 30', () => {
      expect(engine.calculateShipping(199.99, 'express')).toBe(30);
    });

    // Prag: 200, Pozitie: prag
    test('BVA subtotal=200, standard -> 0', () => {
      expect(engine.calculateShipping(200, 'standard')).toBe(0);
    });

    // Prag: 200, Pozitie: prag
    test('BVA subtotal=200, express -> 30', () => {
      expect(engine.calculateShipping(200, 'express')).toBe(30);
    });

    // Prag: 200, Pozitie: prag+ε
    test('BVA subtotal=200.01, standard -> 0', () => {
      expect(engine.calculateShipping(200.01, 'standard')).toBe(0);
    });

    // Prag: 200, Pozitie: prag+ε
    test('BVA subtotal=200.01, express -> 30', () => {
      expect(engine.calculateShipping(200.01, 'express')).toBe(30);
    });
  });

  describe('Valori invalide', () => {

    test('subtotal negativ arunca eroare', () => {
      expect(() => engine.calculateShipping(-1, 'standard')).toThrow();
    });

    test('shippingType invalid arunca eroare', () => {
      expect(() => engine.calculateShipping(100, 'invalid')).toThrow();
    });
  });
});

// -------------------------------------------------------------------------
// P3 (Gemini) — Statement / Branch Coverage pentru addItem (5 cai CFG)
// Screenshot: screenshots/ai-prompts/prompt3_scbc_addItem.png
// -------------------------------------------------------------------------

describe('addItem - statement si branch coverage pe cele 5 cai CFG', () => {
  let cart;

  beforeEach(() => {
    cart = new ShoppingCart();
  });

  // Cale P1: D1=N/A, D2=N/A, D3=N/A
  test('P1 - validateItem arunca eroare', () => {
    expect(() => cart.addItem('', 100, 1, 'electronics')).toThrow();
  });

  // Cale P2: D1=true, D2=N/A, D3=N/A
  test('P2 - depasire MAX_ITEMS cart full', () => {
    expect(() => cart.addItem('laptop', 1000, 101, 'electronics')).toThrow();
  });

  // Cale P3: D1=false, D2=true, D3=true
  test('P3 - depasire MAX_QUANTITY_PER_ITEM qty overflow', () => {
    cart.addItem('laptop', 1000, 40, 'electronics');
    expect(() => cart.addItem('laptop', 1000, 15, 'electronics')).toThrow();
  });

  // Cale P4: D1=false, D2=true, D3=false
  test('P4 - update produs existent', () => {
    cart.addItem('apa', 5, 10, 'food');
    const result = cart.addItem('apa', 5, 5, 'food');
    expect(result.quantity).toBe(15);
  });

  // Cale P5: D1=false, D2=false, D3=N/A
  test('P5 - adauga produs nou', () => {
    const result = cart.addItem('carte', 50, 1, 'books');
    expect(result.name).toBe('carte');
    expect(result.quantity).toBe(1);
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

describe('calculateShipping - MC/DC pentru standard && subtotal >= 200', () => {
  let engine;

  beforeEach(() => {
    engine = new PricingEngine();
  });

  // Pereche pentru: C1 cu t3 / C2 cu t2
  test('MC/DC t1: C1=T, C2=T, D=T -> 0', () => {
    const result = engine.calculateShipping(250, 'standard');
    expect(result).toBe(0);
  });

  // Pereche pentru: C2 cu t1
  test('MC/DC t2: C1=T, C2=F, D=F -> 15', () => {
    const result = engine.calculateShipping(150, 'standard');
    expect(result).toBe(15);
  });

  // Pereche pentru: C1 cu t1
  test('MC/DC t3: C1=F, C2=T, D=F -> 30', () => {
    const result = engine.calculateShipping(250, 'express');
    expect(result).toBe(30);
  });
});

// -------------------------------------------------------------------------
// P5 (Claude) — Teste tintite pentru 10 mutanti din PricingEngine
// Screenshot: screenshots/ai-prompts/prompt5_mutants.png
// -------------------------------------------------------------------------

describe('PricingEngine - teste pentru omorat mutanti supravietuitori', () => {
  let engine;

  beforeEach(() => {
    engine = new PricingEngine();
  });

  // Omoara: price < 0 vs price <= 0
  test('(M1) calculateItemTax: price=0 → tax = 0 (zero este valid)', () => {
    expect(engine.calculateItemTax(0, 1, 'electronics')).toBe(0);
  });

  // Omoara: quantity < 1 vs quantity <= 1
  test('(M2) calculateItemTax: quantity=1 → tax = 19 (quantity=1 este valid)', () => {
    expect(engine.calculateItemTax(100, 1, 'electronics')).toBe(19);
  });

  // Omoara: subtotal < 0 vs subtotal <= 0
  test('(M3) calculateShipping: subtotal=0 → returneaza 15 (STANDARD_COST)', () => {
    expect(engine.calculateShipping(0, 'standard')).toBe(15);
  });

  // Omoara: percentage > 100 vs percentage >= 100
  test('(M4) applyPercentageDiscount: percentage=100 → returneaza 250 (100% este acceptat)', () => {
    expect(engine.applyPercentageDiscount(250, 100)).toBe(250);
  });

  // Omoara: discount > amount vs discount >= amount
  test('(M5) applyFixedDiscount: amount=100, discount=100 → returneaza 100', () => {
    expect(engine.applyFixedDiscount(100, 100)).toBe(100);
  });

  // Omoara: totalItems >= 5 vs totalItems > 5
  test('(M6) calculateVolumeDiscount: totalItems=5, subtotal=100 → returneaza 2 (2% din 100)', () => {
    expect(engine.calculateVolumeDiscount(5, 100)).toBe(2);
  });

  // Omoara: totalItems >= 20 vs totalItems > 20
  test('(M7) calculateVolumeDiscount: totalItems=20, subtotal=100 → returneaza 7 (7% din 100)', () => {
    expect(engine.calculateVolumeDiscount(20, 100)).toBe(7);
  });

  // Omoara: totalItems >= 30 vs totalItems > 30
  test('(M8) calculateVolumeDiscount: totalItems=30, subtotal=100 → returneaza 10 (10% din 100)', () => {
    expect(engine.calculateVolumeDiscount(30, 100)).toBe(10);
  });

  // Omoara: totalAmount >= 100 vs totalAmount > 100
  test('(M9) calculateLoyaltyPoints: totalAmount=100 → returneaza 20 (10 base + 10 bonus la 100)', () => {
    expect(engine.calculateLoyaltyPoints(100)).toBe(20);
  });

  // Omoara: Math.floor(amount/10) vs Math.floor(amount/11)
  test('(M10) calculateLoyaltyPoints: totalAmount=50 → returneaza 5 (50/10=5, fara bonus)', () => {
    expect(engine.calculateLoyaltyPoints(50)).toBe(5);
  });
});
