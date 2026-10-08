# Prove the sheet shows the chosen character file — Implementation Plan

## Overview

Dowieść na istniejącym runnerze Node, że kartka niesie plik identyfikatora postaci, który już na nią wszedł. „Bez postaci” zostawia brak pliku i napis „Start”. Napis „Meta” oraz prostokąt 30 na 30 zostają w dotychczasowym teście układu.

## Current State Analysis

Katalog czterech postaci jest prywatną stałą w `src/components/WorksheetGenerator.tsx:25-30`. Identyfikatory to `none`, `samochodzik`, `rakieta` i `dinozaur`. Dla `none` pole `src` jest `null`. Pozostałe trzy wskazują `/characters/samochodzik.png`, `/characters/rakieta.png` i `/characters/dinozaur.png`.

`layoutSheet` dostaje boolean `characterSelected` i nie zna ścieżki (`src/lib/sheet/layout.ts:27`). Przy `true` test układu wymaga prostokąta 30 na 30 i `start === null`. Przy `false` wymaga napisu „Start”, `mark === null` i nadal napisu „Meta” (`src/lib/sheet/layout.test.ts:38-61`). W `src/lib/sheet/` nie ma tych trzech nazw ani ścieżki `/characters/`.

Gdy labirynt istnieje, `MazeSheet` dostaje `selectedChoice.src` i przy wartości innej niż `null` wstawia ją w `href` obrazka (`src/components/WorksheetGenerator.tsx:153`, `:474-475`). Brak wpisu w katalogu pada dziś na pierwszy element tablicy, czyli `none` (`:68`). `handlePrint` to `window.print()` (`:91-93`). CSS druku chowa przyciski, więc miniatura w przycisku „Postać:” nie jest faktem kartki.

`npm test` odpala Node `node:test` (`package.json:12`). `openingVisit` przy jednym profilu z postacią `rakieta` i ostatnim zapisie `samochodzik` zwraca `rakieta` (`src/lib/child-profiles.test.ts:158-163`). Ten test kończy się na identyfikatorze.

## Desired End State

Wspólny katalog zwraca adres pliku dla identyfikatora, który wszedł na kartkę. `samochodzik`, `rakieta` i `dinozaur` dają swoje trzy ścieżki PNG. `none` daje `null`. `MazeSheet` wstawia ten wynik w `href` i nie trzyma drugiej kopii ścieżek. `npm test` to sprawdza. Podręcznik w `context/foundation/test-plan.md` opisuje ten wzorzec po zachowaniu.

Para „jeden profil z rakietą, ostatni zapis samochodzik” zostaje asercją `openingVisit` i nie wchodzi do nowego testu kartki.

### Key Discoveries:

- Adres pliku jest w komponencie, a testowalny układ dostaje tylko boolean (`src/lib/sheet/layout.ts:27`, `src/components/WorksheetGenerator.tsx:457`).
- Wzorzec wykonywalnego faktu to czysta funkcja w `src/lib/` i `node:test`. Skan tekstu źródeł jest wzorcem dla CSS druku (`src/lib/sheet/print-contract.test.ts`), którego Node nie wykonuje.
- `print-contract.test.ts:49-53` porównuje dokładne listy klas `print:hidden`. Zmiana tych klas wywala istniejący test.
- Fallback nieznanego identyfikatora jest pozycją w tablicy (`WorksheetGenerator.tsx:68`), a osobna funkcja `characterChoice` mapuje nieznany string na `"none"` (`:565-570`).

## What We're NOT Doing

- Pary zapisów „jeden profil `rakieta`, ostatni zapis `samochodzik`” na kartce. Zostaje w `openingVisit`.
- Ponownego dowodu prostokąta 30 na 30, marginesu 10 mm, pozycji „Meta” i góry znacznika.
- Edycji `@page`, reguł druku w `WorksheetHome.astro` i klas `print:hidden`.
- Macierzy przeglądarek, powtórki podglądu Chrome i Edge oraz Firefoxa i Safari.
- Migawki pikseli i otwierania bajtów PNG.
- Zmiany zachowania `openingVisit`, `readLastUsed` i zapisu profilu.
- Renderu Reacta, żeby odczytać atrybut `href` w DOM.
- Zmiany komórki Status w §3 planu testów.

## Implementation Approach

Wynieść cztery wiersze katalogu do modułu obok `layout.ts`. Funkcja zwraca adres pliku albo `null`. Komponent bierze z niej etykiety, `src` przycisku i `href` kartki. Test Node woła tę funkcję czterema identyfikatorami i sprawdza, że plik generatora nie trzyma własnych literałów trzech ścieżek. Istniejące testy układu i druku zostają zielone bez zmiany ich asercji geometrii i CSS.

## Critical Implementation Details

