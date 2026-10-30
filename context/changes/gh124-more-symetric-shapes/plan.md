# Kotwica, lizak i kolejne warianty obiektów symetrii (GH #124) Implementation Plan

## Overview

Do katalogu szablonów dochodzą dwa obiekty, `kotwica` (Kosmos i maszyny) i `lizak` (Jedzenie), a siedem istniejących obiektów (`tulipan`, `kot`, `pingwin`, `ananas`, `choinka`, `latarnia`, `truskawka`) dostaje trzeci wariant wybranych części, zmieniający sylwetkę. Wszystko w trzech rozmiarach połowy (4×12, 6×15, 9×24). Symetria, nonogram i dyktando biorą obiekty z jednego katalogu, więc nowe rysunki trafiają na wszystkie trzy karty, o ile przejdą ich odrzucenia. Korona zostaje dla GH #198.

## Current State Analysis

- Katalog ma 24 obiekty; w każdym z 72 szablonów (24 × 3 rozmiary) każda część ma dokładnie 2 warianty, 4–16 kombinacji na obiekt (`research.md`).
- Generatory są generyczne wobec liczby wariantów i części (`symmetry/generate.ts:61`, `nonogram/generate.ts:107-120`, `dictation/generate.ts:113`). Test wymaga `>= 2` wariantów części (`symmetry/generate.test.ts:273`).
- Dyktando deduplikuje karty po obrysie (`dictation/generate.ts:116-118`), więc wariant zmieniający tylko dziury nie daje tam nowej karty.
- Zmierzona słabość: nonogram trudny nie ma przechodzącego wariantu `kot` (0 z 16) i `tulipan` (0 z 8), średni `tulipan` 1 z 4; dyktando ma najmniej kart dla `choinka`, `latarnia`, `truskawka`.
- Wyjątek `["kot", "tulipan"]` w teście trudnego nonogramu: `nonogram/generate.test.ts:122-137`.
- PRD (po zmianie z 2026-10-30) już zapisuje kotwicę i lizak jako dochodzące w GH #124, bez ✓ w tabeli katalogu.

## Desired End State

Generuj na symetrii, nonogramie i dyktandzie losuje kotwicę (kategorie „Wszystkie” i „Kosmos i maszyny”) i lizak („Wszystkie” i „Jedzenie”) w każdym poziomie. Siedem wskazanych obiektów daje więcej różnych kart, a `kot` i `tulipan` mają co najmniej jeden działający wariant w trudnym nonogramie (wyjątek w teście usunięty, jeśli cel się uda). Testy, lint, typy i build przechodzą; PRD ma ✓ przy nowych obiektach.

### Key Discoveries:

- Dodanie obiektu do istniejącej kategorii nie dotyka rejestru ani ustawień profilu (`templates.ts:30`).
- 4×12 wymaga co najmniej 3 zamalowanych kratek w kolumnie osi (kratki podpowiedzi poziomu 1 to ich lustra) i miejsca na 3 podpowiedzi (`symmetry/generate.test.ts:291`).
- Różne zestawy wariantów jednego obiektu muszą rysować różne kratki (`symmetry/generate.test.ts:327`).
- Obiekt nie może mieć części stykających się tylko rogiem kratki w co najmniej jednym zestawie wariantów (`templates.test.ts`, `CORNER_TOUCH_ALLOWED` tylko dla truskawki).
- Pełna enumeracja kombinacji w teście trudnego nonogramu rośnie z liczbą wariantów (PRD: dziś do 3 s).

## What We're NOT Doing

