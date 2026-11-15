# Świąteczne postacie (S-39) — plan implementacji

## Overview

Do katalogu postaci dochodzą trzy postacie: Mikołaj, renifer i bałwanek. Rodzic wybiera je tak jak inne:

- na pasku „Postać” przy poleceniu na każdej karcie;
- w oknie profilu jako ulubioną;
- na labiryncie, gdzie postać stoi przy starcie.

Postacie są na liście wyboru tylko w oknie 15.11–6.01, tym samym zegarem co kategoria „Boże Narodzenie” z S-38. Zapisana ulubiona albo ostatnio użyta postać spoza okna nie znika. Na liście świąteczne postacie stoją zaraz po „Brak”, a pozostałe jedenaście oddziela od nich kreska. Issue: drpc1/printo-kids#370. Rama: `context/changes/christmas-characters/frame.md`.

## Current State Analysis

- `CHARACTER_CHOICES` w `src/lib/sheet/character.ts:3` to jedyna lista postaci. Ma „Brak” i 11 postaci, alfabetycznie po polsku. Z niej korzystają:
  - lista wyboru `CharacterChoiceRows` (`src/components/ProfileCorner.tsx:601-645`), której używają pasek (`CharacterChoiceControl.tsx:70`) i okno profilu (`ProfileCorner.tsx:383`);
  - `ALLOWED_CHARACTER_IDS`, czyli kontrola zapisu;
  - `characterChoice`;
  - `characterSheetSrc` (labirynt i dymek);
  - `contentLeft` / `contentRight` (Poziom 6 labiryntu, `WorksheetGenerator.tsx:216`; dymek, `SpeechBand.tsx:93`).
- `characterChoice` zamienia id spoza katalogu na `"none"`. Gdyby postać wypadała z katalogu poza oknem, ulubiony Mikołaj po cichu zamieniłby się w „Brak”. Dlatego okno filtruje tylko listę wyboru, a nie katalog.
- Okno dat z S-38 składa się z trzech części:
  - typy `MonthDay` i `CategoryWindow` w `src/lib/symmetry/template-format.ts:5-16`;
  - prywatna funkcja `inWindow` w `src/lib/symmetry/templates.ts:78-83`;
  - `useToday` w `src/hooks/useToday.ts`, który czyta datę raz przy montowaniu.
- Rysunki leżą w trzech miejscach:
  - pliki od użytkowniczki: `public/characters/{mikolaj,renifer,balwanek}.webp` (nieśledzone, kadr inny niż u jedenastu);
  - kopie z dopasowanym kadrem (y 96–415, na środku): `context/changes/christmas-characters/normalized/*.png`, zaakceptowane 2026-11-15;
  - źródła jedenastu istniejących postaci: `context/ideas/postacie/<id>.png`, z których `scripts/characters-webp.mjs` robi webp.
- Katalog `src/components/ui` nie ma separatora (są button, dialog, input, switch, tooltip).
- Wzór e2e z ustawioną datą to `tests/e2e/christmas-category.spec.ts:27,44` (`page.clock.setFixedTime`).

## Desired End State

Między 15.11 a 6.01 lista postaci na pasku i w oknie profilu wygląda tak: „Brak”, Bałwanek, Mikołaj, Renifer, kreska, potem jedenaście postaci alfabetycznie, a na końcu „Własny obrazek”. Na telefonie całą listę da się przewinąć w oknie i nic nie jest ucięte. Wybrana świąteczna postać:

- stoi przy poleceniu w dymku na każdej karcie, w kolorze;
- stoi przy starcie labiryntu, także na Poziomie 6 (lewą krawędzią równo z labiryntem);
- może być ulubioną profilu.

Poza oknem lista ma „Brak” i jedenaście postaci, bez kreski. Wyjątek: gdy zapisana ulubiona albo ostatnio użyta postać jest świąteczna, jej wiersz zostaje na górze (zaznaczony), a pod nim jest kreska. Karta nadal pokazuje tę postać. Sprawdzają to testy jednostkowe funkcji listy i e2e z zegarem ustawionym na grudzień i luty.

