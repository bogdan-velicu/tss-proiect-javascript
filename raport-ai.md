# Raport: Comparatie Teste Proprii vs Teste Generate de AI

## 1. Introducere

In cadrul acestui raport, comparam suita de teste scrise manual de echipa noastra cu teste generate automat de un tool de inteligenta artificiala. Am folosit **ChatGPT (GPT-4)** [1] pentru a genera teste unitare pentru clasele `ShoppingCart` si `PricingEngine`.

Conform literaturii de specialitate, testarea unitara eficienta necesita aplicarea sistematica a mai multor strategii complementare — partitionare in clase de echivalenta, analiza valorilor de frontiera, acoperire la nivel de decizie si conditie — pentru a maximiza probabilitatea de detectare a defectelor [4]. Intrebarea pe care o investigam este in ce masura un tool AI poate inlocui sau completa acest proces manual.

## 2. Metodologie

### Prompt folosit pentru ChatGPT:

> "Am urmatoarea clasa JavaScript. Genereaza teste unitare complete folosind Jest care sa acopere toate functionalitatile, inclusiv cazuri de eroare si valori limita."

Am furnizat codul sursa integral al fisierelor `ShoppingCart.js` (227 linii), `PricingEngine.js` (299 linii) si dependintele necesare (`constants.js`, `validators.js`). Promptul a fost trimis intr-o singura conversatie, fara iteratii suplimentare de rafinare — scopul fiind evaluarea capacitatii AI-ului de a genera o suita de teste „din prima", fara ghidare umana pe strategii specifice.

ChatGPT a generat doua fisiere de test (unul per clasa), cu aproximativ 85 de teste in total, intr-un singur bloc de raspuns. Testele au fost rulate cu aceeasi configuratie Jest [2] si Stryker [3] ca si testele proprii, pentru o comparatie echitabila.

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

1. **Organizare pe strategii**: Testele sunt grupate clar pe strategii de testare (EP, BVA, coverage, etc.), conform recomandarilor din literatura de specialitate [4], ceea ce face documentatia si prezentarea mai usoare. ChatGPT genereaza teste intr-un singur fisier, fara o structura clara.

2. **Comentarii explicative**: Fiecare grup de teste contine comentarii care explica ce clasa de echivalenta sau ce valoare de frontiera se testeaza. Testele AI au comentarii generice ("should throw for invalid input").

3. **Acoperire conditie**: Am testat explicit toate combinatiile de sub-conditii in conditiile compuse (ex: 4 combinatii pentru `calculateShipping`), conform tehnicii Modified Condition/Decision Coverage (MC/DC) descrisa in [4]. ChatGPT testeaza doar cazurile "happy path" si "error path" fara a acoperi sistematic combinatiile.

4. **Mutation testing**: Am scris teste specifice pentru a omori mutanti supravietuitori, utilizand Stryker Mutator [3] ca feedback loop. ChatGPT nu genereaza astfel de teste deoarece nu stie ce mutatii vor fi aplicate.

### 4.2 Avantaje teste AI:

1. **Viteza**: ChatGPT genereaza ~85 teste in cateva secunde, comparativ cu cateva ore pentru scrierea manuala.

2. **Acoperire initiala buna**: Testele generate acopera rapid cazurile de baza si cele de eroare evidente. Statement coverage de 94% fara efort suplimentar.

3. **Descoperire de edge cases**: ChatGPT a sugerat cateva cazuri pe care nu le-am considerat initial (ex: testarea cu `Infinity` ca pret, testarea cu array gol pentru `calculateTotalTax`).

### 4.3 Deficiente teste AI:

1. **Fara strategie clara**: Testele nu urmeaza o metodologie sistematica, asa cum recomanda Aniche [4] si Khorikov [5]. Nu exista partitionare explicita in clase de echivalenta sau analiza de frontiera.

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

## 6. Interpretarea rezultatelor

Diferentele cantitative dintre cele doua suite de teste reflecta limitari fundamentale ale abordarii bazate pe AI:

**Decalaj branch coverage (98.91% vs 78%):** Cele ~21 puncte procentuale lipsa din testele AI corespund exact ramurilor conditiilor compuse pe care ChatGPT nu le acopera sistematic. De exemplu, metoda `calculateShipping` are o conditie compusa cu 4 combinatii posibile (tip livrare x prag subtotal) — testele AI acopera doar 2 din 4. Acest tip de omisiune este previzibil: fara o analiza explicita a structurii conditiilor [4], generarea de teste se bazeaza pe euristici care favorizeaza cazurile evidente.

**Decalaj mutation score (90.32% vs ~72%):** Cei ~18 puncte procentuale diferenta provin din mutanti subtili — inlocuiri de operatori relationali (`>=` cu `>`, `<` cu `<=`), modificari ale valorilor constante si inversari de conditii. Testele AI nu detecteaza aceste mutatii deoarece nu testeaza la valorile exacte de frontiera. De exemplu, mutatia `subtotal >= 200` -> `subtotal > 200` supravietuieste daca niciun test nu verifica exact valoarea 200 — ceea ce testele AI nu fac, dar testele noastre BVA fac explicit.

**Raportul efort/beneficiu:** Testele AI au fost generate in secunde si ofera 94% statement coverage — un rezultat impresionant ca punct de plecare. Cu toate acestea, ultimele ~6% de statement coverage si ultimii ~18% de mutation score necesita o abordare manuala sistematica. Acest pattern confirma observatia din [4] ca testele „evidente" sunt cele mai usor de automatizat, dar valoarea reala a testarii consta in cazurile subtile pe care doar o analiza riguroasa le poate identifica.

## 7. Concluzii

| Criteriu | Teste proprii | Teste AI |
|----------|:---:|:---:|
| Organizare | ★★★★★ | ★★☆☆☆ |
| Acoperire cod | ★★★★★ | ★★★★☆ |
| Mutation score | ★★★★★ | ★★★☆☆ |
| Viteza de scriere | ★★☆☆☆ | ★★★★★ |
| Documentatie | ★★★★★ | ★☆☆☆☆ |
| Edge cases | ★★★★☆ | ★★★☆☆ |

**Recomandare:** Testele AI sunt utile ca **punct de plecare** — genereaza rapid o suita de baza cu acoperire decenta. Insa pentru proiecte care necesita calitate ridicata a testelor, este necesar sa se aplice manual strategii sistematice (EP, BVA, acoperire conditie) si sa se completeze cu teste targetate bazate pe raportul de mutation testing.

## 8. Referinte

- [1] OpenAI, ChatGPT, https://chatgpt.com/, Data generarii: 15 aprilie 2026
- [2] Jest Documentation, https://jestjs.io/docs/getting-started, Ultima accesare: 18 aprilie 2026
- [3] Stryker Mutator Documentation, https://stryker-mutator.io/docs/, Ultima accesare: 18 aprilie 2026
- [4] Aniche, Mauricio. *Effective Software Testing: A developer's guide*, Simon and Schuster, 2022
- [5] Khorikov, Vladimir. *Unit Testing Principles, Practices, and Patterns*, Simon and Schuster, 2020