- Korony, serca i kategorii „Kształty” (GH #198); cukierka w papierku (szeroki i niski).
- Zmian w generatorach, układzie kart, ustawieniach profilu, miniaturach katalogu.
- Wariantów pozostałych 17 obiektów i nowych części w obiektach spoza siedmiu.
- Nowej kategorii dla kotwicy (zostaje „Kosmos i maszyny”).
- Zmiany limitów poleceń dyktanda ani rozmiarów kratek.

## Implementation Approach

Rysunki najpierw na makiecie zatwierdzanej przez użytkownika (jak w #118), potem przeniesienie do kodu. Każdy nowy wariant ma zmieniać obrys, nie tylko dziury, i przechodzić te same reguły co dziś (jeden kawałek, bez styku rogiem). Skrypt pomiarowy (nonogram: przechodzące kombinacje na obiekt i rozmiar, dyktando: różne obrysy na obiekt i poziom) uruchamiany przed i po, żeby cel „kot i tulipan 1+ na trudnym” był sprawdzony liczbą, a nie wrażeniem. Skrypt to narzędzie jednorazowe w `/tmp`, bez dodawania do repozytorium; liczby trafiają do PRD (Open Questions 11) bez pinowania w testach.

## Faza 1: Makieta i pomiar bazowy

### Overview

Rysunki kotwicy, lizaka i nowych wariantów siedmiu obiektów w trzech rozmiarach oraz pomiar stanu wyjściowego. Bramka: użytkownik zatwierdza makietę przed kodem.

### Changes Required:

#### 1. Makieta rysunków

**File**: `context/changes/gh124-more-symetric-shapes/mockup-drawings.json`

**Intent**: Lewa połowa każdego nowego wariantu i każdego nowego obiektu, jeden string na wiersz, w formacie `drawing()`, w stylu `context/archive/2026-10-30-gh118-car-bus/mockup-drawings.json`. Kotwica: kółko u góry, poprzeczka, trzon, łuk z ramionami. Lizak: okrągła głowa, patyk na osi.

**Contract**: dla każdego obiektu i rozmiaru wskazana część, której dotyczy wariant, i rysunek na jej ramce; obiekty nowe pełne (`base` i części ≥ 2 warianty). Rysunek spełnia: oś w ostatniej kolumnie, ≥ 3 kratki na osi w 4×12, brak styku rogiem w co najmniej jednym zestawie, kolory tylko r g y b o s k n.

#### 2. Podgląd makiety

**Intent**: Wygenerować podgląd (obraz SVG lub zrzut), żeby użytkownik oceniał kształty w pełnej sylwetce (połowa + odbicie), nie surowe stringi. Wzorzec: `context/archive/2026-10-25-template-object-catalog/variants-lat4.svg`.

**Contract**: pliki w folderze zmiany; nie wchodzą do `src/`.

#### 3. Pomiar bazowy

**Intent**: Zapisać liczby przed zmianami (nonogram: przechodzące kombinacje na obiekt dla łatwego, średniego, trudnego; dyktando: różne obrysy na obiekt dla lat5, lat6, lat7) w notatce w folderze zmiany.

**Contract**: wartości zgodne z `research.md` (kot 0/16 i tulipan 0/8 na trudnym) jako kontrola skryptu.

### Success Criteria:

#### Automated Verification:

- Makieta jest poprawnym JSON: `node -e "JSON.parse(require('fs').readFileSync('context/changes/gh124-more-symetric-shapes/mockup-drawings.json','utf8'))"`
- Każdy rysunek makiety przechodzi reguły (jeden kawałek, ≥ 3 kratki na osi w 4×12, kolory z ośmiu liter): skrypt sprawdzający wypisuje 0 błędów
- Pomiar bazowy zgadza się z `research.md` dla `kot` i `tulipan`

#### Manual Verification:

- Użytkownik zatwierdza podgląd makiety: kotwica i lizak są rozpoznawalne w 4×12, nowe warianty wyraźnie zmieniają sylwetkę
- Użytkownik wskazuje rysunki do poprawy, jeśli są

**Implementation Note**: Po fazie wstrzymaj się na zatwierdzenie makiety przez użytkownika, zanim zaczniesz fazę 2.

---

## Faza 2: Kotwica i lizak

### Overview

Dwa nowe obiekty w trzech rozmiarach, z częściami losowanymi, w istniejących kategoriach.

### Changes Required:

#### 1. Szablon kotwicy

**File**: `src/lib/symmetry/objects/kosmos.ts`

**Intent**: Dodać `ANCHOR_4`, `ANCHOR_6`, `ANCHOR_9` z zatwierdzonej makiety i dopisać je do `KOSMOS` (`half4`, `half6`, `half9`).

**Contract**: `id: "kotwica"` w każdym rozmiarze, `categories: ["kosmos"]`, szerokość 4 / 6 / ≤ 9, w 9×24 co najmniej 3 części, każda część ≥ 2 warianty, `holeColor` dla oka kółka.

#### 2. Szablon lizaka

**File**: `src/lib/symmetry/objects/jedzenie.ts`

**Intent**: Dodać `LOLLIPOP_4`, `LOLLIPOP_6`, `LOLLIPOP_9` i dopisać je do `JEDZENIE`.

**Contract**: `id: "lizak"`, `categories: ["jedzenie"]`, te same ograniczenia co wyżej; głowa okrągła ze wzorem (spirala lub paski) jako część wymienna.

#### 3. Test obecności

**File**: `src/lib/symmetry/templates.test.ts`

**Intent**: Test, że `kotwica` jest w „Kosmos i maszyny”, a `lizak` w „Jedzenie” w każdym z trzech rozmiarów (jak test auta i autobusu).

**Contract**: używa `symmetryTemplatesFor(levelId, category)` i `SIZES`; nie pinuje liczby wariantów.

#### 4. Tabela katalogu w PRD

**File**: `context/foundation/prd.md`

**Intent**: Dopisać ✓ przy `lizak` i `kotwica` w tabeli „Katalog szablonów obiektów” i poprawić liczbę obiektów 24 → 26 w tekście katalogu.

**Contract**: edycja zdań sekcji „Katalog szablonów obiektów” bez zmiany reguł kart.

### Success Criteria:

#### Automated Verification:

- Testy przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Typy przechodzą: `npx astro check`

#### Manual Verification:

- Kotwica i lizak są rozpoznawalne na podglądzie symetrii w poziomach 1, 2 i 4
- Odbicie nie ma szwów na osi; kolory kratek poprawne po włączeniu kolorów
- Nonogram i dyktando w odpowiednich kategoriach pokazują oba obiekty lub losują inne bez błędu

---

## Faza 3: Warianty siedmiu obiektów

### Overview

Nowe warianty części `tulipan`, `kot`, `pingwin`, `ananas`, `choinka`, `latarnia`, `truskawka` według zatwierdzonej makiety, pomiar po zmianach i zawężenie testu trudnego nonogramu.

### Changes Required:

#### 1. Warianty w plikach kategorii

**File**: `src/lib/symmetry/objects/zwierzeta.ts` (kot, pingwin), `jedzenie.ts` (ananas, truskawka), `przyroda.ts` (tulipan, choinka), `budowle.ts` (latarnia)

**Intent**: Dopisać trzeci wariant (lub drugi wariant nowej części) wskazanych części we wszystkich trzech rozmiarach, zmieniając obrys. Istniejące warianty bez zmian.

**Contract**: każdy zestaw wariantów rysuje inne kratki niż pozostałe; w każdym obiekcie i rozmiarze jest co najmniej jeden zestaw bez styku rogiem i w jednym kawałku (truskawka nadal wyjątek, jeśli jej styk rogiem zostaje); `parts.length` w 9×24 nie maleje.

#### 2. Test trudnego nonogramu

**File**: `src/lib/nonogram/generate.test.ts`

**Intent**: Jeśli po zmianach `kot` i `tulipan` mają co najmniej jeden przechodzący wariant w trudnym, usunąć je z listy wyjątków w teście „hard level … known dead objects”; jeśli któryś nadal nie ma, zostawić go z komentarzem i zapisać to w notatce pomiaru.

**Contract**: test nie pinuje liczb wariantów; asercja dla obiektów spoza listy martwych bez zmian.

#### 3. Pomiar po zmianach

**Intent**: Powtórzyć pomiar z fazy 1 i zapisać różnicę (przechodzące kombinacje nonogramu, różne obrysy dyktanda, na obiekt).

**Contract**: żaden z siedmiu obiektów nie ma mniej przechodzących kart niż w pomiarze bazowym.

### Success Criteria:

#### Automated Verification:

- Testy przechodzą, w tym katalog, symetria, nonogram, dyktando: `npm test`
- Lint przechodzi: `npm run lint`
- Typy przechodzą: `npx astro check`
- Pomiar po zmianach: `kot` i `tulipan` mają ≥ 1 przechodzący wariant w trudnym nonogramie (lub notatka, który nie ma i dlaczego)
- Czas testu trudnego nonogramu mieści się w tym samym rzędzie wielkości co przed zmianą (PRD: do 3 s)

#### Manual Verification:

- Klikanie Generuj w symetrii na poziomach 1, 2, 4 pokazuje wyraźnie inne wersje siedmiu obiektów
- Wersje są rozpoznawalne i dobrze odbijają się w osi, także z kolorami

---

## Faza 4: Domknięcie

### Overview

Dokumentacja z liczbami, pełna weryfikacja i oględziny na urządzeniach.

### Changes Required:

#### 1. PRD

**File**: `context/foundation/prd.md`

**Intent**: Zaktualizować Open Questions 11 o liczby po zmianach (nonogram: przechodzące warianty, dyktando: obrysy, kot i tulipan) oraz zdanie o katalogu, jeśli się zmieniło.

**Contract**: bez zmian reguł kart; liczby opisane jako stan z daty bez pinowania w testach.

### Success Criteria:

#### Automated Verification:

- Wszystkie testy: `npm test`
- Lint: `npm run lint`
- Typy: `npx astro check`
- Budowanie: `npm run build`

#### Manual Verification:

- Kotwica i lizak oraz nowe warianty mieszczą się na karcie A4 w marginesie 10 mm, także na telefonie
- Wydruk próbny kotwicy w 4×12 jest czytelny dla dziecka

---

## Testing Strategy

### Unit Tests:

- Istniejące testy katalogu obejmują nowe obiekty i warianty automatycznie (jeden kawałek, szerokość, kategorie, ≥ 4 obiekty na kategorię, różne zestawy wariantów rysują różne kratki).
- Nowy test obecności `kotwica` i `lizak` w każdym rozmiarze.
- Test trudnego nonogramu bez `kot` i `tulipan` w wyjątkach, jeśli pomiar to potwierdzi.

### Integration Tests:

- Nonogram łatwy, średni i trudny oraz dyktando lat5–lat7 przechodzą z nowymi obiektami; generatory pomijają warianty, które łamią ich reguły.

### Manual Testing Steps:

1. `/symmetry`, kategoria „Kosmos i maszyny” i „Jedzenie”, Generuj aż pojawią się kotwica i lizak; poziomy 1, 2, 4.
2. Włącz kolory i sprawdź kolory kratek i dziur.
3. To samo na nonogramie i dyktandzie, na telefonie sprawdź margines.

## Performance Considerations

Trzeci wariant mnoży kombinacje (2 → 3 na część); obiekt z 4 częściami ma 81 zamiast 16. Katalog dyktanda jest liczony raz na poziom i kategorię, test trudnego nonogramu enumeruje wszystko, więc czas trzeba zmierzyć w fazie 3.

## Migration Notes

Brak: warianty i obiekty są danymi w kodzie; zapisane profile i ostatnie parametry nie przechowują ids obiektów ani indeksów wariantów.

## References

- Related research: `context/changes/gh124-more-symetric-shapes/research.md`
- Precedens: `context/archive/2026-10-30-gh118-car-bus/plan.md`
- Wzorzec szablonu: `src/lib/symmetry/objects/kosmos.ts:8-45`
- Format: `src/lib/symmetry/template-format.ts`
- Testy katalogu: `src/lib/symmetry/templates.test.ts`
- Wyjątek trudnego nonogramu: `src/lib/nonogram/generate.test.ts:122-137`
- Issue: GH #124; kategoria „Kształty”: GH #198

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Makieta i pomiar bazowy

#### Automated

- [x] 1.1 Makieta jest poprawnym JSON
- [x] 1.2 Każdy rysunek makiety przechodzi reguły (jeden kawałek, ≥ 3 kratki na osi w 4×12, kolory z ośmiu liter)
- [x] 1.3 Pomiar bazowy zgadza się z research.md dla kot i tulipan

#### Manual

- [x] 1.4 Użytkownik zatwierdza podgląd makiety: kotwica i lizak są rozpoznawalne w 4×12, nowe warianty wyraźnie zmieniają sylwetkę
- [x] 1.5 Użytkownik wskazuje rysunki do poprawy, jeśli są

### Phase 2: Kotwica i lizak

#### Automated

- [ ] 2.1 Testy przechodzą: `npm test`
- [ ] 2.2 Lint przechodzi: `npm run lint`
- [ ] 2.3 Typy przechodzą: `npx astro check`

#### Manual

- [ ] 2.4 Kotwica i lizak są rozpoznawalne na podglądzie symetrii w poziomach 1, 2 i 4
- [ ] 2.5 Odbicie nie ma szwów na osi; kolory kratek poprawne po włączeniu kolorów
- [ ] 2.6 Nonogram i dyktando w odpowiednich kategoriach pokazują oba obiekty lub losują inne bez błędu

### Phase 3: Warianty siedmiu obiektów

#### Automated

- [ ] 3.1 Testy przechodzą, w tym katalog, symetria, nonogram, dyktando: `npm test`
- [ ] 3.2 Lint przechodzi: `npm run lint`
- [ ] 3.3 Typy przechodzą: `npx astro check`
- [ ] 3.4 Pomiar po zmianach: kot i tulipan mają ≥ 1 przechodzący wariant w trudnym nonogramie (lub notatka, który nie ma i dlaczego)
- [ ] 3.5 Czas testu trudnego nonogramu mieści się w tym samym rzędzie wielkości co przed zmianą

#### Manual

- [ ] 3.6 Klikanie Generuj w symetrii na poziomach 1, 2, 4 pokazuje wyraźnie inne wersje siedmiu obiektów
- [ ] 3.7 Wersje są rozpoznawalne i dobrze odbijają się w osi, także z kolorami

### Phase 4: Domknięcie

#### Automated

- [ ] 4.1 Wszystkie testy: `npm test`
- [ ] 4.2 Lint: `npm run lint`
- [ ] 4.3 Typy: `npx astro check`
- [ ] 4.4 Budowanie: `npm run build`

#### Manual

- [ ] 4.5 Kotwica i lizak oraz nowe warianty mieszczą się na karcie A4 w marginesie 10 mm, także na telefonie
- [ ] 4.6 Wydruk próbny kotwicy w 4×12 jest czytelny dla dziecka