### Key Discoveries:

- Kategoria z oknem stoi przed pozostałymi (`OBJECT_CATEGORY_CHOICES`, `src/lib/symmetry/templates.ts:62-75`). Świąteczne postacie biorą ten sam porządek.
- Kategoria spoza okna czyta się jako „Wszystkie” (`visibleCategoryOn`, `templates.ts:97`). Postać zachowuje się odwrotnie: zostaje. To decyzja ramy.
- `contentLeft` i `contentRight` to ułamki boku w jednostkach /1024. Pomiary z dopasowanych plików: Mikołaj 376/376, renifer 258/258, bałwanek 298/296 (`style-prompts.md`, „Odbiór plików”).
- Test kontraktu `character.test.ts:35` sprawdza pełną listę wierszy, a testy z linii 64–126 sprawdzają pliki i marginesy każdego wiersza.

## What We're NOT Doing

- Bez zmian w S-38 poza wyjęciem `inWindow` do wspólnego modułu. Kategoria, obiekty bałwanka i renifera oraz zachowanie „Wszystkie” zostają, jak są.
- Bez nowych kategorii obiektów i rodzajów kart. Bez zmian w S-40.
- Bez zmian w „Jak to działa”: opis sezonowych postaci to S-44.
- Bez zmian w zapisie profilu, ostatnich parametrach i `ALLOWED_CHARACTER_IDS` poza dopisaniem trzech id.
- Bez komunikatu, że postać jest sezonowa. Kreska to jedyne oznaczenie.
- Bez nowej przebudowy listy. 15 wierszy mieści się w przewijanym oknie z S-08.

## Implementation Approach

Phase 1 kończy etap rysunków i daje makietę aplikacji do akceptacji, zanim powstanie kod. Phase 2 robi kod:

- okno dat wychodzi do neutralnego modułu w `src/lib`, którego używają symetria i postacie;
- wiersz postaci dostaje opcjonalne pole `window`;
- czysta funkcja z datą i wybraną postacią w argumencie mówi, które wiersze pokazać i czy narysować kreskę;
- `CharacterChoiceRows` używa jej z `useToday()`.

Phase 3 aktualizuje dokumenty i liczbę „11”.

## Critical Implementation Details

- **Wybrana postać spoza okna:** funkcja listy musi dostać aktualnie wybraną postać (`selected`) i zostawić jej wiersz. W oknie profilu, w kroku ulubionej, wybrana to ulubiona; na pasku to postać karty. W innym wypadku rodzic poza sezonem nie zobaczyłby zaznaczenia na liście.
- **Moduł okna:** `src/lib/sheet` nie powinien importować z `src/lib/symmetry`. Sprawdzić reguły w `.dependency-cruiser.cjs`. Wspólny moduł (np. `src/lib/date-window.ts`) trzyma `MonthDay`, typ okna i `inWindow`. `template-format.ts` zostawia `CategoryWindow` jako alias albo import tego typu, żeby kod S-38 się nie zmienił.

## Phase 1: Rysunki i makieta aplikacji

### Overview

Dopasowane rysunki przechodzą do potoku plików, a makieta PNG pokazuje je w prawdziwych miejscach aplikacji. Użytkowniczka akceptuje makietę przed Phase 2.

### Changes Required:

#### 1. Źródła i webp

**File**: `context/ideas/postacie/{mikolaj,renifer,balwanek}.png`, `public/characters/{mikolaj,renifer,balwanek}.webp`

**Intent**: Kopie z `normalized/` stają się źródłami, tak jak przy jedenastu postaciach, a `node scripts/characters-webp.mjs` nadpisuje webp w `public/characters/` wersją z dopasowanym kadrem.

**Contract**: Pliki webp mają 512×512 z alfą, obrys y 96–415, na środku. Ponowny pomiar `contentLeft`/`contentRight` (/1024) daje wartości z tabeli „Odbiór plików” albo różni się o ±2 px.

#### 2. Makieta aplikacji

