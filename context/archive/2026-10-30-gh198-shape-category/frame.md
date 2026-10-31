# Frame Brief: Kategoria „Kształty” (GitHub 198)

> Framing step before /10x-plan. Separates what is actually at issue from what was initially assumed.

## Reported Observation

Katalog szablonów ma pięć kategorii (`OBJECT_CATEGORIES`, `src/lib/symmetry/template-format.ts:4`). Figury geometryczne i serce nie mają w nim miejsca; serce wypadło z #115, korona czeka od #124.

## Initial Framing (preserved)

- **User's stated cause or approach**: brakuje szóstej kategorii „Kształty” (serce, gwiazda, koło, trójkąt, księżyc, chmurka, krzyżyk, romb), wspólnej dla symetrii, nonogramu i dyktanda.
- **User's proposed direction**: dodać kategorię z kilkoma symetrycznymi szablonami w każdym z trzech rozmiarów (połowa 4×12, 6×15, 9×24); uwzględnić pamięć profilu, miniatury, PRD (US-19, US-20, FR-028, FR-029).
- **Pre-dispatch narrowing**: lista figur to tylko przykłady (dopisane po briefie: krzyżyk i romb) (zestaw po makiecie); wspólny katalog dla trzech kart; największy kłopot z figurami: „nie wiem / nie sprawdzałem”.

## Dimension Map

1. **Plumbing kategorii** — nowy id, wpis w `OBJECT_CATEGORIES`, `CATALOG`, filtr „Kategoria”. ← initial framing
2. **Proporcje siatki** — wszystkie siatki są wyższe niż szersze (8×12, 12×16/15, 18×24), więc „koło” i „kwadrat” trzeba rysować w pasie, nie na całej wysokości.
3. **Zmienność kart** — figury geometryczne mają mało losowanych części, więc mało różnych kart w kategorii (wymóg: każde Generuj inne).
4. **Reguły kart, nie symetrii** — nonogram wymaga jednego rozwiązania bez zgadywania, dyktando obrysu bez styku rogiem; ostre figury (gwiazda, serce) i pełne regularne bryły łamią je najłatwiej.
5. **Pokrycie z katalogiem dyktanda (#115)** — dyktando ma własne kształty bez osi; „Kształty” to druga ścieżka figur.
6. **Zasięg poza kodem szablonów** — PRD, testy z zahardkodowanymi etykietami, komentarz o „pięciu kategoriach”.

## Hypothesis Investigation

| Hypothesis       | Evidence                                                                                                                                                                                                                                                                      | Verdict                                                                              |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 1. Plumbing      | `templates.ts:18` (CATALOG z 5 obiektów), `:35-38` (wybór z OBJECT_CATEGORIES), `card-settings.ts:125-126` (zapisana kategoria walidowana względem `OBJECT_CATEGORY_CHOICES`, więc nowy id działa w profilu bez migracji), `card-summary.ts:120` (etykieta z tej samej listy) | Prosty i mały: dotyka kilku miejsc, ale nie jest ryzykiem                            |
| 2. Proporcje     | `levels.ts` rows 12/16/20/24 przy 8/12/14/18 kolumnach; PRD odrzuciło motyl i koronę jako zbyt szerokie                                                                                                                                                                       | STRONG: decyduje, które figury w ogóle mają sens                                     |
| 3. Zmienność     | `generate.ts:47-64` odrzuca tylko kartę o tym samym kluczu co poprzednia; klucz zawiera przesunięcie wiersza; test `templates.test.ts:47` wymaga ≥4 obiektów na kategorię na rozmiar                                                                                          | WEAK-MEDIUM: formalnie wystarczy, ale bez losowanych części karty wyglądają tak samo |
| 4. Reguły kart   | `templates.test.ts:78` (sylwetka w jednym kawałku bez styku rogiem), nonogram pokazuje tylko warianty z jednym rozwiązaniem (`nonogram/generate.ts:108`); przed #124 `kot` i `tulipan` nie miały takiego wariantu w trudnym (PRD, OQ 11)                                      | MEDIUM: nie sprawdzono na figurach, wymaga makiety                                   |
| 5. Dyktando #115 | `dictation/shapes.ts` ma własne `categories`; PRD zostawia „Kształty” na #198                                                                                                                                                                                                 | WEAK: kategoria jest wspólna                                                         |
| 6. Zasięg        | `CategoryChoice.tsx:6` komentarz o „five categories”; `object-categories.test.ts` przypina etykiety; PRD wymienia kategorie w US-19/20, FR-028/29, Business Logic                                                                                                             | Pewny, mały koszt                                                                    |

## Narrowing Signals

- Lista figur w issue to przykłady, nie wymóg; zestaw ma zależeć od makiety.
- Wspólny katalog trzech kart, bez wyjątków dla jednej karty.
- Nie wiadomo, które figury łamią reguły kart; to otwarta niewiadoma.

## Cross-System Convention

Poprzednie rozszerzenia katalogu (#118 auto i autobus, #124 kotwica i lizak) szły tą samą drogą: makieta w `context/changes/…`, rysunek z letter-gridu, test kategorii. Przy #118 pojawił się wyjątek od zasady „pionowy”, więc wyjątek od proporcji jest możliwy, ale trzeba go wpisać do PRD.

## Reframed (or Confirmed) Problem Statement

> **The actual problem to plan around is**: znaleźć ≥4 figury geometryczne, które czytelnie mieszczą się w połowie 4×12, 6×15 i 9×24 i przechodzą reguły symetrii, nonogramu (jedno rozwiązanie) i dyktanda (obrys bez styku rogiem); dopiero potem dodać kategorię.

Dodanie kategorii to kilka linii, a ryzyko leży w doborze i rysunku figur. Cel z issue był ujęty poprawnie, ale pomijał, że figury muszą przejść trzy zestawy reguł naraz i mieszczą się w kratce wyższej niż szerokiej.

## Confidence

**MEDIUM** — kod potwierdza, że plumbing jest tani i jakie reguły obowiązują. Nie wiadomo jeszcze, które figury przejdą nonogram i dyktando; rozstrzyga to makieta albo krótki prototyp, nie dalsza analiza.

Krok weryfikacji przed /10x-plan: narysować kandydatów (serce, gwiazda, koło, trójkąt, księżyc, chmurka, krzyżyk, romb) w letter-gridzie i sprawdzić istniejącymi testami (`templates.test.ts`, nonogram, dyktando) w trzech rozmiarach.

## What Changes for /10x-plan

Krzyżyk i romb są symetryczne lewo–prawo i pionowe; krzyżyk ma ostre styki ramion, więc trzeba go sprawdzić pod kątem styku rogiem w dyktandzie. Plan ma zaczynać się od makiety figur (zestaw wybrany po sprawdzeniu reguł dla każdej figury i rozmiaru), a nie od dodania kategorii. Wyjątki od zasad PRD (np. figura szersza niż wysoka) i zmiany w US-19, US-20, FR-028, FR-029 i Business Logic trzeba wpisać wprost.

## References

- `src/lib/symmetry/template-format.ts:4`, `src/lib/symmetry/templates.ts:18,35`, `src/lib/symmetry/templates.test.ts:47,78`
- `src/lib/card-settings.ts:125`, `src/lib/card-summary.ts:120`, `src/components/CategoryChoice.tsx:6`
- `src/lib/symmetry/generate.ts:47`, `src/lib/dictation/shapes.ts`, `src/lib/object-categories.test.ts`
- Investigation tasks: none (surface small, read directly)
