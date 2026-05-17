#!/usr/bin/env node

/**
 * Demo script for TSS Project - Shopping Cart + Pricing Engine
 * Run: node demo.js
 * 
 * Demonstrates all key functionality with formatted output.
 * Designed to be recorded for the project presentation.
 */

const ShoppingCart = require('./src/ShoppingCart');
const PricingEngine = require('./src/PricingEngine');

// ─── Helpers ────────────────────────────────────────────────────────────────

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[2m';

function section(title) {
  console.log('\n');
  console.log(`${CYAN}${'═'.repeat(70)}${RESET}`);
  console.log(`${CYAN}  ${BOLD}${title}${RESET}`);
  console.log(`${CYAN}${'═'.repeat(70)}${RESET}`);
  console.log('');
}

function subsection(title) {
  console.log(`\n  ${YELLOW}▸ ${title}${RESET}\n`);
}

function showCode(code) {
  console.log(`    ${DIM}// ${code}${RESET}`);
}

function showResult(label, value) {
  const formatted = typeof value === 'object' ? JSON.stringify(value, null, 4).split('\n').join('\n      ') : value;
  console.log(`    ${GREEN}${label}:${RESET} ${formatted}`);
}

function showError(label, error) {
  console.log(`    ${RED}✗ ${label}:${RESET} ${error}`);
}

function pause(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Demo Flow ──────────────────────────────────────────────────────────────

async function runDemo() {
  
  await pause(500);

  // ─── SECTION 1: Shopping Cart ───
  section('1. DEMO: ShoppingCart — Operatii de baza');
  
  const cart = new ShoppingCart();

  subsection('Adaugare produse in cos');
  
  showCode("cart.addItem('Laptop ASUS', 2499.99, 1, 'electronics')");
  cart.addItem('Laptop ASUS', 2499.99, 1, 'electronics');
  showResult('Adaugat', 'Laptop ASUS — 2499.99 RON x1 (electronics)');
  
  await pause(800);
  
  showCode("cart.addItem('Tricou Nike', 89.99, 3, 'clothing')");
  cart.addItem('Tricou Nike', 89.99, 3, 'clothing');
  showResult('Adaugat', 'Tricou Nike — 89.99 RON x3 (clothing)');
  
  await pause(800);
  
  showCode("cart.addItem('Clean Code', 45.00, 2, 'books')");
  cart.addItem('Clean Code', 45.00, 2, 'books');
  showResult('Adaugat', 'Clean Code — 45.00 RON x2 (books)');
  
  await pause(800);
  
  showCode("cart.addItem('Banane', 12.50, 5, 'food')");
  cart.addItem('Banane', 12.50, 5, 'food');
  showResult('Adaugat', 'Banane — 12.50 RON x5 (food)');

  await pause(1000);
  
  subsection('Starea curenta a cosului');
  
  showCode('cart.getSummary()');
  const summary = cart.getSummary();
  showResult('Produse unice', summary.uniqueItems);
  showResult('Total articole', summary.totalItems);
  showResult('Subtotal', summary.subtotal + ' RON');
  
  await pause(1500);

  subsection('Cel mai scump / ieftin produs');
  
  showCode('cart.getMostExpensiveItem()');
  const expensive = cart.getMostExpensiveItem();
  showResult('Cel mai scump', `${expensive.name} — ${expensive.price} RON`);
  
  showCode('cart.getCheapestItem()');
  const cheapest = cart.getCheapestItem();
  showResult('Cel mai ieftin', `${cheapest.name} — ${cheapest.price} RON`);

  await pause(1500);

  // ─── SECTION 2: Validation ───
  section('2. DEMO: Validari — Respingere input invalid');

  subsection('Nume produs invalid');
  
  showCode("cart.addItem('', 100, 1, 'electronics')");
  try { cart.addItem('', 100, 1, 'electronics'); }
  catch (e) { showError('Respins', e.message); }
  
  await pause(600);
  
  showCode("cart.addItem(null, 100, 1, 'electronics')");
  try { cart.addItem(null, 100, 1, 'electronics'); }
  catch (e) { showError('Respins', e.message); }

  await pause(800);

  subsection('Pret invalid');
  
  showCode("cart.addItem('Test', -5, 1, 'electronics')");
  try { cart.addItem('Test', -5, 1, 'electronics'); }
  catch (e) { showError('Respins', e.message); }
  
  await pause(600);
  
  showCode("cart.addItem('Test', 0, 1, 'electronics')");
  try { cart.addItem('Test', 0, 1, 'electronics'); }
  catch (e) { showError('Respins', e.message); }

  await pause(800);

  subsection('Cantitate invalida');
  
  showCode("cart.addItem('Test', 100, 51, 'electronics')");
  try { cart.addItem('Test', 100, 51, 'electronics'); }
  catch (e) { showError('Respins', e.message); }
  
  await pause(600);
  
  showCode("cart.addItem('Test', 100, 3.5, 'electronics')");
  try { cart.addItem('Test', 100, 3.5, 'electronics'); }
  catch (e) { showError('Respins', e.message); }

  await pause(800);

  subsection('Categorie invalida');
  
  showCode("cart.addItem('Test', 100, 1, 'toys')");
  try { cart.addItem('Test', 100, 1, 'toys'); }
  catch (e) { showError('Respins', e.message); }

  await pause(1500);

  // ─── SECTION 3: PricingEngine ───
  section('3. DEMO: PricingEngine — Calcule preturi');

  const engine = new PricingEngine();

  subsection('Calcul taxe per categorie');
  
  showCode("engine.calculateItemTax(2499.99, 1, 'electronics')  // 19%");
  showResult('Taxa electronics', engine.calculateItemTax(2499.99, 1, 'electronics') + ' RON');
  
  showCode("engine.calculateItemTax(89.99, 3, 'clothing')       // 9%");
  showResult('Taxa clothing', engine.calculateItemTax(89.99, 3, 'clothing') + ' RON');
  
  showCode("engine.calculateItemTax(45, 2, 'books')             // 5%");
  showResult('Taxa books', engine.calculateItemTax(45, 2, 'books') + ' RON');

  await pause(1200);

  subsection('Calcul transport');
  
  showCode('engine.calculateShipping(150)   // sub 200 RON');
  showResult('Transport (150 RON)', engine.calculateShipping(150) + ' RON (standard)');
  
  showCode('engine.calculateShipping(250)   // peste 200 RON');
  showResult('Transport (250 RON)', engine.calculateShipping(250) + ' RON (gratuit!)');
  
  showCode("engine.calculateShipping(150, 'express')");
  showResult('Transport express', engine.calculateShipping(150, 'express') + ' RON');

  await pause(1200);

  subsection('Reduceri pe volum (11 articole in cos)');
  
  showCode('engine.calculateVolumeDiscount(11, 2000)  // 11 items -> 5%');
  showResult('Reducere volum', engine.calculateVolumeDiscount(11, 2000) + ' RON (5% din 2000)');

  await pause(1200);

  subsection('Puncte de fidelitate');
  
  showCode('engine.calculateLoyaltyPoints(350)');
  showResult('Puncte fidelitate (350 RON)', engine.calculateLoyaltyPoints(350) + ' puncte (35 + 20 bonus)');

  await pause(1500);

  // ─── SECTION 4: Full Calculation ───
  section('4. DEMO: Calcul total final (cu cupon)');

  subsection('Aplicare cupon SAVE10 (10% reducere)');
  
  showCode("cart.setCoupon('SAVE10')");
  cart.setCoupon('SAVE10');
  showResult('Cupon aplicat', 'SAVE10');

  await pause(800);

  subsection('Calcul total complet');
  
  showCode('engine.calculateTotal(cart)');
  const total = engine.calculateTotal(cart);
  
  console.log('');
  console.log(`    ${BOLD}┌─────────────────────────────────────────┐${RESET}`);
  console.log(`    ${BOLD}│  REZUMAT COMANDA                        │${RESET}`);
  console.log(`    ${BOLD}├─────────────────────────────────────────┤${RESET}`);
  console.log(`    │  Subtotal:          ${String(total.subtotal).padStart(10)} RON  │`);
  console.log(`    │  Reducere volum:   -${String(total.volumeDiscount).padStart(10)} RON  │`);
  console.log(`    │  Reducere cupon:   -${String(total.couponDiscount).padStart(10)} RON  │`);
  console.log(`    │  ─────────────────────────────────────  │`);
  console.log(`    │  Total reduceri:   -${String(total.savings).padStart(10)} RON  │`);
  console.log(`    │  Taxa:             +${String(total.tax).padStart(10)} RON  │`);
  console.log(`    │  Transport:        +${String(total.shipping).padStart(10)} RON  │`);
  console.log(`    ${BOLD}├─────────────────────────────────────────┤${RESET}`);
  console.log(`    ${BOLD}│  TOTAL:             ${String(total.total).padStart(10)} RON  │${RESET}`);
  console.log(`    ${BOLD}│  Puncte fidelitate: ${String(total.loyaltyPoints).padStart(10)}       │${RESET}`);
  console.log(`    ${BOLD}└─────────────────────────────────────────┘${RESET}`);

  await pause(2000);

  // ─── SECTION 5: Buy X Get Y Free ───
  section('5. DEMO: Promotie Buy 2 Get 1 Free');

  subsection('Aplicare pe cosul curent (11 articole)');
  
  showCode('engine.applyBuyXGetYFree(cart.items, 2, 1)');
  const promoDiscount = engine.applyBuyXGetYFree(cart.items, 2, 1);
  showResult('Reducere promotie', promoDiscount + ' RON (3 articole gratuite — cele mai ieftine)');

  await pause(2000);

  // ─── END ───
  console.log('');
}

runDemo().catch(console.error);
