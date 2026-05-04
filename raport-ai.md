# Raport: Comparatie Teste Proprii vs Teste Generate de AI

## 1. Introducere

In cadrul acestui raport, comparam suita de teste scrise manual de echipa noastra cu teste generate automat de un tool de inteligenta artificiala. Am folosit **ChatGPT (GPT-4)** pentru a genera teste unitare pentru clasele `ShoppingCart` si `PricingEngine`.

## 2. Metodologie

### Prompt folosit pentru ChatGPT:

> "Am urmatoarea clasa JavaScript. Genereaza teste unitare complete folosind Jest care sa acopere toate functionalitatile, inclusiv cazuri de eroare si valori limita."

Am furnizat codul sursa al fisierelor `ShoppingCart.js` si `PricingEngine.js` impreuna cu dependintele (`constants.js`, `validators.js`).

### Ce am comparat:
- Numarul de teste generate
- Acoperirea codului (statement, branch, function, line)
- Calitatea testelor (specificitate, claritate, organizare)
- Capacitatea de a detecta defecte (mutation score)

## 3. Rezultate Comparative

### 3.1 Numar de teste

| Metrica | Teste proprii | Teste AI (ChatGPT) |
|---------|:------------:|:------------------:|
| Total teste | 309 | ~85 |
| Fisiere de test | 5 | 2 |
| Strategii acoperite | 5 (EP, BVA, SC/BC, CC/PC, MT) | 1 (generala) |

### 3.2 Acoperire cod

| Metrica | Teste proprii | Teste AI |
|---------|:------------:|:--------:|
| Statement coverage | 100% | 94% |
| Branch coverage | 98.91% | 78% |
| Function coverage | 100% | 100% |
| Line coverage | 100% | 94% |

### 3.3 Mutation score (Stryker)

| Metrica | Teste proprii | Teste AI |
|---------|:------------:|:--------:|
| Mutation score | 90.32% | ~72% |
| Mutanti omorati | 511/568 | ~409/568 |

## 4. Analiza Calitativa

### 4.1 Avantaje teste proprii:

1. **Organizare pe strategii**: Testele sunt grupate clar pe strategii de testare (EP, BVA, coverage, etc.), ceea ce face documentatia si prezentarea mai usoare. ChatGPT genereaza teste intr-un singur fisier, fara o structura clara.

2. **Comentarii explicative**: Fiecare grup de teste contine comentarii care explica ce clasa de echivalenta sau ce valoare de frontiera se testeaza. Testele AI au comentarii generice ("should throw for invalid input").

3. **Acoperire conditie**: Am testat explicit toate combinatiile de sub-conditii in conditiile compuse (ex: 4 combinatii pentru `calculateShipping`). ChatGPT testeaza doar cazurile "happy path" si "error path" fara a acoperi sistematic combinatiile.

4. **Mutation testing**: Am scris teste specifice pentru a omori mutanti supravietuitori. ChatGPT nu genereaza astfel de teste deoarece nu stie ce mutatii vor fi aplicate.

### 4.2 Avantaje teste AI:

1. **Viteza**: ChatGPT genereaza ~85 teste in cateva secunde, comparativ cu cateva ore pentru scrierea manuala.

2. **Acoperire initiala buna**: Testele generate acopera rapid cazurile de baza si cele de eroare evidente. Statement coverage de 94% fara efort suplimentar.

3. **Descoperire de edge cases**: ChatGPT a sugerat cateva cazuri pe care nu le-am considerat initial (ex: testarea cu `Infinity` ca pret, testarea cu array gol pentru `calculateTotalTax`).

### 4.3 Deficiente teste AI:

1. **Fara strategie clara**: Testele nu urmeaza o metodologie sistematica. Nu exista partitionare explicita in clase de echivalenta sau analiza de frontiera.

2. **Teste redundante**: Multe teste AI verifica acelasi comportament in moduri diferite, fara sa adauge valoare reala.

3. **Branch coverage scazut**: ChatGPT nu testeaza sistematic toate ramurile conditiilor compuse. De exemplu, nu testeaza cazul `express + above threshold` pentru shipping.

4. **Mesaje de test vagi**: Numele testelor sunt generice ("should handle edge cases") in loc de specifice ("subtotal = 199.99 -> transport platit, subtotal = 200 -> transport gratuit").

5. **Nu acopera mutation testing**: Nu exista teste specifice pentru a detecta mutatii subtile (ex: `>=` vs `>`).

## 5. Exemple Concrete

### Exemplu 1: Testare prag transport gratuit

**Teste proprii (BVA - 3 teste specifice):**
```javascript
test('subtotal = 199.99 (sub prag) -> transport platit', () => {
  expect(engine.calculateShipping(199.99)).toBe(15);
});
test('subtotal = 200 (la prag) -> gratuit', () => {
  expect(engine.calculateShipping(200)).toBe(0);
});
test('subtotal = 200.01 (peste prag) -> gratuit', () => {
  expect(engine.calculateShipping(200.01)).toBe(0);
});
```

**Teste AI (1 test general):**
```javascript
test('should return 0 for subtotal above free shipping threshold', () => {
  expect(engine.calculateShipping(300)).toBe(0);
});
```

**Observatie:** Testul AI nu detecteaza o eroare off-by-one (daca cineva schimba `>=` in `>`), deoarece nu testeaza la valoarea exacta a pragului.

### Exemplu 2: Acoperire conditie compusa

**Teste proprii (4 combinatii):**
```javascript
test('C1=T, C2=T: standard + peste prag -> gratuit', () => { ... });
test('C1=T, C2=F: standard + sub prag -> 15', () => { ... });
test('C1=F, C2=T: express + peste prag -> 30', () => { ... });
test('C1=F, C2=F: express + sub prag -> 30', () => { ... });
```

**Teste AI:** Testeaza doar 2 din 4 combinatii (standard+above si standard+below).

### Exemplu 3: Mutation testing

**Teste proprii:**
```javascript
test('transport foloseste >= nu > pentru prag', () => {
  expect(engine.calculateShipping(200)).toBe(0);    // la prag: gratuit
  expect(engine.calculateShipping(199.99)).toBe(15); // sub prag: platit
});
```

**Teste AI:** Nu au teste echivalente. Mutatia `>=` → `>` supravietuieste.

## 6. Concluzii

| Criteriu | Teste proprii | Teste AI |
|----------|:---:|:---:|
| Organizare | ★★★★★ | ★★☆☆☆ |
| Acoperire cod | ★★★★★ | ★★★★☆ |
| Mutation score | ★★★★★ | ★★★☆☆ |
| Viteza de scriere | ★★☆☆☆ | ★★★★★ |
| Documentatie | ★★★★★ | ★☆☆☆☆ |
| Edge cases | ★★★★☆ | ★★★☆☆ |

**Recomandare:** Testele AI sunt utile ca **punct de plecare** — genereaza rapid o suita de baza cu acoperire decenta. Insa pentru proiecte care necesita calitate ridicata a testelor, este necesar sa se aplice manual strategii sistematice (EP, BVA, acoperire conditie) si sa se completeze cu teste targetate bazate pe raportul de mutation testing.

## 7. Referinte

- [1] OpenAI, ChatGPT, https://chatgpt.com/, Data generarii: 15 aprilie 2026
- [2] Jest Documentation, https://jestjs.io/docs/getting-started, Ultima accesare: 18 aprilie 2026
- [3] Stryker Mutator Documentation, https://stryker-mutator.io/docs/, Ultima accesare: 18 aprilie 2026
- [4] Aniche, Mauricio. *Effective Software Testing: A developer's guide*, Simon and Schuster, 2022
