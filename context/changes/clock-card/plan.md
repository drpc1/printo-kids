# Zegar (S-41) — plan implementacji

## Overview

Dwunasty rodzaj karty: „Zegar”. Na A4 stoją tarcze zegara z liczbami 1–12 i wskazówkami. Zależnie od trybu dziecko wpisuje godzinę pod tarczą (Odczytaj), dorysowuje wskazówki do godziny podanej w ramce zegara cyfrowego (Dorysuj) albo łączy kreską tarczę z zegarem cyfrowym (Połącz). Poziom 1–5 wyznacza minuty (od pełnych godzin po co minutę) i wygląd tarczy (kreski minut od Poziomu 4). Przełącznik „24 h” daje godziny z całej doby z porą dnia słowami pod tarczą. Poza tym karta zachowuje się jak pozostałe: A4 z marginesem 10 mm, czarny druk bez odpowiedzi, postać przy poleceniu, profil pamięta poziom, tryb i 24 h. Issue: drpc1/printo-kids#372, roadmapa M-6 S-41.

## Current State Analysis

Katalog ma jedenaście kart; ostatnia, krzyżówka matematyczna (S-40), przeszła drogę, którą ten plan powtarza: rejestr `CARD_KINDS`, ustawienia w `card-settings.ts`, silnik w `card-engines.ts`, podsumowanie w `card-summary.ts`, strona `.astro` z generatorem i arkuszem, miniatura, tabele w testach. Reguły zegara są w PRD (US-33, US-34, FR-043, FR-044, Business Logic „Karta „Zegar””, wiersz „Zegar” w tabeli „Profil i zapamiętane ustawienia”). Makieta `context/changes/clock-card/mockup.mts` (zaakceptowana 2026-11-16) zawiera losowanie godzin, pory dnia, kąty wskazówek, rozmieszczenie trzech trybów w mm i sprawdzenia reguł; decyzje z niej są w `change.md` i w PRD.