- **Fallback identyfikatora.** Dziś brak wpisu bierze element o indeksie 0. Po przeniesieniu katalogu brak wpisu i string spoza czterech identyfikatorów rozwiązują się do wiersza `id === "none"`. Kolejność tablicy nie jest regułą.
- **Układ zostaje booleański.** `layoutSheet` nie dostaje ścieżki. `characterSelected` pozostaje „`src` nie jest `null`”. Włożenie ścieżki do układu miesza wyrocznię pliku z testem prostokąta.
- **Klasy druku są zamrożone.** `print-contract.test.ts` wymaga dotychczasowych trzech stringów `print:hidden` i reguły `@page`. Ta zmiana ich nie rusza.

## Phase 1: Adres pliku na kartce

### Overview

Wspólna funkcja zwraca plik identyfikatora, który wszedł na kartkę. SVG używa tego wyniku. Test łapie zły plik przy właściwym prostokącie oraz drugi katalog w komponencie.

Zachowanie: `samochodzik`, `rakieta` i `dinozaur` dają swoje ścieżki, `none` daje `null`. Regresja: kartka rysuje inny plik niż identyfikator, albo „Bez postaci” dostaje obrazek. Źródło: `context/changes/testing-character-on-sheet/research.md`, sekcje o katalogu i o luce testów. Granica: string spoza czterech identyfikatorów, na przykład `smok`, daje `null` i nie staje się piątą postacią. Anty-wzorzec: migawka pikseli, asercja 30 na 30, para profilu i ostatniego zapisu, test „czy rodzic rozumie ekran”.

### Changes Required:

#### 1. Katalog postaci

**File**: `src/lib/sheet/character.ts`

**Intent**: Jedno miejsce zna cztery identyfikatory, ich etykiety i adres pliku, żeby test Node czytał tę samą wartość co kartka.

**Contract**: Moduł eksportuje cztery wiersze i funkcję `characterSheetSrc(id: string): string | null`.

| id | etykieta | wynik `characterSheetSrc` |
| --- | --- | --- |
| `none` | Bez postaci | `null` |
| `samochodzik` | Samochodzik | `/characters/samochodzik.png` |
| `rakieta` | Rakieta | `/characters/rakieta.png` |
| `dinozaur` | Dinozaur | `/characters/dinozaur.png` |

Każdy inny string daje `null`.

#### 2. Test adresu

**File**: `src/lib/sheet/character.test.ts`

**Intent**: Sprawdzić cztery identyfikatory i granicę `smok`, oraz że generator nie ma drugiej kopii trzech ścieżek.

**Contract**: Styl `src/lib/sheet/layout.test.ts`: `node:test`, `node:assert/strict`, import względny `./character.ts`. Asercje to tabela powyżej plus `characterSheetSrc("smok") === null`. Odczyt źródła `src/components/WorksheetGenerator.tsx` wymaga braku literałów `/characters/samochodzik.png`, `/characters/rakieta.png` i `/characters/dinozaur.png` oraz obecności wywołania `characterSheetSrc`. Test nie czyta pikseli, nie sprawdza `mark.width` i nie buduje profilu.

#### 3. Kartka i kontrolka

**File**: `src/components/WorksheetGenerator.tsx`

**Intent**: Kartka, miniatura w przycisku i lista wyboru biorą `src` oraz etykietę z wspólnego katalogu, żeby drukowany SVG i ekranowa kontrolka nie rozjechały się na dwa adresy.

**Contract**: `href` obrazka w `MazeSheet` jest wynikiem `characterSheetSrc` dla bieżącego identyfikatora. `null` zostawia gałąź napisu „Start” i nie rysuje `image`. Wynik inny niż `null` rysuje `image` i ustawia `characterSelected` na true. Brak wiersza rozwiązuje się do `none`, nie do indeksu 0. `handlePrint` zostaje `window.print()`. Dozwolone identyfikatory ostatniego zapisu i profili to te cztery `id`.

#### 4. Runner

**File**: `package.json`

**Intent**: Bramka `npm test` odpala nowy plik razem z dotychczasowymi.

**Contract**: Skrypt `test` zachowuje obecne pięć plików i dokłada `src/lib/sheet/character.test.ts`.

### Success Criteria:

#### Automated Verification:

- `npm test` przechodzi i sprawdza: `samochodzik` → `/characters/samochodzik.png`, `rakieta` → `/characters/rakieta.png`, `dinozaur` → `/characters/dinozaur.png`, `none` → `null`, `smok` → `null`
- `npm test` sprawdza, że `src/components/WorksheetGenerator.tsx` nie zawiera literałów `/characters/samochodzik.png`, `/characters/rakieta.png` ani `/characters/dinozaur.png` i że woła `characterSheetSrc`
- `npm run lint` przechodzi

---

## Phase 2: Podręcznik fazy

### Overview

Po zielonym teście przewodnik przestaje mówić, że plik postaci na kartce jest niesprawdzony. Wpis nazywa zachowanie, nie plik źródłowy.

### Changes Required:

#### 1. Przewodnik testów

**File**: `context/foundation/test-plan.md`

**Intent**: Zapisać wzorzec, który ta faza dowiezła, i poprawić zdania, które po tym teście są fałszywe.

**Contract**:

- §6 „Druk i znaczniki kartki” zastępuje „TBD” opisem: na kartce jest plik identyfikatora, który na nią wszedł (`samochodzik`, `rakieta`, `dinozaur`); „Bez postaci” zostawia napis „Start” i brak obrazka; „Meta” oraz prostokąt 30 na 30 zostają dotychczasowym testem układu; para jednego profilu i ostatniego zapisu nie jest tym wzorcem.
- §4 wymienia dokładnie pliki ze skryptu `test` w `package.json` po fazie 1, łącznie z `src/lib/sheet/character.test.ts` i `src/lib/child-profiles.test.ts`. Zdanie o czterech plikach schodzi.
- §5 przestaje twierdzić, że żaden test nie sprawdza pliku wybranej postaci. Zostają prawdziwe zdania o prostokącie 30 na 30, napisie „Start” i o tym, że kontrakt ostatniego zapisu sam nie rysuje kartki.
- W wierszu fazy 2 w §3 klauzula, że to, która postać weszła na kartkę, jest nadal otwarte, schodzi na rzecz adresu pliku identyfikatora. Komórka Status zostaje bez zmian.

### Success Criteria:

#### Manual Verification:

- Sekcja „Druk i znaczniki kartki” opisuje adres pliku identyfikatora, „Start” przy braku pliku oraz to, że „Meta” i prostokąt 30 na 30 zostają w teście układu, i nie zawiera „TBD”
- §4 wymienia te same pliki co skrypt `test` w `package.json`, łącznie z nowym testem postaci i z `child-profiles.test.ts`
- §5 nie twierdzi, że testy pomijają plik wybranej postaci; zdania o prostokącie 30 na 30, napisie „Start” i o kontrakcie ostatniego zapisu zostają
- W §3 klauzula o otwartym wyborze postaci na kartce jest zastąpiona adresem pliku identyfikatora, a komórka Status jest nietknięta

---

## Testing Strategy

### Unit Tests:

- Cztery identyfikatory katalogu i granica `smok` → `null`.
- Brak trzech literałów ścieżek w `WorksheetGenerator.tsx` oraz wywołanie `characterSheetSrc`.
- Dotychczasowe `layout.test.ts` i `print-contract.test.ts` zostają w `npm test` i nie zmieniają swoich asercji.

### Integration Tests:

- Brak nowej warstwy. Zgodność druku z kartką jest tym, że `href` SVG jest wynikiem `characterSheetSrc`, a istniejący kontrakt CSS nadal chowa przyciski.

### Manual Testing Steps:

1. Przeczytać §6, §5, §4 i klauzulę fazy 2 w §3 pod kryteriami fazy 2.
2. Nie otwierać podglądu druku w tej zmianie.

## Performance Considerations

Cztery porównania stringów na dotychczasowym `npm test`. Generowanie labiryntu i rozmiar SVG druku zostają bez zmian.

## Migration Notes

Kształt `printo-kids:last-used` i zapis profili zostają. Nowa funkcja czyta identyfikator, który i tak już wchodzi do stanu kartki.

## References

- Badanie: `context/changes/testing-character-on-sheet/research.md`
- Notatka zmiany: `context/changes/testing-character-on-sheet/change.md`
- Plan testów: `context/foundation/test-plan.md`
- Katalog i `href`: `src/components/WorksheetGenerator.tsx:25-30`, `:474-475`
- Układ boolean: `src/lib/sheet/layout.ts:27`
- Para profilu: `src/lib/child-profiles.test.ts:158-163`
- Zamknięty kontrakt druku: `context/archive/2026-10-05-print-sheet-contract/plan.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Adres pliku na kartce

#### Automated

- [x] 1.1 `npm test` przechodzi i sprawdza: `samochodzik` → `/characters/samochodzik.png`, `rakieta` → `/characters/rakieta.png`, `dinozaur` → `/characters/dinozaur.png`, `none` → `null`, `smok` → `null` — 6454705
- [x] 1.2 `npm test` sprawdza, że `src/components/WorksheetGenerator.tsx` nie zawiera literałów `/characters/samochodzik.png`, `/characters/rakieta.png` ani `/characters/dinozaur.png` i że woła `characterSheetSrc` — 6454705
- [x] 1.3 `npm run lint` przechodzi — 6454705

### Phase 2: Podręcznik fazy

#### Manual

- [x] 2.1 Sekcja „Druk i znaczniki kartki” opisuje adres pliku identyfikatora, „Start” przy braku pliku oraz to, że „Meta” i prostokąt 30 na 30 zostają w teście układu, i nie zawiera „TBD” — ea67c57
- [x] 2.2 §4 wymienia te same pliki co skrypt `test` w `package.json`, łącznie z nowym testem postaci i z `child-profiles.test.ts` — ea67c57
- [x] 2.3 §5 nie twierdzi, że testy pomijają plik wybranej postaci; zdania o prostokącie 30 na 30, napisie „Start” i o kontrakcie ostatniego zapisu zostają — ea67c57
- [x] 2.4 W §3 klauzula o otwartym wyborze postaci na kartce jest zastąpiona adresem pliku identyfikatora, a komórka Status jest nietknięta — ea67c57