**File**: `context/changes/christmas-characters/mockup-app.mts` → `mockup-app.png`

**Intent**: Pokazać do akceptacji trzy miejsca:

- Mikołaj z dymkiem przy poleceniu karty;
- renifer przy narożnym starcie Poziomu 6 labiryntu;
- lista postaci w oknie 375 px szerokości: „Brak”, trzy świąteczne, kreska, jedenaście, „Własny obrazek”.

Wolno złożyć makietę ze zrzutów aplikacji (dev server z tymczasowo dopisanymi wierszami, niecommitowanymi) albo narysować ją sharpem, jak `mockup-lineup.mts`.

**Contract**: Skrypt `.mts` z jawnymi typami (ESLint go pomija, `astro check` sprawdza). Nie zmienia nic w `src/`.

### Success Criteria:

#### Automated Verification:

- `npx astro check` bez błędów
- `npm test` przechodzi (stare webp zastąpione, testy plików w `character.test.ts` bez zmian)

#### Manual Verification:

- Użytkowniczka akceptuje `mockup-app.png`: postacie przy poleceniu, przy starcie Poziomu 6 i lista z kreską na telefonie

**Implementation Note**: Po automatycznej weryfikacji poczekaj na akceptację makiety przed Phase 2.

---

## Phase 2: Katalog z oknem dat i lista z kreską

### Overview

Trzy postacie w katalogu, okno dat filtruje listę wyboru, a kreska oddziela świąteczne wiersze.

### Changes Required:

#### 1. Wspólne okno dat

**File**: `src/lib/date-window.ts` (nowy), `src/lib/symmetry/template-format.ts`, `src/lib/symmetry/templates.ts`

**Intent**: `inWindow` z modułu symetrii przechodzi do wspólnego modułu i jest eksportowana. Symetria importuje ją stamtąd i działa bez zmian.

**Contract**: `inWindow(window: DateWindow, today: Date): boolean`, końce włącznie, także przez Nowy Rok. `MonthDay` i `DateWindow` są we wspólnym module. `CategoryWindow` zostaje nazwą używaną w S-38.

#### 2. Katalog postaci

**File**: `src/lib/sheet/character.ts`

**Intent**: Trzy wiersze (`balwanek` „Bałwanek”, `mikolaj` „Mikołaj”, `renifer` „Renifer”) stoją zaraz po „Brak”, alfabetycznie między sobą. Mają `src`, zmierzone marginesy i `window: { from: 11.15, to: 1.06 }`. Dochodzi czysta funkcja listy wyboru.

**Contract**:

- Każdy wiersz z `window` jest pokazywany, gdy `inWindow(window, today)` albo gdy jego id to `selected`.
- Funkcja `characterPickRowsOn(today, selected)` (nazwa do ustalenia z glosariuszem) zwraca wiersze w kolejności katalogu i informację, po którym wierszu stoi kreska. Kreska jest wtedy, gdy pokazany jest co najmniej jeden wiersz z oknem.
- `ALLOWED_CHARACTER_IDS`, `characterChoice`, `characterRow` i `characterSheetSrc` dalej obejmują wszystkie wiersze bez względu na datę.

#### 3. Separator z katalogu shadcn

**File**: `src/components/ui/separator.tsx`

**Intent**: Dodać `npx shadcn@latest add separator`, zgodnie z AGENTS.md (podstawowa kontrolka z katalogu).

**Contract**: Kolor z tokenu `border`, bez nowych kolorów.

#### 4. Lista wyboru

**File**: `src/components/ProfileCorner.tsx` (`CharacterChoiceRows`)

**Intent**: Lista bierze wiersze z funkcji listy z `useToday()` i `selected`, a w miejscu kreski rysuje `Separator`. Ta sama lista obsługuje pasek i okno profilu.

**Contract**: Kreska jest dekoracyjna (`decorative`), więc czytniki ekranu jej nie ogłaszają. Klasy łączone przez `cn()`.

#### 5. Testy