Ustalenia PRD, roadmapy i `change.md` leżą niezacommitowane na gałęzi `claude/new-cards-ideas-a182e7`, która jest za `origin/main`: na `main` doszły święta (PR #386–#388), które zmieniły `prd.md`, `roadmap.md` i `glossary.md`. Folder `context/changes/clock-card/` jest nieśledzony.

## Desired End State

Rodzic otwiera z katalogu „Zegar” (`/clock`), wybiera Poziom 1–5 (domyślnie Poziom 1), tryb (lista „Tryb: Odczytaj ▾”, domyślnie Odczytaj) i „24 h” (domyślnie wyłączone), klika Generuj i dostaje jedną stronę A4 z tarczami. Zmiana poziomu, trybu albo 24 h przy pokazanej karcie od razu układa nową kartę. Profil i ostatnie parametry pamiętają trzy ustawienia, katalog pokazuje plakietkę „poz. N”, okno profilu podsumowanie np. „Zegar: Poziom 2 · Odczytaj” albo „Zegar: Poziom 4 · Połącz · 24 h”. „Jak to działa” opisuje kartę i wymienia ją w zdaniu „Poziomy”. Weryfikacja: `npm test`, `npm run lint`, `npm run depcruise`, `npx astro check`, `npm run build`, Playwright na czterech projektach Chromium, smoke, przegląd każdego poziomu i trybu oraz wydruk na A4.

### Key Discoveries:

- Rejestr kart: `src/lib/cards.ts:92-95` (wpis krzyżówki jako wzór); katalog sortowany alfabetycznie (`cardsInCatalogOrder`, `cards.ts:104`), więc „Zegar” sam staje na końcu.
- Ustawienia: interfejsy `src/lib/card-settings.ts:36-90`, `CardSettingsMap` :92-104, `CARD_SETTINGS_IDS` :108-120, `DEFAULTS` :127-139, wyczerpujący `switch` w `levelIds()` :241-266. `parseCard` (:210) bierze pola z wartości domyślnych i woła `fieldValue` (:220-238), który rozpoznaje pole po nazwie (`colors`/`lines` boolean, `category`, `currency`, `size`, `symbols`, reszta jako poziom). Nowe pola `mode` i `h24` bez własnych gałęzi wpadłyby do sprawdzania poziomu i zawsze wracały do wartości domyślnej.
- Nowa karta przy zmianie ustawienia: `applySettings` (`src/lib/sheet-state.ts:61-74`) generuje kartę, gdy `engine.spec.contentKey(settings)` różni się od pokazanej; `sheetView` (:80-93) pokazuje „unavailable”, gdy handler zmienił treść bez `applySettings`. Wzór: waluta w `MoneyGenerator.tsx:70-76` (`remember` + `applySettings`), klucz `money/engine.ts:69`.
- Kontrakt: `src/lib/card-contract.ts` (`CardSpec.contentKey` bez dekoracji, `knownBad` ≥ 2 z `expectedCode`); `card-engines.test.ts` `INVENTORY` (:160-298) typowane po `CardKindId` (brak wpisu = błąd kompilacji), `content` niepuste, `decoration` może być `[]` jak przy krzyżówce.
- Pasek: `LevelChoice.tsx` (etykieta przycisku „`${label}: ${barLabel ?? label}`”, opcje z `description`); `CategoryChoice.tsx` to cienka nakładka z `label="Kategoria"` — wzór dla „Tryb”. `SettingToggle.tsx` dla „24 h” (na telefonie w osobnej linii).
- Podsumowanie: `summaryParts` (`src/lib/card-summary.ts:57`) zwraca `{badge, level, extras}`, `badgeOf()` (:171-173) daje „poz. N”; wzór dodatków: money (:102-114), szlaczki (:135-143). `card-summary.test.ts:217-233` `SAVED_SETTINGS` wymaga wpisu każdej karty.
- Pas postaci: `CharacterInstruction` (`src/components/SpeechBand.tsx:72`), `layoutSpeechBand`/`instructionBoxHeight` (`src/lib/sheet/speech.ts`); makieta używa tego samego kodu.
- Tekst w SVG: bez `dominant-baseline`, jawne przesunięcie linii bazowej (`MATH_CROSSWORD_SHEET.baselineShift`, `src/lib/math-crossword/sheet.ts:32`) — telefony stawiały tekst inaczej (GitHub 371).
- Testy i bramki: skrypt `test` w `package.json:12` wymienia każdy plik (`src/lib/test-script.test.ts` pilnuje); regex `cards-only-through-engines` w `.dependency-cruiser.cjs:139`; `print-contract.test.ts:35-37` i :412-438 (stałe ścieżek, klasy druku SVG, strona bez własnego `@page`); `how-it-works.spec.ts:55-57` sprawdza dokładne brzmienie zdania „Poziomy” z `how-it-works.astro:8-9`.
- Liczba kart nie jest nigdzie wpisana na sztywno (wbrew uwadze w roadmapie przy S-40): `catalog.spec.ts:20-23` liczy z DOM, `smoke.mjs:101-115` obchodzi linki katalogu. Do uzupełnienia są tylko tabele kart: e2e `card-settings.spec.ts` (:29-102, przełączniki tylko „Kolory” i „Linie”), `character-speaks.spec.ts:25`, `phone-settings-rows.spec.ts:120-150`, `phone-toggle-align.spec.ts:31-42`, `profile-summary.spec.ts:17-32`, `phone-layout.spec.ts:678` (test strony krzyżówki jako wzór).
- Kolizji nazw brak: nie ma `src/lib/clock`, trasy `/clock` ani id `zegar`.
- Lekcja `context/foundation/lessons.md`: wartości druku mierzyć osobno w Safari, Chrome iOS i Brave iOS.

## What We're NOT Doing

- Tarcza bez liczb albo z samymi 12, 3, 6, 9; zapis słowny godziny („wpół do ósmej”); wskazówka sekundowa; obliczenia zegarowe („która będzie za 20 minut?”) — Non-Goals PRD.
- „Pokaż rozwiązanie”, kolory, kategorie, osobna kontrolka tarczy — decyzje 2026-11-15.
- Godziny po północy (0:xx) przy 24 h — decyzja 2026-11-16.
- Trzy przyciski trybu obok siebie i nowy wspólny komponent przycisków — tryb to lista jak Poziom (decyzja 2026-11-16).
- Tagi katalogu (S-43), przepisanie „Jak to działa” (S-44), Stryker (S-45), aktualizacja `test-plan.md` (S-46).
- Poprawki nieaktualnych miejsc poza zegarem (np. lista id w wierszu „Rodzaj karty” glosariusza poza dopisaniem `zegar`, nieaktualne zdanie o liczbie kart w ryzyku S-40 w roadmapie).

## Implementation Approach

Ten sam rytm co S-40: każda faza na osobnej gałęzi z `origin/main` i PR do `main`, `/10x-impl-review` przed każdym PR, scala użytkowniczka. Najpierw dokumenty (CI pomija joby dla zmian tylko w `context/`), potem logika bez UI (przeniesiona z makiety, z testami), potem strona i rejestracja, na końcu wydruk próbny po scaleniu.

Reguły karty (wspólne dla PRD, kodu i testów):

| Poziom | Minuty             | Minuty nowe dla poziomu (co najmniej połowa tarcz) | Kreski minut | Opis w UI                 |
| ------ | ------------------ | -------------------------------------------------- | ------------ | ------------------------- |
| 1      | :00                | — (reguła nie dotyczy)                             | nie          | „pełne godziny”           |
| 2      | :00, :30           | :30                                                | nie          | „pełne godziny i wpół do” |
| 3      | :00, :15, :30, :45 | :15, :45                                           | nie          | „kwadranse”               |
| 4      | co 5 minut         | wielokrotności 5 poza kwadransami                  | tak          | „co 5 minut”              |
| 5      | każda minuta       | minuty niepodzielne przez 5                        | tak          | „co minutę”               |

| Tryb (id)             | Tarcz                          | Pod tarczą                                        | Polecenie                            | Opis w liście trybów (startowy) |
| --------------------- | ------------------------------ | ------------------------------------------------- | ------------------------------------ | ------------------------------- |
| Odczytaj (`odczytaj`) | 6, 2 kolumny × 3 rzędy         | dwie kratki 18 × 13 mm z dwukropkiem              | „Która godzina? Wpisz pod zegarem.”  | „dziecko wpisuje godzinę”       |
| Dorysuj (`dorysuj`)   | 6, 2 × 3, tarcza bez wskazówek | zegar cyfrowy 42 × 15 mm, cyfry 10 mm             | „Dorysuj wskazówki: krótką i długą.” | „dziecko rysuje wskazówki”      |
| Połącz (`polacz`)     | 5 rzędów                       | tarcze po lewej, zegary cyfrowe po prawej, kropki | „Połącz zegar z tą samą godziną.”    | „dziecko łączy zegar z godziną” |

- Godzina: bez 24 h 1:00–12:59 (12:30, nie 0:30); z 24 h godziny 6–10, 13–16, 19–20, 23 i 1–3 (bez godzin granicznych 4, 5, 11, 12, 17, 18, 21, 22 i bez 0), pod tarczą pora dnia: „rano” 5–11, „po południu” 12–17, „wieczorem” 18–21, „w nocy” 22–4. Zapis cyframi, minuty zawsze dwiema cyframi, godzina bez zera z przodu („7:30”, „19:30”).
- Godziny na karcie się nie powtarzają (bez 24 h 7:30 i 19:30 to ta sama godzina). Połącz: kolejność zegarów cyfrowych to permutacja bez punktu stałego (żaden nie stoi na wysokości swojej tarczy).
- Tarcza: okrąg, liczby 1–12 (ok. 0,2 promienia, pogrubione), kreski godzin (grubsze przy 12, 3, 6, 9), od Poziomu 4 kreski minut, środek. Wskazówka minutowa 0,9 promienia, cienka; godzinowa 0,5 promienia, gruba, kąt 30° na godzinę + 0,5° na minutę (7:30 → 225°). Liczby nad wskazówkami z białą obwódką (`paint-order="stroke"`).
- Wymiary z makiety (startowe): tarcza Odczytaj ok. 62 mm, Dorysuj ok. 60 mm, z 24 h 52–54 mm; Połącz 45 mm, z 24 h 38 mm; kropki ok. 85–90 mm od siebie. Pora dnia stoi pod każdą tarczą przy 24 h, także w Dorysuj.
- Podsumowanie profilu: `Poziom N · <tryb>` plus ` · 24 h`, gdy włączone; tryb zawsze, także domyślny. Plakietka katalogu: „poz. N”.

## Phase 1: Dokumenty

### Overview

Ustalenia zegara trafiają na świeży `main`: PRD, roadmapa, `change.md`, makieta i glosariusz. Zmiana tylko w `context/`, więc CI pomija joby `ci`, `smoke`, `e2e`.

### Changes Required:

#### 1. Przeniesienie ustaleń na `main`

**File**: `context/foundation/prd.md`, `context/foundation/roadmap.md`, `context/changes/clock-card/`

**Intent**: Gałąź `claude/new-cards-ideas-a182e7` jest za `origin/main` (święta zmieniły te same pliki), więc ustalenia zegara przenieść na nową gałąź z `origin/main`, bez cofania zmian świąt.

**Contract**: nowa gałąź z `origin/main`; różnica PRD i roadmapy z gałęzi `claude/new-cards-ideas-a182e7` przeniesiona ręcznie albo przez `git diff | git apply -3` z rozwiązaniem konfliktów na korzyść obu stron. Folder `context/changes/clock-card/` w commicie: `change.md`, `plan.md`, `plan-brief.md`, `mockup.mts`, `mockup-*.svg`, `mockups.html` (zapis decyzji, jak `mockup-*.svg` krzyżówki); `.gitignore` folderu na `preview-*.svg` i `previews.html` z fazy 2. Roadmapa: S-41 ze statusem z tego planu (`planning`).

#### 2. PRD — uzupełnienia z planu

**File**: `context/foundation/prd.md`

**Intent**: Dopisać to, co ustalił plan, żeby kod, testy i UI miały jedno źródło.

**Contract**: w tabeli trybów Business Logic „Karta „Zegar”” kolumna z opisem w liście trybów („dziecko wpisuje godzinę”, „dziecko rysuje wskazówki”, „dziecko łączy zegar z godziną”) i zdanie, że tryb wybiera się z listy jak poziom; w „Profil i zapamiętane ustawienia” zdanie o podsumowaniu zegara („Poziom 2 · Odczytaj”, z 24 h „… · 24 h”; tryb zawsze); US-05: od M-6 dwanaście rodzajów, z miniaturą zegara; US-22: „Jak to działa” wymienia też zegar i jego poziomy. Każda zmiana z datą 2026-11-16.

#### 3. Glosariusz

**File**: `context/domain/glossary.md`

**Intent**: Nazwać pojęcia karty przed kodem.

**Contract**: wiersze termin / znaczy / w kodzie / nie nazywaj:

- Zegar — karta z tarczami zegara; `zegar`, `ClockCard`, `src/lib/clock/`, strona `/clock`; nie „godziny”, nie „clock worksheet”.
- Tarcza — okrąg z liczbami 1–12 i kreskami; `dial`; nie „cyferblat”, nie „zegar” (to karta).
- Wskazówka godzinowa / minutowa — `hourHand`/`minuteHand`, kąty `hourAngle`/`minuteAngle`; nie „strzałka”.
- Tryb (zegara) — `mode`: `odczytaj`, `dorysuj`, `polacz`; nie mylić z trybem kropek szlaczków (to wynika z poziomu).
- Zegar cyfrowy — ramka z godziną cyframi; `digital`; nie „wyświetlacz”.
- Pora dnia — `partOfDay` („rano”, „po południu”, „wieczorem”, „w nocy”); godzina graniczna — `BORDER_HOURS`.
- Minuty nowe dla poziomu — `freshMinutes`; nie „trudne minuty”.
- Do wiersza „Rodzaj karty” dopisać id `zegar`.

### Success Criteria:

#### Automated Verification:

- Formatowanie dokumentów: `npx prettier --check context/foundation/prd.md context/foundation/roadmap.md context/domain/glossary.md context/changes/clock-card/*.md`
- Ustalenia zegara są na gałęzi z `main`: `git merge-base --is-ancestor origin/main HEAD` i `rg -n "US-33|US-34|FR-043|FR-044|0:xx" context/foundation/prd.md` zwraca trafienia
- Makieta działa na `main`: `node --experimental-strip-types context/changes/clock-card/mockup.mts` kończy się bez błędu

#### Manual Verification:

- Diff PRD i roadmapy względem `main` zawiera tylko zmiany zegara (święta nietknięte)
- Użytkowniczka potwierdza dopisane zdania (opisy trybów, podsumowanie profilu)

**Implementation Note**: po tej fazie zatrzymać się na potwierdzenie przed fazą 2.

---

## Phase 2: Logika karty

### Overview

Moduł `src/lib/clock/` bez UI i bez rejestracji w katalogu: poziomy, tryby, stałe druku, karta, generator, rozmieszczenie w mm, silnik. Algorytm przeniesiony z makiety i przykryty testami.

### Changes Required:

#### 1. Poziomy, tryby i stałe druku

**File**: `src/lib/clock/levels.ts`, `src/lib/clock/sheet.ts`

**Intent**: Jedno miejsce na tabelę poziomów, trybów, pór dnia i stałe druku, wspólne dla generatora, arkusza, miniatury i testów.

**Contract**: `ClockLevelId = "poziom1" | … | "poziom5"`, `DEFAULT_CLOCK_LEVEL_ID = "poziom1"`, `ClockLevel` (`id`, `label` „Poziom N”, `barLabel` „N”, `description`, `minutes`, `freshMinutes`, `minuteTicks`), `CLOCK_LEVELS`, `clockLevelById()`. `ClockModeId = "odczytaj" | "dorysuj" | "polacz"`, `DEFAULT_CLOCK_MODE_ID = "odczytaj"`, `CLOCK_MODES` (`id`, `label`, `description`, `dials` 6/6/5, `instruction`), `CLOCK_MODE_IDS`, `clockModeById()`. Pory dnia i `BORDER_HOURS` z komentarzem odsyłającym do PRD; lista godzin 12 h i 24 h (bez 0). `CLOCK_SHEET` (`as const`, każda stała z jednozdaniowym komentarzem): strona 210×297, `inset` 10, pas postaci, odstęp, `plainInstructionSize`, proporcje tarczy (liczby, kreski, wskazówki, obwódka liczb), kratki odpowiedzi, zegar cyfrowy, pora dnia, kropki, `baselineShift`.

#### 2. Karta i sprawdzanie

**File**: `src/lib/clock/card.ts`

**Intent**: Typ karty, kąty wskazówek i stabilne kody problemów, żeby generator i `VerifiedCard` sprawdzały to samo.

**Contract**: `ClockTime { h, m }`, `ClockCard` (`level`, `mode`, `h24`, `times: ClockTime[]`, `order: number[]` — kolejność zegarów cyfrowych w Połącz, tożsamość w innych trybach), `formatClockTime(t)` („7:30”), `partOfDay(h)`, `hourAngle(t)`, `minuteAngle(t)`, `clockKey(card)` (jedna funkcja klucza dla generatora i `problems`), `clockProblems(card)` zwraca kody: `wrong-dial-count`, `minute-not-in-level`, `too-few-fresh-minutes`, `repeated-time`, `hour-out-of-range` (bez 24 h poza 1–12, z 24 h poza 0–23), `border-hour` (przy 24 h godzina graniczna pory albo 0:xx), `order-not-permutation`, `digital-beside-own-dial` (Połącz: zegar cyfrowy na wysokości swojej tarczy).

#### 3. Generator

**File**: `src/lib/clock/generate.ts`

**Intent**: Losowa karta zgodna z poziomem, trybem i 24 h, różna od poprzedniej; `random` jedynym źródłem losowości.

**Contract**: `generateClockCard(random, previousKey, level, mode, h24): ClockCard | null`, `MAX_ATTEMPTS`. Kroki jak w makiecie: najpierw tyle „minut nowych”, ile wymaga reguła połowy, potem dowolne minuty poziomu, bez powtórek; tasowanie Fisher–Yates (nie `sort` z losową funkcją); w Połącz permutacja bez punktu stałego. Odrzuca kartę z problemami albo z kluczem równym `previousKey`.

#### 4. Rozmieszczenie na A4

**File**: `src/lib/clock/layout.ts`

**Intent**: Pozycje i wymiary w mm dla trzech trybów, z porą dnia przy 24 h, z postacią i bez; tarcza największa, jaka się mieści, nie większa niż w makiecie.

**Contract**: `layoutClockSheet(card, instructionBoxHeight)` zwraca obszar polecenia, promień tarczy i dla każdej tarczy środek, pozycję słowa pory dnia, pola odpowiedzi albo ramkę zegara cyfrowego; w Połącz także kropki i ramki zegarów cyfrowych w kolejności `order`. Rzuca, gdy cokolwiek przekracza margines 10 mm (tolerancja 1e-6 mm). Wymiary startowe z tabeli w Implementation Approach.

#### 5. Silnik

**File**: `src/lib/clock/engine.ts`, `src/lib/card-settings.ts`

**Intent**: Podłączyć kartę do kontraktu kart.

**Contract**: `ClockSettings { level: ClockLevelId; mode: ClockModeId; h24: boolean }` w `card-settings.ts`, jeszcze bez wpisu w `CardSettingsMap`. `clockSpec: CardSpec` (`kind: "zegar"` z rzutowaniem jak w S-40 do rejestracji w fazie 3, `problems`, `keyOf`, `contentKey` = `` `${level}|${mode}|${String(h24)}` ``, leniwe `knownBad` z `expectedCode` co najmniej dla `repeated-time`, `minute-not-in-level` i `digital-beside-own-dial`). `clockEngine.generate` rzuca `CardExhausted` po `MAX_ATTEMPTS`, inaczej `VerifiedCard.require`.

#### 6. Testy, skrypt test, depcruise, podgląd

**File**: `src/lib/clock/*.test.ts`, `package.json`, `.dependency-cruiser.cjs`, `context/changes/clock-card/preview.mts`, `context/changes/clock-card/.gitignore`

**Intent**: Pokryć reguły karty i wpiąć moduł w istniejące bramki; dać użytkowniczce podgląd z prawdziwego kodu.

**Contract**:

- Testy obok plików (`node:test`, `node:assert/strict`). Dla każdego poziomu, trybu i 24 h na kilku ziarnach: liczba tarcz, minuty z poziomu, co najmniej połowa minut nowych od Poziomu 2, brak powtórek (bez 24 h 7:30 = 19:30), zakres godzin, przy 24 h brak godzin granicznych i 0:xx, Połącz bez punktu stałego, kolejne Generuj daje inny klucz.
- Kąty: 7:30 → godzinowa 225° (między 7 a 8), 2:50 → 85°, 12:00 → 0°, minutowa 6° na minutę; `partOfDay` na granicach pór; `formatClockTime` (dwucyfrowe minuty, bez zera w godzinie).
- `knownBad` każdego kodu daje oczekiwany kod.
- `layout.test.ts`: każdy tryb × poziom (kreski minut nie zmieniają wymiarów) × 24 h × z postacią i bez mieści się w 10 mm; tarcze się nie nakładają.
- Nowe pliki testów w skrypcie `test`; `clock` w regexie `cards-only-through-engines`.
- `preview.mts` pisze SVG każdego trybu na Poziomie 1, 4 i z 24 h z prawdziwych modułów (SVG w `.gitignore` folderu, commitowany tylko skrypt). Makieta `mockup.mts` zostaje jako zapis decyzji.

### Success Criteria:

#### Automated Verification:

- Testy przechodzą: `npm test`
- Lint: `npm run lint`
- Zależności: `npm run depcruise`
- Typy: `npx astro check`
- Build: `npm run build`

#### Manual Verification:

- Użytkowniczka akceptuje podgląd trzech trybów z `preview.mts` (Poziom 1, Poziom 4, 24 h)
- Przegląd diffu względem planu i makiety

**Implementation Note**: po tej fazie zatrzymać się na potwierdzenie przed fazą 3.

---

## Phase 3: Strona, katalog i profil

### Overview

Karta pojawia się w katalogu, ma stronę, pasek, arkusz, miniaturę, plakietkę i podsumowanie profilu; „Jak to działa” ją opisuje.

### Changes Required:

#### 1. Rejestracja

**File**: `src/lib/cards.ts`, `src/lib/card-settings.ts`, `src/lib/card-engines.ts`, `src/lib/card-summary.ts`

**Intent**: Dopisać kartę do rejestrów; kompilator pilnuje kompletności.

**Contract**: wpis `CARD_KINDS` (`id: "zegar"`, `title: "Zegar"`, `href: "/clock"`, `thumbnail: "/thumbnails/zegar.svg"`, `description` w 2–3 zdaniach: co dziecko robi i co jest na kartce, z trzema trybami); `CardSettingsMap.zegar`, `CARD_SETTINGS_IDS`, `DEFAULTS` (`poziom1`, `odczytaj`, `false`), `case "zegar"` w `levelIds()`; w `fieldValue` gałęzie `mode` (tylko `CLOCK_MODE_IDS`) i `h24` (tylko boolean), inaczej zapisany tryb i 24 h wracałyby do domyślnych; `CardTypeMap` i `CARD_ENGINES`; `case "zegar"` w `summaryParts()` (`badge: badgeOf(level)`, `level: level.label`, `extras: [mode.label, ...(h24 ? ["24 h"] : [])]`). Usunąć rzutowanie `kind` z fazy 2.

#### 2. Strona, generator, arkusz

**File**: `src/pages/clock.astro`, `src/components/ClockGenerator.tsx`, `src/components/ClockModeChoice.tsx`, `src/components/ClockSheet.tsx`

**Intent**: Strona jak pozostałe karty; trzy ustawienia, z których każde przy pokazanej karcie układa nową kartę.

**Contract**: strona z `Layout`, `GeneratorShell` (`description` z „i wydrukuj”, `cardPageTitle("zegar")`), `<ClockGenerator client:only="react" />`. Generator na `CardPage`/`useCardPage`, `useCardSettings("zegar", …)`, `SheetState`; kontrolki `CharacterChoiceControl`, `LevelChoice`, `ClockModeChoice` (nakładka na `LevelChoice` jak `CategoryChoice`: `label="Tryb"`, tytuł okna „Wybierz tryb”, opcje z opisem), `SettingToggle` „24 h”. Każdy z trzech handlerów: `remember(patch)` i `applySettings` (wzór waluty, `MoneyGenerator.tsx:70-76`); wszystkie `disabled={waitingForChild}`; `handleProfileSwitch` przez `applySettings`. Arkusz SVG 210×297 mm z klasami druku, `printColorAdjust`, `role="img"`, `aria-label="Zegar"`, `data-card-key`; `CharacterInstruction` albo samo polecenie; tarcze, wskazówki, liczby z obwódką, kratki, zegary cyfrowe, pora dnia, kropki z `layoutClockSheet`; kolory przez tokeny (`var(--foreground)`, `var(--card)`), bez hexów; tekst z jawnym `baselineShift`, bez `dominant-baseline`. Brak `print:hidden` (karta nie ma rozwiązania na ekranie).

#### 3. Miniatura i „Jak to działa”

**File**: `scripts/build-thumbnails.mjs`, `public/thumbnails/zegar.svg`, `src/pages/how-it-works.astro`, `tests/e2e/how-it-works.spec.ts`

**Intent**: Miniatura z prawdziwego generatora (stałe ziarno); zdanie „Poziomy” wymienia zegar.

**Contract**: sekcja zegara w skrypcie miniatur (Odczytaj, Poziom 2, stałe ziarno, żeby było widać wpół do), komentarz nagłówka; commit tylko nowej miniatury (zmiany bajtów w innych cofnąć). W `how-it-works.astro:8-9`: „Numery mają labirynt (Poziom 1–6), symetria, sekwencje i szlaczki (Poziom 1–4), zegar (Poziom 1–5) oraz krzyżówka matematyczna (Poziom 1–7).”, bez wieku; to samo brzmienie w `how-it-works.spec.ts:55-57`.

#### 4. Testy

**File**: `src/lib/card-engines.test.ts`, `src/lib/card-settings.test.ts`, `src/lib/card-summary.test.ts`, `src/lib/sheet/print-contract.test.ts`, `tests/e2e/*.spec.ts`

**Intent**: Dopisać zegar do tabel i dodać jego własne testy przeglądarkowe.

**Contract**:

- `INVENTORY`: `base` domyślne, `content` po jednym wariancie poziomu, trybu i 24 h, `decoration: []`.
- `card-settings.test.ts`: domyślne, parsowanie zapisanego trybu i 24 h, odrzucenie nieznanego trybu i nie-boolean 24 h (wraca domyślne).
- `card-summary.test.ts`: `SAVED_SETTINGS.zegar`, napisy „Poziom 1 · Odczytaj”, „Poziom 4 · Połącz · 24 h”, plakietka „poz. 4”.
- `print-contract.test.ts`: stałe ścieżek, klasy druku SVG, brak `print:hidden` w arkuszu i generatorze, strona `/clock` bez własnego `@page`.
- e2e: `card-settings.spec.ts` (wpis `/clock` z poziomem i trybem; ogólne pole na przełącznik o podanej nazwie zamiast samych „Kolory”/„Linie”, żeby objąć „24 h”), `character-speaks.spec.ts` (zdanie „Która godzina?”), `phone-settings-rows.spec.ts` (`/^Postać:/`, `/^Poziom:/`, `/^Tryb:/`), `phone-toggle-align.spec.ts` (`switchName: "24 h"`), `profile-summary.spec.ts` (fixture i wiersz „Zegar: …”), `phone-layout.spec.ts` (strona `/clock`: „24 h”, Generuj, Drukuj, Profil się nie nakładają); nowe `clock.spec.ts` (poziom, tryb i 24 h układają nową kartę — inny `data-card-key`; zapamiętanie w profilu; plakietka; Połącz ma 5 tarcz, pozostałe 6; przy 24 h pod tarczą pora dnia) i `clock-reprint.spec.ts`. Każdy nowy plik e2e zaczyna się od `// Provenance: clock-card (S-41, US-33, US-34, FR-043, FR-044)`.

### Success Criteria:

#### Automated Verification:

- Testy jednostkowe: `npm test`
- Lint, zależności, typy, build: `npm run lint`, `npm run depcruise`, `npx astro check`, `npm run build`
- E2E na czterech projektach Chromium z własnym portem: `E2E_PORT=4399 npx playwright test --project=chromium --project=phone-360 --project=pixel-7 --project=tablet-768`
- Smoke na zbudowanym podglądzie: `BASE_URL=http://localhost:4399 npm run smoke`

#### Manual Verification:

- Użytkowniczka sprawdza każdy poziom i tryb na stronie, z 24 h i bez, oraz podgląd wydruku (jedna strona A4)
- Miniatura w katalogu, plakietka „poz. N” przy profilu i podsumowanie „Zegar: Poziom N · tryb (· 24 h)” w oknie profilu są poprawne
- Strona na telefonie: Generuj i Drukuj się nie zasłaniają, „24 h” w osobnej linii, karta mieści się na A4

**Implementation Note**: po tej fazie zatrzymać się na potwierdzenie.

---

## Phase 4: Wydruk próbny

### Overview

Po scaleniu, nie blokuje wydania: wydruk trzech trybów na kilku poziomach i z 24 h oraz próba z dzieckiem; ewentualna poprawka stałych w małym PR.

### Changes Required:

#### 1. Poprawki stałych (tylko jeśli wydruk ich wymaga)

**File**: `src/lib/clock/levels.ts`, `src/lib/clock/sheet.ts`, `context/foundation/prd.md`, `context/foundation/roadmap.md`

**Intent**: Dopasować wielkość tarczy, liczb, kratek, zegara cyfrowego albo granice pór dnia do wydruku; commit mówi, co wymusiło zmianę. Zamknąć niewiadomą S-41 o porach dnia z datą i decyzją.

**Contract**: wartości w `CLOCK_SHEET` i tabelach poziomów; PRD Business Logic „Karta „Zegar”” i roadmapa S-41 zgodne z kodem.

### Success Criteria:

#### Automated Verification:

- Po ewentualnej poprawce: `npm test` i `npm run build`

#### Manual Verification:

- Wydruk każdego trybu (Poziom 1, 4, 5 i z 24 h) na A4 jest jedną stroną w Safari, Chrome iOS i Brave iOS (lekcja: mierzyć każdą przeglądarkę osobno)
- Dziecko odczytuje liczby i wskazówki, mieści godzinę w kratkach i dorysowuje wskazówki na tarczy Dorysuj
- Niewiadoma S-41 o porach dnia zamknięta w roadmapie i PRD

---

## Testing Strategy

### Unit Tests:

- Reguły karty dla każdego poziomu, trybu i 24 h na wielu ziarnach (minuty, minuty nowe, powtórki, zakres godzin, godziny graniczne i 0:xx, permutacja Połącz, różny klucz).
- Kąty wskazówek, pora dnia, zapis godziny.
- `knownBad` dla każdego kodu problemu; rozmieszczenie w marginesie 10 mm.
- Rejestry: silnik, ustawienia (parsowanie `mode` i `h24`), podsumowanie, kontrakt druku.

### Integration Tests:

- E2E: strona karty, trzy ustawienia układają nową kartę, zapamiętanie w profilu, plakietka, podsumowanie, ponowny druk, telefon.

### Manual Testing Steps:

1. Wygenerować każdy tryb na Poziomie 1 i 4, z 24 h i bez; sprawdzić godziny i wskazówki okiem (7:30 między 7 a 8).
2. Zmienić tryb przy pokazanej karcie — nowa karta; odświeżyć stronę — tryb i 24 h zostają.
3. Wydrukować Odczytaj, Dorysuj i Połącz na A4 w trzech przeglądarkach iOS.

## Performance Considerations

Generowanie jest tanie (najwyżej sześć godzin z puli kilkuset); 5 s z NFR nie jest ryzykiem. Test czasu niepotrzebny poza zwykłym przebiegiem testów.

## Migration Notes

Brak: nowe pole `cards.zegar` w zapisanych profilach ma wartość domyślną przez ogólne `parseStoredCards`; pola `mode` i `h24` mają własne gałęzie w `fieldValue`.

## References

- Makieta i decyzje: `context/changes/clock-card/mockup.mts`, `mockups.html`, `change.md`
- PRD: US-33, US-34, FR-043, FR-044, Business Logic „Karta „Zegar””
- Wzór planu: `context/archive/2026-11-13-math-crossword-card/plan.md`
- Wzór modułu: `src/lib/math-crossword/`; ustawienie układające nową kartę: `src/components/MoneyGenerator.tsx:70-76`, `src/lib/money/engine.ts:69`; lista na pasku: `src/components/CategoryChoice.tsx`
- Issue: drpc1/printo-kids#372

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Dokumenty

#### Automated

- [x] 1.1 Formatowanie dokumentów: `npx prettier --check context/foundation/prd.md context/foundation/roadmap.md context/domain/glossary.md context/changes/clock-card/*.md`
- [x] 1.2 Ustalenia zegara są na gałęzi z `main`: `git merge-base --is-ancestor origin/main HEAD` i `rg -n "US-33|US-34|FR-043|FR-044|0:xx" context/foundation/prd.md` zwraca trafienia
- [x] 1.3 Makieta działa na `main`: `node --experimental-strip-types context/changes/clock-card/mockup.mts` kończy się bez błędu

#### Manual

- [x] 1.4 Diff PRD i roadmapy względem `main` zawiera tylko zmiany zegara (święta nietknięte)
- [x] 1.5 Użytkowniczka potwierdza dopisane zdania (opisy trybów, podsumowanie profilu)

### Phase 2: Logika karty

#### Automated

- [ ] 2.1 Testy przechodzą: `npm test`
- [ ] 2.2 Lint: `npm run lint`
- [ ] 2.3 Zależności: `npm run depcruise`
- [ ] 2.4 Typy: `npx astro check`
- [ ] 2.5 Build: `npm run build`

#### Manual

- [ ] 2.6 Użytkowniczka akceptuje podgląd trzech trybów z `preview.mts` (Poziom 1, Poziom 4, 24 h)
- [ ] 2.7 Przegląd diffu względem planu i makiety

### Phase 3: Strona, katalog i profil

#### Automated

- [ ] 3.1 Testy jednostkowe: `npm test`
- [ ] 3.2 Lint, zależności, typy, build: `npm run lint`, `npm run depcruise`, `npx astro check`, `npm run build`
- [ ] 3.3 E2E na czterech projektach Chromium z własnym portem: `E2E_PORT=4399 npx playwright test --project=chromium --project=phone-360 --project=pixel-7 --project=tablet-768`
- [ ] 3.4 Smoke na zbudowanym podglądzie: `BASE_URL=http://localhost:4399 npm run smoke`

#### Manual

- [ ] 3.5 Użytkowniczka sprawdza każdy poziom i tryb na stronie, z 24 h i bez, oraz podgląd wydruku (jedna strona A4)
- [ ] 3.6 Miniatura w katalogu, plakietka „poz. N” przy profilu i podsumowanie „Zegar: Poziom N · tryb (· 24 h)” w oknie profilu są poprawne
- [ ] 3.7 Strona na telefonie: Generuj i Drukuj się nie zasłaniają, „24 h” w osobnej linii, karta mieści się na A4

### Phase 4: Wydruk próbny

#### Automated

- [ ] 4.1 Po ewentualnej poprawce: `npm test` i `npm run build`

#### Manual

- [ ] 4.2 Wydruk każdego trybu (Poziom 1, 4, 5 i z 24 h) na A4 jest jedną stroną w Safari, Chrome iOS i Brave iOS (lekcja: mierzyć każdą przeglądarkę osobno)
- [ ] 4.3 Dziecko odczytuje liczby i wskazówki, mieści godzinę w kratkach i dorysowuje wskazówki na tarczy Dorysuj
- [ ] 4.4 Niewiadoma S-41 o porach dnia zamknięta w roadmapie i PRD
