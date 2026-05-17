#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════
# TSS Project — Animated Terminal Presentation
#
# Simulates typing commands, animates output line by line.
# Just run and record. No interaction needed.
#
# Usage: ./demo.sh [typing_speed] [output_speed]
#   typing_speed: delay per character (default: 0.04)
#   output_speed: delay per output line (default: 0.05)
#
# Tip: increase terminal font to ~18pt before recording
# ═══════════════════════════════════════════════════════════════════════

TYPE_DELAY="${1:-0.04}"
CHUNK_PAUSE="${2:-0.7}"
PAUSE_SHORT=1.2
PAUSE_MED=2.0
PAUSE_LONG=3.0

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'

# ─── Core animation functions ────────────────────────────────────────

# Simulate typing a command
type_cmd() {
  local cmd="$1"
  printf "${GREEN}\$ ${RESET}"
  for (( i=0; i<${#cmd}; i++ )); do
    printf "%s" "${cmd:$i:1}"
    sleep "$TYPE_DELAY"
  done
  printf "\n"
  sleep 0.3
}

# Print output in chunks. A "chunk" = consecutive non-empty lines.
# Blank lines separate chunks. Each chunk prints fast, then pauses.
chunked() {
  local buffer=""
  local line_count=0
  while IFS= read -r line; do
    if [[ -z "$line" || "$line" =~ ^[[:space:]]*$ ]]; then
      # End of chunk — flush buffer, pause
      if [[ -n "$buffer" ]]; then
        printf "%s" "$buffer"
        buffer=""
        line_count=0
        sleep "$CHUNK_PAUSE"
      fi
      echo ""
    else
      buffer+="$line"$'\n'
      ((line_count++))
      # Also flush every 8 lines for dense output (like test results)
      if (( line_count >= 8 )); then
        printf "%s" "$buffer"
        buffer=""
        line_count=0
        sleep "$CHUNK_PAUSE"
      fi
    fi
  done
  # Flush remaining
  if [[ -n "$buffer" ]]; then
    printf "%s" "$buffer"
    sleep "$CHUNK_PAUSE"
  fi
}

# Run command, capture output, print in chunks
run_chunked() {
  type_cmd "$1"
  eval "$1" 2>&1 | chunked
  echo ""
}

# Run command with live output (for long-running like stryker)
run_live() {
  type_cmd "$1"
  eval "$1"
  echo ""
}

# Print a comment line
comment() {
  echo -e "  ${DIM}# $1${RESET}"
  sleep 0.4
}

# Section divider
section() {
  echo ""
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
  echo -e "${CYAN}  ${BOLD}$1${RESET}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
  echo ""
  sleep "$PAUSE_SHORT"
}

wait_sec() {
  sleep "${1:-$PAUSE_MED}"
}

# ═══════════════════════════════════════════════════════════════════════
# PRESENTATION
# ═══════════════════════════════════════════════════════════════════════

clear
sleep 1

# ─── Part 1: Project structure ───
section "Structura proiectului"

comment "Codul sursa"
run_chunked "ls src/"

wait_sec "$PAUSE_SHORT"

comment "Teste — 5 fisiere, 5 strategii"
run_chunked "ls tests/"

wait_sec "$PAUSE_SHORT"

comment "Configurari"
run_chunked "ls jest.config.js stryker.config.js package.json"

wait_sec "$PAUSE_MED"

# ─── Part 2: App Demo ───
section "Demo aplicatie — ShoppingCart + PricingEngine"

type_cmd "node"
sleep 0.5

# Node inline demo with animated output
node -e "
const ShoppingCart = require('./src/ShoppingCart');
const PricingEngine = require('./src/PricingEngine');

const cart = new ShoppingCart();
const engine = new PricingEngine();

const lines = [];
const G = '\x1b[32m', R = '\x1b[31m', Y = '\x1b[33m';
const D = '\x1b[2m', B = '\x1b[1m', X = '\x1b[0m';

function out(s) { lines.push(s); }
function code(s) { out(D + '> ' + s + X); }
function result(label, val) { out(G + '  → ' + X + label + ': ' + B + val + X); }
function err(msg) { out(R + '  ✗ ' + X + msg); }
function blank() { out(''); }
function heading(s) { blank(); out(Y + '  ▸ ' + s + X); blank(); }

// -- Add items --
heading('Adaugare produse in cos');

code(\"cart.addItem('Laptop ASUS', 2499.99, 1, 'electronics')\");
cart.addItem('Laptop ASUS', 2499.99, 1, 'electronics');
result('Adaugat', 'Laptop ASUS — 2499.99 RON x1 (electronics)');
blank();

code(\"cart.addItem('Tricou Nike', 89.99, 3, 'clothing')\");
cart.addItem('Tricou Nike', 89.99, 3, 'clothing');
result('Adaugat', 'Tricou Nike — 89.99 RON x3 (clothing)');
blank();

code(\"cart.addItem('Clean Code', 45.00, 2, 'books')\");
cart.addItem('Clean Code', 45.00, 2, 'books');
result('Adaugat', 'Clean Code — 45.00 RON x2 (books)');
blank();

code(\"cart.addItem('Banane', 12.50, 5, 'food')\");
cart.addItem('Banane', 12.50, 5, 'food');
result('Adaugat', 'Banane — 12.50 RON x5 (food)');
blank();

code('cart.getSummary()');
const s = cart.getSummary();
result('Produse unice', String(s.uniqueItems));
result('Total articole', String(s.totalItems));
result('Subtotal', s.subtotal + ' RON');
blank();

// -- Validation --
heading('Validari — input invalid respins');

code(\"cart.addItem('', 100, 1, 'electronics')\");
try { cart.addItem('', 100, 1, 'electronics'); } catch(e) { err(e.message); }
blank();

code(\"cart.addItem('Test', -5, 1, 'electronics')\");
try { cart.addItem('Test', -5, 1, 'electronics'); } catch(e) { err(e.message); }
blank();

code(\"cart.addItem('Test', 100, 51, 'electronics')\");
try { cart.addItem('Test', 100, 51, 'electronics'); } catch(e) { err(e.message); }
blank();

code(\"cart.addItem('Test', 100, 3.5, 'electronics')\");
try { cart.addItem('Test', 100, 3.5, 'electronics'); } catch(e) { err(e.message); }
blank();

code(\"cart.addItem('Test', 100, 1, 'toys')\");
try { cart.addItem('Test', 100, 1, 'toys'); } catch(e) { err(e.message); }
blank();

// -- Pricing --
heading('PricingEngine — taxe, transport, reduceri');

code(\"engine.calculateItemTax(2499.99, 1, 'electronics')  // rata 19%\");
result('Taxa', engine.calculateItemTax(2499.99, 1, 'electronics') + ' RON');
code(\"engine.calculateItemTax(89.99, 3, 'clothing')       // rata 9%\");
result('Taxa', engine.calculateItemTax(89.99, 3, 'clothing') + ' RON');
blank();

code('engine.calculateShipping(150)    // sub prag 200 RON');
result('Transport', engine.calculateShipping(150) + ' RON');
code('engine.calculateShipping(250)    // peste prag');
result('Transport', engine.calculateShipping(250) + ' RON (gratuit)');
code(\"engine.calculateShipping(150, 'express')\");
result('Transport express', engine.calculateShipping(150, 'express') + ' RON');
blank();

code('engine.calculateVolumeDiscount(11, 2000)  // 5% la 10+ items');
result('Reducere volum', engine.calculateVolumeDiscount(11, 2000) + ' RON');
blank();

code('engine.calculateLoyaltyPoints(350)');
result('Puncte fidelitate', engine.calculateLoyaltyPoints(350) + ' (35 base + 20 bonus)');

// -- Full calculation --
heading('Calcul total final cu cupon');

code(\"cart.setCoupon('SAVE10')\");
cart.setCoupon('SAVE10');
result('Cupon aplicat', 'SAVE10 (10% reducere)');
blank();

code('engine.calculateTotal(cart)');
const t = engine.calculateTotal(cart);
blank();

function row(label, val) {
  return '  │ ' + (label + val).padEnd(42) + ' │';
}
function brow(label, val) {
  return B + '  │ ' + (label + val).padEnd(42) + ' │' + X;
}

out(B + '  ┌────────────────────────────────────────────┐' + X);
out(B + '  │          REZUMAT COMANDA                   │' + X);
out(B + '  ├────────────────────────────────────────────┤' + X);
out(row('Subtotal:            ', t.subtotal.toFixed(2) + ' RON'));
out(row('Reducere volum:     -', t.volumeDiscount.toFixed(2) + ' RON'));
out(row('Reducere cupon:     -', t.couponDiscount.toFixed(2) + ' RON'));
out(row('Taxa:               +', t.tax.toFixed(2) + ' RON'));
out(row('Transport:          +', t.shipping.toFixed(2) + ' RON'));
out(B + '  ├────────────────────────────────────────────┤' + X);
out(brow('TOTAL:               ', t.total.toFixed(2) + ' RON'));
out(brow('Puncte fidelitate:   ', String(t.loyaltyPoints)));
out(brow('Economie totala:     ', t.savings.toFixed(2) + ' RON'));
out(B + '  └────────────────────────────────────────────┘' + X);

blank();
code('.exit');

// Print all lines with blank line separators between chunks
lines.forEach(l => console.log(l));
" | chunked

wait_sec "$PAUSE_LONG"

# ─── Part 3: Run tests ───
section "Rulare teste — 309 teste, 5 strategii"

comment "5 fisiere: equivalencePartitioning, boundaryValue, coverage, conditionPath, mutation"
run_chunked "npm test"

wait_sec "$PAUSE_LONG"

# ─── Part 4: Coverage ───
section "Acoperire cod — Statement & Branch Coverage"

comment "Jest genereaza raport de acoperire"
run_chunked "npm run test:coverage"

wait_sec "$PAUSE_LONG"

# ─── Part 5: Mutation testing ───
section "Mutation Testing — Stryker Mutator"

comment "~568 mutanti generati, verificam cati sunt detectati de teste"
run_live "npm run mutate"

wait_sec "$PAUSE_LONG"

# ─── End ───
section "Rezultate"

{
  echo -e "  ${GREEN}✓${RESET} 309 teste"
  echo ""
  echo -e "  ${GREEN}✓${RESET} 100% statement coverage"
  echo ""
  echo -e "  ${GREEN}✓${RESET} 98.91% branch coverage"
  echo ""
  echo -e "  ${GREEN}✓${RESET} 90.32% mutation score (511/568)"
  echo ""
} | chunked

echo ""
echo -e "  ${DIM}# Rapoarte HTML disponibile:${RESET}"
echo -e "  ${CYAN}coverage/lcov-report/index.html${RESET}"
echo -e "  ${CYAN}reports/mutation/mutation.html${RESET}"
echo ""
sleep 3