**File**: `src/lib/sheet/character.test.ts`, test wspólnego okna (przeniesione przypadki z `object-categories.test.ts` zostają tam albo idą do nowego pliku), `tests/e2e/christmas-characters.spec.ts` (nowy)

**Intent**: Test kontraktu podaje pełną kolejność 14 postaci. Testy funkcji listy sprawdzają:

- 15.11, 31.12 i 6.01: 15 wierszy z kreską po Reniferze;
- 14.11 i 7.01: 12 wierszy bez kreski;
- 7.01 z `selected = "mikolaj"`: Mikołaj zostaje na górze z kreską.

Test „id spoza katalogu to Brak” dalej przechodzi, a `characterChoice("mikolaj")` daje `"mikolaj"` także latem. E2e, wzorem `christmas-category.spec.ts`:

- zegar w grudniu: wybór Mikołaja na pasku karty pokazuje jego obrazek w dymku, a lista ma kreskę (`role=separator` nie jest wymagane, bo kreska jest dekoracyjna, więc test sprawdza kolejność wierszy);
- zegar w lutym: lista nie ma Mikołaja, chyba że ostatnio użyta postać to Mikołaj; wtedy wiersz jest i jest zaznaczony (`aria-pressed`).

**Contract**: Testy uruchamiane przez `npm test` (nowe pliki dopisane do skryptu `test` w `package.json`, jeśli tego wymaga) i Playwright na projektach Chromium.

### Success Criteria:

#### Automated Verification:

- `npm run lint` bez błędów
- `npm run depcruise` bez naruszeń
- `npm test` przechodzi, w tym nowe testy listy i okna
- `npx astro check` bez błędów
- `npm run build` przechodzi
- `npx playwright test tests/e2e/christmas-characters.spec.ts tests/e2e/christmas-category.spec.ts` przechodzi (z `E2E_PORT` na wolnym porcie)

#### Manual Verification:

- Na telefonie (375 px) lista ma 15 wierszy i kreskę, a całość przewija się w oknie bez ucięcia
- Mikołaj przy poleceniu dowolnej karty i renifer przy starcie Poziomu 6 labiryntu wyglądają jak na makiecie, także w podglądzie wydruku
- Ulubiony bałwanek w profilu zostaje po przestawieniu zegara urządzenia na luty

**Implementation Note**: Po automatycznej weryfikacji i `/10x-impl-review` poczekaj na potwierdzenie testu ręcznego przed PR.

---

## Phase 3: Dokumenty

### Overview

Dokumenty mówią o czternastu postaciach, trzech z oknem dat, i o kresce na liście.

### Changes Required:

#### 1. PRD

**File**: `context/foundation/prd.md`

**Intent**: Dopisać w kilku miejscach:

- w US-03 i FR-012 (oraz w wierszach 41, 113, 612, 712): czternaście postaci, w tym trzy świąteczne widoczne na liście 15.11–6.01, zaraz po „Brak” i oddzielone kreską;
- że zapisana świąteczna postać zostaje poza oknem;
- w Business Logic „Postać na kartach”: ta sama reguła;
- w OQ 3: rysunki świąteczne wygenerowała użytkowniczka, która ma do nich prawa, a postacie są ogólne (renifer bez czerwonego nosa).

**Contract**: Tylko te sekcje. Decyzje z datą 2026-11-15 i GitHub 370.

#### 2. Glosariusz i distillation

**File**: `context/domain/glossary.md`, plik distillation (`01-domain-distillation.md`)

**Intent**: Pojęcie „postać z oknem dat” (nazwa w kodzie, czym różni się od kategorii z oknem). Liczba postaci 11 → 14.

**Contract**: Wiersz glosariusza w formacie istniejących.

#### 3. Roadmapa

**File**: `context/foundation/roadmap.md`

**Intent**: Baseline mówi o 14 postaciach. Status S-39 prowadzą `/10x-implement` i `/10x-archive`.

**Contract**: Bez zmian w innych slice'ach.

### Success Criteria:

#### Automated Verification:

- `npm run format` nie zmienia plików `.md`
- `git grep -n "jedenaście postaci\|11 postaci" context/foundation context/domain` nie zwraca nieaktualnych miejsc

#### Manual Verification:

- Użytkowniczka czyta zmienione sekcje PRD i glosariusza i je akceptuje

---

## Testing Strategy

### Unit Tests:

- `inWindow` po przeniesieniu: brzegi okna i przejście przez Nowy Rok (istniejące przypadki S-38 dalej przechodzą)
- Funkcja listy: w oknie, poza oknem, poza oknem z wybraną świąteczną postacią, kreska tylko przy pokazanych wierszach z oknem
- Kontrakt katalogu: kolejność 14 postaci, pliki istnieją, marginesy w zakresie

### Integration Tests:

- E2E grudzień: lista z kreską, Mikołaj w dymku karty
- E2E luty: brak świątecznych wierszy; zapamiętany Mikołaj zostaje zaznaczony na górze

### Manual Testing Steps:

1. Na telefonie otwórz pasek „Postać” na dowolnej karcie w listopadzie albo grudniu. Sprawdź kreskę i przewijanie.
2. Wybierz renifera na Poziomie 6 labiryntu i obejrzyj podgląd wydruku.
3. Ustaw bałwanka jako ulubionego, przestaw zegar na luty i sprawdź okno profilu oraz kartę.

## Performance Considerations

Brak: filtr 15 wierszy przy montowaniu listy.

## Migration Notes

Brak migracji. Nowe id są dozwolone od razu, a stare dane się nie zmieniają.

## References

- Rama: `context/changes/christmas-characters/frame.md`
- Styl i pomiary: `context/changes/christmas-characters/style-prompts.md`
- Okno dat S-38: `src/lib/symmetry/templates.ts:62-100`, `src/lib/symmetry/template-format.ts:5-36`, `tests/e2e/christmas-category.spec.ts`
- Lista postaci: `src/components/ProfileCorner.tsx:601-700`, `src/components/CharacterChoiceControl.tsx:70`
- Dodanie postaci w S-08: `context/archive/2026-10-11-full-character-catalog/plan.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Rysunki i makieta aplikacji

#### Automated

- [x] 1.1 `npx astro check` bez błędów
- [x] 1.2 `npm test` przechodzi (stare webp zastąpione, testy plików w `character.test.ts` bez zmian)

#### Manual

- [x] 1.3 Użytkowniczka akceptuje `mockup-app.png`: postacie przy poleceniu, przy starcie Poziomu 6 i lista z kreską na telefonie

### Phase 2: Katalog z oknem dat i lista z kreską

#### Automated

- [ ] 2.1 `npm run lint` bez błędów
- [ ] 2.2 `npm run depcruise` bez naruszeń
- [ ] 2.3 `npm test` przechodzi, w tym nowe testy listy i okna
- [ ] 2.4 `npx astro check` bez błędów
- [ ] 2.5 `npm run build` przechodzi
- [ ] 2.6 `npx playwright test tests/e2e/christmas-characters.spec.ts tests/e2e/christmas-category.spec.ts` przechodzi (z `E2E_PORT` na wolnym porcie)

#### Manual

- [ ] 2.7 Na telefonie (375 px) lista ma 15 wierszy i kreskę, a całość przewija się w oknie bez ucięcia
- [ ] 2.8 Mikołaj przy poleceniu dowolnej karty i renifer przy starcie Poziomu 6 labiryntu wyglądają jak na makiecie, także w podglądzie wydruku
- [ ] 2.9 Ulubiony bałwanek w profilu zostaje po przestawieniu zegara urządzenia na luty

### Phase 3: Dokumenty

#### Automated

- [ ] 3.1 `npm run format` nie zmienia plików `.md`
- [ ] 3.2 `git grep -n "jedenaście postaci\|11 postaci" context/foundation context/domain` nie zwraca nieaktualnych miejsc

#### Manual

- [ ] 3.3 Użytkowniczka czyta zmienione sekcje PRD i glosariusza i je akceptuje
