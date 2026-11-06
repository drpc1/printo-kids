---
title: Destylacja domeny PrintoKids — mapa, nie kod
created: 2026-11-03
type: domain-distillation
---

# Destylacja domeny PrintoKids

Mapa domeny odkryta z dokumentów i z kodu, stan repozytorium na gałęzi `domain-ddd` (2026-11-03). Nie zawiera kodu produkcyjnego. Każda ścieżka `plik:linia` została otwarta i sprawdzona w tej sesji; czego nie sprawdziłem, mówi sekcja 0.

Skróty źródeł: **PRD** = `context/foundation/prd.md`, **SN** = `context/foundation/shape-notes.md`, **RM** = `context/foundation/roadmap.md`, **AG** = `AGENTS.md`. Odwołania `src/...` są względem korzenia repo.

## 0. Kontekst, stack, ograniczenia

**Dokumenty, które istnieją i zostały przeczytane:** PRD (979 linii, w całości), SN (151), `roadmap.md` (fragmenty M-5 i tabela S-33..S-37), `tech-stack.md`, `README.md`, `AGENTS.md`, `lessons.md`, `context/map/repo-mapv2.md` (początek). Rozszerzoną historię zmian stanowią archiwalne `context/archive/*/change.md`; czytałem tylko te, które rozstrzygały rozjazdy poniżej (`sequence-easy-shapes`, `gh234-profile-on-homepage`, `gh271-web-analytics`).

**Stack:** Astro 7 SSR (Cloudflare Workers) + wyspy React 19 + TypeScript + Tailwind 4 (`context/foundation/tech-stack.md`, AG). Bez backendu: żadnego `fetch(`, `XMLHttpRequest` ani `sendBeacon` w `src` (grep w tej sesji, poza testami: 0 trafień); dane w `localStorage`.

**Gdzie żyje logika biznesowa:**

| Warstwa | Katalog | Rola |
|---|---|---|
| Domena (czyste reguły i generatory, testy `node:test`) | `src/lib/<karta>/` (`maze`, `symmetry`, `sequence`, `sudoku`, `nonogram`, `dictation`, `money`) | reguły karty, poziomy, generator, `*Problems` |
| Wspólny arkusz A4 | `src/lib/sheet/` | postać, dymek, układ labiryntu, własny obrazek |
| Pamięć rodzica | `src/lib/{child-profiles,card-settings,last-used,active-profile,card-summary,catalog-badges}.ts` | profil, ustawienia kart, ostatnie parametry |
| Rejestr rodzajów kart | `src/lib/cards.ts:10` | `CARD_KINDS` |
| Stan strony | `src/hooks/` | `useCardPage`, `useCardSettings`, `useChildProfileVisit`, `useBarCharacter` |
| UI | `src/components/`, `src/pages/*.astro` | generator każdej karty (React), `CardPage` jako wspólna powłoka |

**Ograniczenia tej destylacji (uczciwie):**

1. Nie uruchamiałem testów ani aplikacji. „Egzekwuje" znaczy: widzę kod, który to sprawdza w ścieżce generowania; nie znaczy: test dziś przechodzi.
2. Nie czytałem `tests/e2e/*` ani w całości komponentów `*Generator.tsx` (czytałem fragmenty, tam gdzie zależał od nich werdykt). Rozjazdy w samym rysowaniu SVG mogły mi umknąć.
3. Wiek dziecka, układ druku w przeglądarkach i czytelność wydruku to wiedza, której kod nie niesie; rozstrzyga ją wydruk (PRD Open Questions 5, 9, 11, 13–15).
4. Trzy karty z PRD M-5 („Który nie pasuje", „Skopiuj rysunek na kratce", szlaczki) **nie istnieją w kodzie i to jest zgodne z roadmapą**: RM `S-34`..`S-36` mają status `ready` (RM:45–47), `S-33` (pieniądze) `done` (RM:44). Nie liczę ich jako rozjazdu; wpisuję je do słownika jako terminy „tylko w dokumentach". Wyszukiwanie: `grep -rniE "odd.?one|nie pasuje|szlaczk|copy.?grid|skopiuj"` w `src` trafia wyłącznie w słowo „trace" w `dictation/*` (tracing obrysu), nie w te karty.

## 1. Ubiquitous Language

Konwencja: **PL** = termin z dokumentów, **kod** = identyfikator, który kod naprawdę nosi. Kolumna „W kodzie" jest wypełniona z kodu, nie z PRD; gdzie terminu nie ma, stoi „BRAK w kodzie" z miejscem poszukiwań.

### 1.1 Pojęcia centralne

| Termin (PL) | Definicja | Cytat źródłowy | W kodzie |
|---|---|---|---|
| **Rodzaj karty** | Typ generatora z własną stroną i własnym adresem (labirynt, symetria…). | „Każdy rodzaj ma własną stronę z własnym adresem" (PRD:144, US-05) | `CardKind`, `CARD_KINDS` — `src/lib/cards.ts:1`, `:10`. Id po polsku: `labirynt`, `symetria`, `sudoku`, `sekwencje`, `nonogram`, `dyktando`, `pieniadze` (`cards.ts:12–60`) |
| **Karta** (wygenerowana) | Jedna wygenerowana kartka A4 z jedną sprawdzalną odpowiedzią. | „Aplikacja zawsze tworzy kartę, w której każdy ciąg ma dokładnie jedną odpowiedź" (PRD:701) | per rodzaj: `SymmetryCard` (`symmetry/generate.ts:13`), `SequenceCard` (`sequence/generate.ts:25`), `NonogramCard`/`SimpleNonogramCard` (`nonogram/generate.ts:12`, `simple.ts:14`), `DictationCard` (`dictation/generate.ts:20`), `MoneyCard` (`money/rules.ts:12`), `SudokuCard` (`sudoku/generate.ts:17`). **Labirynt nie ma `Card`: jego wynikiem jest `Maze`** (`maze/generate.ts:10`) |
| **Labirynt** | Karta z jedną drogą od startu do mety. | „Istnieje dokładnie jedna prawidłowa ścieżka prowadząca od startu do mety" (PRD:86) | `Maze`, `generateMaze` (`maze/generate.ts:30`), `countPaths` (`:78`), `mazeForSheet` (`:114`). W UI nazywany `Worksheet` (`src/components/WorksheetGenerator.tsx`) |
| **Poziom** | Wybór trudności w obrębie jednej karty; bez nazw wieku. | „karty z trzema poziomami mają łatwy / średni / trudny, karty z większą liczbą poziomów numery" (PRD:47) | `Level` (labirynt, `maze/levels.ts:12`), `SymmetryLevel`, `SequenceLevel`, `DictationLevel`, `MoneyLevel`; **`NonogramSize` (to jest poziom!)** `nonogram/sizes.ts:4`; `SudokuLevelId` (`sudoku/levels.ts:4`) |
| **Dawna nazwa (wiek)** | Etykieta wieku, zostaje tylko w identyfikatorach i jako dopisek. | „nie jest nazwą poziomu ani etykietą na pasku" (PRD:666) | `typicalAge` w `Level`/`SymmetryLevel`/`SequenceLevel`/`DictationLevel`; id `lat3…lat7`, `nastolatek` (`maze/levels.ts:3`) |
| **Postać** | Kolorowy obrazek z katalogu 11 + „Bez postaci"; stoi przy starcie albo przy poleceniu. | „Katalog to jedenaście postaci" (PRD:111, US-03) | `CHARACTER_CHOICES` (`sheet/character.ts:3`), 11 wierszy + `none` (policzone w tablicy i pilnowane testem `sheet/character.test.ts:35`) |
| **Bez postaci** | Brak postaci na karcie. | „Wiersz „Bez postaci" zostaje" (PRD:111) | `id: "none"`, `label: "Brak"` (`sheet/character.ts:1`) — **etykieta w kodzie to „Brak", w PRD „Bez postaci"** |
| **Własny obrazek** | Zdjęcie rodzica, zostaje w przeglądarce. | „Plik nie trafia na serwer" (PRD:100) | `OWN_IMAGE_ID = "wlasne"` (`sheet/character.ts:97`), `OWN_IMAGE_LABEL = "Własne zdjęcie"` (`:99`), `copyOwnImage` (`sheet/own-image.ts:25`), `OWN_IMAGE_KEY` (`own-image-store.ts:4`) |
| **Dymek / pas z postacią** | Postać mówi polecenie. | „postać stoi przy zdaniu polecenia, a polecenie jest w jej dymku" (PRD:387, nagłówek US-21) | `SPEECH_BAND`, `layoutSpeechBand`, `instructionLines` (`sheet/speech.ts:6`, `:187`, `:173`) |
| **Znak postaci / Start / Meta** | Na labiryncie: miejsce postaci nad wejściem; bez postaci napis „Start". | „znak postaci zostaje na środku wejścia" (PRD:670) | `mark`, `start`, `meta` w `SheetLayout` (`sheet/layout.ts:34`), `layoutSheet` (`:42`) |
| **Profil dziecka** | Imię + ulubiona postać + ustawienia każdej karty; opcjonalny, lokalny. | „Profil dziecka to imię i ulubiona postać" (PRD:197) | `ChildProfile` (`child-profiles.ts:14`), klucz `printo-kids:child-profiles` (`:6`) |
| **Ulubiona postać** | Postać profilu, zmieniana tylko jawnie. | „Ulubiona postać zmienia się tylko jawnie" (PRD:201) | `ChildProfile.character`, `withFavorite` (`child-profiles.ts:82`), `favoriteDiffers` (`:150`); wymuszenie „nie zapisuj pod profilem": `recordBarCharacter` (`sheet/own-image-store.ts:86–92`) |
| **Bez profilu** | Jawny wybór braku profilu. | „„Bez profilu"" (PRD:150) | `NO_PROFILE = "none"` (`active-profile.ts:4`) |
| **Ostatnie parametry** | Ustawienia urządzenia bez profilu: ustawienia osobno dla każdej karty + jedna postać. | „Rodzic bez profilu dziecka otrzymuje jako widoczne, edytowalne wartości domyślne ostatnio użyte parametry" (PRD:544, FR-006) | `LastUsed` (`last-used.ts:11`), klucz `printo-kids:last-used` (`:3`) |
| **Pasek** (ustawień karty) | Wiersz kontrolek strony karty. | „wszystko, co jest na pasku tej karty poza postacią i poza „Pokaż rozwiązanie"" (PRD:198) | tylko metaforycznie: `BarChoice` (`child-profiles.ts:72`), `ProfileBar` (`hooks/useChildProfileVisit.ts:9`), `useBarCharacter`, `barLabel` w poziomach. Pasek ustawień karty = `CardSettingsMap` (`card-settings.ts:57`) |
| **Ustawienia karty** | Zapamiętywana część paska danej karty. | tabela „Profil i zapamiętane ustawienia" (PRD:884) | `CardSettingsMap`, `CardSettingsId`, `CARD_SETTINGS_IDS` (`card-settings.ts:57`, `:67`, `:69`), `DEFAULTS` (`:84`), `withCardSettings` (`:104`), `parseStoredCards` (`:139`) |
| **Wizyta** | Otwarcie strony karty ze stanem profilu. | BRAK w PRD jako terminu | `openingVisit`, `OpeningVisit`, `useChildProfileVisit` (`child-profiles.ts:162`, `:76`; `hooks/useChildProfileVisit.ts:38`) — **termin tylko w kodzie** |
| **Plakietka / podsumowanie** | Zapamiętany poziom na miniaturze i w oknie profilu. | „miniatury od razu pokazują zapamiętany poziom" (PRD:150) | `CardSummary`, `cardSummaries`, `badgeOf` (`card-summary.ts:14`, `:29`, `:124`), `catalogBadges` (`catalog-badges.ts:23`) |
| **Katalog** (strona główna) | Strona z miniaturami rodzajów kart. | „Strona główna to katalog" (PRD:143) | `CardCatalog.astro`, `cardsInCatalogOrder` (`cards.ts:69`) |

### 1.2 Pojęcia zadania i sprawdzania

| Termin (PL) | Definicja | Cytat źródłowy | W kodzie |
|---|---|---|---|
| **Jedna sprawdzalna odpowiedź** | Niezmiennik wspólny dla kart: aplikacja zna i potrafi sprawdzić odpowiedź. | „Odpowiedź jest jedna: odbicie wzoru względem osi. Aplikacja potrafi ją wyliczyć i sprawdzić" (PRD:166) | wzorzec funkcji `*Problems`: `symmetryCardProblems` (`symmetry/generate.ts:191`), `sequenceRowProblems`/`sequenceCardProblems` (`sequence/generate.ts:190`, `:247`), `sudokuCardProblems` (`sudoku/generate.ts:322`), `nonogramCardProblems` (`nonogram/generate.ts:89`), `simpleNonogramProblems` (`nonogram/simple.ts:86`), `dictationCardProblems` (`dictation/generate.ts:193`), `moneyCardProblems` (`money/rules.ts:87`). **Dla labiryntu: `mazeForSheet` (`maze/generate.ts:114`)** |
| **Dwuznaczność** | Do pustego pola pasują dwie reguły z różnymi odpowiedziami; karta nie jest pokazana. | „Karta, w której do pustego pola pasują dwie reguły dające różne odpowiedzi, nie jest pokazana" (PRD:233) | `"ambiguous"`, `sequenceAnswers`, `hypotheses`, `visiblePeriodReadings` (`sequence/generate.ts:45`, `:165`; `sequence/rules.ts:207`, `:234`) |
| **Reguła** (ciągu) | Jawna lista: AB, AAB, ABC, ABB, +1, +2, −1, mieszane. | „Reguły pochodzą z jawnej listy" (PRD:703) | `SequenceRuleId` (`sequence/rules.ts:10`) |
| **Luka / puste pole** | Pole, które dziecko uzupełnia. | „część pól jest wypełniona, a część pusta" (PRD:231) | `gaps` w `SequenceRow` (`sequence/generate.ts:22`) |
| **Podpowiedź** (symetria) | Kratki odbicia już zamalowane, blade. | „podpowiedź (kilka kratek odpowiedzi już zamalowanych, bledszych niż wzór)" (PRD:182) | `hints`, `hintCount`, `SYMMETRY_SHEET.hintOpacity` (`symmetry/generate.ts:21`, `symmetry/levels.ts:19`). **To samo słowo „podpowiedź" w PRD znaczy też komunikat „Zapamiętane dla…" (US-22)** — patrz 1.4 |
| **Odbicie / oś** | Odpowiedź symetrii; oś zawsze pionowa. | „oś jest zawsze pionowa" (PRD:678) | `mirrorAnswer`, `SymmetryAxis = "vertical"` (`symmetry/generate.ts:285`, `:11`) |
| **Szablon obiektu** | Połowa symetrycznego obiektu z losowanymi częściami, w trzech rozmiarach. | „Katalog szablonów obiektów" (PRD:753) | `SymmetryTemplate`, `SymmetryPart`, `SymmetryObjectSizes` (`symmetry/template-format.ts:29`, `:23`, `:46`); katalog `CATALOG` (`symmetry/templates.ts:32`), pliki `symmetry/objects/*.ts`. **W kodzie „obiekt" to `template`, a cały byt mieszka w module `symmetry`** |
| **Część / wariant części** | Losowana część obiektu (okno, pestki). | „części losowane przez generator" (PRD:366) | `SymmetryPart.variants` (`template-format.ts:23–27`) |
| **Dziura / detal** | Pusta kratka wewnątrz sylwetki (okno, oko). | „Detale będące dziurami w sylwetce zostają pustymi kratkami" (PRD:306) | `details`, `findHoles`, `holeColor` (`symmetry/generate.ts:24`, `:146`; `template-format.ts:41`) |
| **Kategoria obiektów** | Zwierzęta, Jedzenie, Przyroda, Kosmos i maszyny, Domy i budowle, Kształty; „Wszystkie" to osobna kategoria. | „Wszystkie to też kategoria, a nie zaznaczenie kilku" (PRD:381) | `OBJECT_CATEGORIES` (`template-format.ts:6`), `OBJECT_CATEGORY_CHOICES`, `DEFAULT_OBJECT_CATEGORY_ID = "wszystkie"` (`templates.ts:45`, `:50`). Id: `zwierzeta`, `jedzenie`, `przyroda`, `kosmos`, `budowle`, `ksztalty` |
| **Kolory / kredka** | Prawdziwe kolory kratek na wydruku, bez liter i legendy. | „Kolor to prawdziwy kolor kratki, bez liter i bez legendy" (PRD:217) | trzy odrębne palety: `SYMMETRY_COLORS` (8, `template-format.ts:1`), `SEQUENCE_CRAYONS` (9, `sequence/colors.ts:8`), `SUDOKU_SHAPE_COLORS` (9, `sudoku/colors.ts:7`). Wspólne tokeny CSS `--symmetry-*` |
| **Kształt** | Zob. 1.4 — cztery znaczenia. | PRD:232 i 703 (sekwencje), 365 (kategoria „Kształty"), 802 (kształty dyktanda) | `SequenceShape` (`sequence/shapes.ts:3`), `SudokuShapeId` (`sudoku/shapes.ts:7`), `DictationShape` (`dictation/shapes.ts:14`), kategoria `ksztalty` |
| **Znaczek** (nonogram łatwy) | Biały/szary/czarny kwadracik z liczbą kratek. | „biały, szary albo czarny kwadracik z liczbą kratek" (PRD:311) | `kind: "znaczki"`, `Tone`, `ToneRun`, `outlineTones` (`nonogram/simple.ts:5`, `:9`, `:30`) |
| **Dyktando / polecenie / obrys** | Polecenie = liczba kratek + strzałka; droga = zewnętrzny obrys sylwetki. | „Polecenie to liczba kratek i strzałka" (PRD:336) | `DictationCommand`, `traceOutline`, `walkCommands` (`dictation/outline.ts`), `dictationCardFromSilhouette` (`dictation/generate.ts:141`) |
| **Pokaż rozwiązanie** | Przełącznik podglądu odpowiedzi na ekranie; nigdy w druku. | „wydruk nigdy nie pokazuje rozwiązania" (PRD:309) | w komponentach `NonogramGenerator.tsx`, `DictationGenerator.tsx` (nie czytałem w całości); celowo poza `CardSettingsMap` (`card-settings.ts:57–65`) |
| **Kupka / sztuka / nominał / remis / mylenie liczbą sztuk** | Pojęcia karty „Kto ma więcej?". | „Rząd „myli", gdy kupka z ściśle mniejszą liczbą sztuk jest ściśle więcej warta" (PRD:829) | `MoneyRow`, `pileValue`, `pieceCount`, `isMisleading`, `MAX_TIE_ROWS`, `MoneyAnswer = "left"\|"right"\|"equal"` (`money/rules.ts:3–43`, `:20`) |
| **A4, margines 10 mm, jedna strona** | Granica druku wspólna dla wszystkich kart. | „zachowuje margines co najmniej 10 mm z każdej strony" (PRD:637, NFR) | `pageWidth: 210, pageHeight: 297, inset: 10` osobno w 6× `src/lib/*/sheet.ts` (np. `money/sheet.ts:8–10`) i `PAGE_WIDTH/PAGE_HEIGHT/INSET` w `WorksheetGenerator.tsx:27–29`; `@page` w `GeneratorShell.astro:51` |
| **Jak to działa** | Strona z opisem zasady profilu, poziomów i rodzajów. | „link do krótkiej strony „Jak to działa"" (PRD:414, US-22) | `src/pages/how-it-works.astro`, `CardKind.description` (`cards.ts:6`) |
| **Analityka** | BRAK w PRD. | `grep -in "analytic\|beacon"` w PRD i RM: 0 trafień | `webAnalyticsBeacon` (`src/lib/analytics.ts:11`), użyte w `src/layouts/Layout.astro:3` — **termin i zachowanie tylko w kodzie**; sekcja 4, R-8 |

### 1.3 Terminy tylko w dokumentach (celowe — karty z M-5 jeszcze niezbudowane)

„Który nie pasuje", „Skopiuj rysunek na kratce", „Szlaczki" (PRD:448, 475, 502; RM:45–47, status `ready`). Szukałem po: `odd`, `nie pasuje`, `szlaczk`, `copy`, `skopiuj`, `trace`, `pattern-lines`. Wynik: brak. Jest to **zgodne z planem**, nie rozjazd.

Termin z PRD, którego brak, choć PRD go zobowiązuje: **„Zacznij od nowa"** (FR-032, PRD:615). Szukałem `grep -rn "Zacznij od nowa" src`: 0 trafień. FR-032 ma priorytet `nice-to-have`, więc to luka, nie błąd.

### 1.4 Słowa o kilku znaczeniach = kandydaci na granice kontekstów

| Słowo | Znaczenia w różnych miejscach | Proponowane konteksty |
|---|---|---|
| **„none"** | (a) „bez postaci": `noneChoice.id` (`sheet/character.ts:1`) i `UNSET_CHARACTER` (`last-used.ts:4`); (b) „bez profilu": `NO_PROFILE` (`active-profile.ts:4`). Ten sam literał, dwa pojęcia, dwa klucze `localStorage`. W `openingVisit` wartość `stored` porównuje się z `NO_PROFILE` po tym, jak sprawdzi się id profili (`child-profiles.ts:167–174`) | **Wybór postaci** vs **Tożsamość dziecka (profil)** |
| **„Kształt"** | (1) element ciągu w sekwencjach — 7 wartości, w tym `strzalka` (`sequence/shapes.ts:3`); (2) symbol sudoku — 9 wartości (`sudoku/shapes.ts:7`); (3) „kształt dyktanda" — ręcznie rysowana sylwetka bez symetrii (`dictation/shapes.ts:14`); (4) kategoria „Kształty" figur geometrycznych w katalogu szablonów (`template-format.ts:12`). `sequence/shapes.ts:1` importuje ścieżki z sudoku | **Symbole zadania** (sekwencje, sudoku) vs **Katalog obiektów** (dyktando, „Kształty") |
| **„Karta"** | (a) rodzaj (`CardKind`), (b) wygenerowany wynik (`SymmetryCard`…), (c) strona generatora (`CardPage.tsx`), (d) wydruk A4 (`sheet`, `*_SHEET`). W labiryncie (b) to `Maze`, a nazwa komponentu to `Worksheet` | **Katalog/rejestr** vs **Generowanie** vs **Arkusz/druk** |
| **„Poziom" / `lat5`** | Identyfikator `lat5` znaczy **Poziom 3** w labiryncie (`maze/levels.ts:57–59`), **Poziom 2** w symetrii (`symmetry/levels.ts:35–36`) i sekwencjach (`sequence/levels.ts:46–47`), a w dyktandzie **„łatwy"** (`dictation/levels.ts:31–34`). `lat6`: Poziom 4 / Poziom 3 / „średni". Poziomy różnych kart nie są porównywalne (PRD:880) | każda karta ma własny **Poziom**; wspólny typ nie istnieje |
| **„Size/rozmiar"** | `NonogramSize` = poziom nonogramu (`nonogram/sizes.ts:4`: „The ids name the old sizes"); `SudokuSize` = wymiar planszy 4/6/9 (`sudoku/levels.ts:2`); w PRD „rozmiar" to także rozmiar kratki | **Nonogram** vs **Sudoku** |
| **„Podpowiedź"** | (1) kratki odbicia na symetrii (`hints`); (2) komunikaty pomocy typu „Zapamiętane dla {imię}" (PRD:410, US-22, `hooks/useCardSettings.ts:36`) | **Zadanie symetrii** vs **Pamięć/UX** |
| **„Obiekt"** | W PRD: sylwetka z katalogu; w kodzie: `template`. „Object" w kodzie pojawia się jako katalogi `objects/` i `object-categories` | jeden kontekst, dwie nazwy |
| **„Worksheet"** | Nazwa komponentu labiryntu (`WorksheetGenerator.tsx`) i id elementu `worksheet-home` używane przez wszystkie karty (`CardPage.tsx:58`, `GeneratorShell.astro:13`), a PRD i `AGENTS.md` mówią „karta" | **Labirynt** (historyczne) vs wspólna powłoka |
| **„Rozwiązanie"** | Maze: ścieżka (`countPaths`); nonogram/dyktando: sylwetka (`solution`); w sudoku `givens`/wynik; w szlaczkach (M-5) „bez jednej sprawdzalnej odpowiedzi" (PRD:512) | wspólne tylko jako idea |

## 2. Klasyfikacja subdomen

Kryterium rdzenia wynika z wizji: rodzic nie ma już darmowej, dopasowanej biblioteki, więc potrzebuje „sposobu na wygenerowanie nowej karty na właściwym poziomie" (PRD:20, Vision & Problem Statement) oraz kart z jedną sprawdzalną odpowiedzią (Business Logic, PRD:653 i dalej). Przewagą jest **algorytmiczna, weryfikowalna generacja kart na poziomie**, nie druk ani przechowywanie.

| Obszar / pojęcie | Kategoria | Uzasadnienie (cel produktu) |
|---|---|---|
| Generatory z weryfikacją jednej odpowiedzi: labirynt, sudoku, sekwencje, nonogram, dyktando, symetria, pieniądze (`src/lib/<karta>/`) | **Core** | Vision: „nowa karta na właściwym poziomie"; Success Criteria: „rozwiązywalny labirynt", Business Logic każdej karty zaczyna się od „Aplikacja zawsze tworzy…" |
| Poziomy (reguły trudności per karta, `*/levels.ts`) | **Core** | „Poziom 3 labiryntu i Poziom 3 symetrii nie oznaczają tej samej trudności" (FR-001 Socrates, PRD:535) — to wiedza produktowa |
| Katalog szablonów obiektów z częściami i kategoriami (`symmetry/objects/*`, `templates.ts`) | **Core** | FR-028: „więcej obiektów z losowanymi częściami odsuwa powtórki"; wprost odpowiada na „skończoną bibliotekę" z Vision |
| Postać w dymku przy poleceniu, własny obrazek | **Supporting** | FR-030 „ozdoba, nie część zadania"; wyróżnia produkt dla dziecka, ale nie jest przewagą generowania |
| Profil dziecka + pamięć ustawień kart + ostatnie parametry (`child-profiles`, `card-settings`, `last-used`, `useCardSettings`) | **Supporting** | FR-017: skraca kolejne generowanie; „Drukowanie nie wymaga utworzenia profilu" (PRD:69) — czyli nie jest warunkiem wartości |
| Katalog kart, plakietki, „Jak to działa" | **Supporting** | US-05, US-22 |
| Arkusz A4: układ, margines 10 mm, `@page`, druk na iOS | **Supporting** (wysokie ryzyko, nie przewaga) | Guardrails PRD:69–72; `lessons.md` o różnicach iOS. Wartość tkwi w tym, że druk działa, nie w tym, jak |
| Własny obrazek: kopiowanie i przechowywanie w przeglądarce | **Supporting** | US-02; reguła prywatności |
| Przechowywanie w `localStorage`, obsługa zablokowanego magazynu | **Generic** | Non-goals: „MVP nie ma kont… synchronizacji" (PRD:931); każdy `try/catch` w `*-store` jest szablonowy |
| Wdrożenie (Cloudflare Workers), CI, Playwright, Stryker, dep-cruiser | **Generic** | `tech-stack.md`, AG „Branches and releases" |
| Komponenty UI (`src/components/ui`, shadcn) | **Generic** | AG „UI" |
| Analityka (Cloudflare Web Analytics) | **Generic**, poza PRD | `src/lib/analytics.ts:11–17`; brak w PRD i RM, patrz R-8 |
| Pieniądze (wygląd monety, banknot) | Core (reguły) + Supporting (rysunek) | PRD:817 i dalej; wygląd to decyzja o prawach (Open Questions 14) |

## 3. Kandydaci na agregaty i niezmienniki

Status: **egzekwuje** (kod odrzuca naruszenie w ścieżce generowania/zapisu), **deklaruje** (komentarz/typ/nazwa, bez sprawdzenia), **ignoruje** (kod nie wie), **przeczy** (kod robi odwrotnie).

### A1. Karta labiryntu (`Maze` + poziom)

| Niezmiennik | Cytat | Status |
|---|---|---|
| Dokładnie jedna droga start→meta | „Istnieje dokładnie jedna prawidłowa ścieżka" (PRD:86) | **Egzekwuje, ale po stronie UI.** Sprawdza `mazeForSheet` → `countPaths(...) !== 1` (`maze/generate.ts:126`), wołane z `WorksheetGenerator.tsx:52` i `:74`. `generateMaze` sam zwraca niezweryfikowany labirynt; poprawność wynika z konstrukcji (Kruskal/backtracker dają drzewo, `:188`, `:202`) |
| Meta w dolnym wierszu, w dozwolonych kolumnach (≥2 od środka) | „co najmniej 2 kolumny od środka" (PRD:88) | Egzekwuje: `exitColumns.includes(exit.col)` (`maze/generate.ts:123`); listy w `maze/levels.ts` zgodne z regułą (sprawdziłem poziomy 1–5 ręcznie) |
| Karta = najlepsza z 20 | „Generator losuje 20 labiryntów" (PRD:672) | Egzekwuje: `CANDIDATES_PER_SHEET = 20` (`:26`), `scoreMaze` (`:61`) |
| Margines ≥10 mm, jeden A4 | PRD:637 | Egzekwuje w `layoutSheet` + testy `sheet/layout.test.ts`; stałe `INSET = 10` żyją w komponencie (`WorksheetGenerator.tsx:29`) |

### A2. Karta symetrii (+ szablon obiektu)

| Niezmiennik | Cytat | Status |
|---|---|---|
| Wzór ma ≥1 zamalowaną i ≥1 pustą kratkę, dotyka osi, nie ma kratek poza połową | PRD:166–168, 695 | **Egzekwuje**: `symmetryCardProblems` (`symmetry/generate.ts:191–282`), wołane w pętli generowania `:64` |
| Odpowiedź = odbicie, podpowiedzi to podzbiór odpowiedzi, nigdy cała | PRD:166, 695 | Egzekwuje: `hint-not-in-answer`, `hints-reveal-all`, `hint-count-mismatch` (`:275–280`) |
| Każde Generuj daje inny obiekt/wariant niż poprzednio | PRD:169 | Egzekwuje: `card.key !== previousKey` (`:64`) |
| Obiekt symetryczny lewo–prawo, ≥4 obiekty w kategorii w każdym rozmiarze | PRD:365–366 | Egzekwuje testem `symmetry/templates.test.ts:47`; symetria wynika z konstrukcji (połowa + odbicie) |

### A3. Wiersz sekwencji (`SequenceRow`) i karta sekwencji

| Niezmiennik | Cytat | Status |
|---|---|---|
| Wiersz ma dokładnie jedną odpowiedź względem całej listy reguł i odczytań widocznych | PRD:233, 722 | **Egzekwuje**: `sequenceRowProblems` → `ambiguous` / `no-answer` / `answer-mismatch` (`sequence/generate.ts:235–242`) na zbiorze hipotez szerszym niż lista reguł (`rules.ts:207–224`) |
| Karta nie pokazuje dwa razy tej samej sekwencji | PRD:721 | Egzekwuje: `duplicate-row` (`:265–269`) |
| Mieszane pokazują ≥2 liczby | PRD:723 | Egzekwuje: `MIXED_MIN_VISIBLE_NUMBERS` (`rules.ts:38`, `generate.ts:232`) |
| Liczby 1–20 | PRD:718 | Egzekwuje: `SEQUENCE_NUMBER_MAX` (`rules.ts:8`), `isKnownItem` (`generate.ts:183`) |

### A4. Plansza sudoku

| Niezmiennik | Cytat | Status |
|---|---|---|
| Dokładnie jedno rozwiązanie | PRD:733 | **Egzekwuje**: `countSudokuSolutions(card.givens, size, 2) !== 1` → `not-unique` (`sudoku/generate.ts:350`) |
| Liczba pustych pól zgodna z rozmiarem i poziomem; 4×4: po jednym w każdym wierszu | PRD:737–747 | Egzekwuje: `blank-count`, `blank-count-per-row` (`:334–336`), tabela w `sudoku/levels.ts` (`BLANKS`) |

### A5. Karta nonogramu

| Niezmiennik | Cytat | Status |
|---|---|---|
| Z liczb wynika jeden obrazek i dochodzi się do niego bez zgadywania | „Dziecko dochodzi do obrazka bez zgadywania" (PRD:306) | **Egzekwuje** dla klasycznych: `solveNonogram(...).status === "solved"` i równość z `solution` (`nonogram/generate.ts:98–103`) |
| Łatwy poziom: jedno rozwiązanie „z samej konstrukcji" | PRD:784 | Egzekwuje częściowo: `simpleNonogramProblems` sprawdza tylko `no-filled-cell`, `too-many-runs` (≤7), `runs-mismatch` (`nonogram/simple.ts:86–97`); jednoznaczność wynika z pełnego opisu wiersza |

### A6. Karta dyktanda

| Niezmiennik | Cytat | Status |
|---|---|---|
| Droga zamknięta, bez przecięć i bez dotyku sama siebie, w kratce, równa obrysowi sylwetki | PRD:337, 794 | **Egzekwuje**: `not-closed`, `repeated-vertex`, `outside-margin`, `not-the-outline` (`dictation/generate.ts:210–231`) |
| Punkt startu w lewym górnym rogu sylwetki | „w lewym górnym rogu sylwetki" (PRD:794) | **Deklaruje/konstrukcja**: `startCol = min(col w górnym wierszu)` (`dictation/outline.ts:217`); `dictationCardProblems` tego nie sprawdza |
| Kształty nie muszą być symetryczne ani pionowe (wyjątek) | PRD:337, 802 | Egzekwuje przez osobny katalog `DICTATION_SHAPES` (`dictation/shapes.ts:389`) |

### A7. Karta „Kto ma więcej?"

| Niezmiennik | Cytat | Status |
|---|---|---|
| Odpowiedź w rzędzie = porównanie wartości; remis najwyżej w jednym rzędzie | „Remis jest dozwoloną odpowiedzią… w zerze albo jednym rzędzie" (PRD:429) | **Egzekwuje**: `compareRow`, `MAX_TIE_ROWS = 1`, `tie-rows` (`money/rules.ts:30`, `:20`, `:98`) |
| Liczba rzędów „mylących" w widełkach poziomu | PRD:825–829 | Egzekwuje: `misleading-count` (`money/rules.ts:101–104`); widełki: `money/levels.ts:149–150`, `:160–161`, `:171–172` |
| Dwie identyczne kupki nie są remisem | PRD:829 | Egzekwuje: `identical-piles` (`money/rules.ts:80`) |

### A8. Profil dziecka + ustawienia kart (`ChildProfile`, `CardSettingsMap`, `LastUsed`, aktywny profil)

| Niezmiennik | Cytat | Status |
|---|---|---|
| Ulubiona postać zmienia się tylko jawnie | „Ulubiona postać zmienia się tylko jawnie" (PRD:201) | **Egzekwuje**: przy aktywnym profilu `recordBarCharacter` wychodzi bez zapisu (`own-image-store.ts:87–89`); zapis tylko przez `withFavorite` (`child-profiles.ts:82`) |
| Niemożliwa kombinacja ustawień nie jest zapisywana (sudoku 4×4 → kształty) | PRD:276 (sudoku), kod | Egzekwuje: `normalizeSudoku` (`card-settings.ts:222–228`), `withCardSettings` normalizuje (`:109`) |
| Zgodność wstecz: dawny `level` → poziom labiryntu, raz | PRD:910 | Egzekwuje: `parseStoredCards` (`card-settings.ts:139–157`), `writeLastUsedCards` usuwa `level` (`last-used.ts:55`) |
| Nazwa: niepusta, ≤40 punktów kodowych, unikalna bez względu na wielkość liter | brak w PRD jako reguły | Egzekwuje: `profileNameError` (`child-profiles.ts:41–59`) — **reguła istnieje tylko w kodzie** |
| **Profil pozostaje dostępny do czasu usunięcia przez rodzica** | „pozostają dostępne między wizytami do czasu usunięcia ich przez rodzica" (PRD:647) | **Przeczy w jednym przypadku.** `readChildProfiles` odrzuca wpis z postacią spoza `allowed` (`child-profiles.ts:264–267`), a `useCardSettings.persist` czyta tę przefiltrowaną listę i zapisuje ją z powrotem (`hooks/useCardSettings.ts:79–85`) — wpis znika z `localStorage` przy następnej zmianie paska. Odrzucanie jest celowe i testowane (`child-profiles.test.ts:127`), ale PRD o tym nie mówi |
| Id profilu nie zderza się z `NO_PROFILE` | — | **Ignoruje.** Id to `crypto.randomUUID()` (`ProfileCorner.tsx:289`), więc kolizja jest praktycznie niemożliwa, ale nic jej nie zabrania, a `openingVisit` sprawdza id przed `NO_PROFILE` (`child-profiles.ts:167–174`) |
| Okno profilu nie otwiera się samo na stronie głównej | „Okno profilu nie otwiera się samo, także gdy są co najmniej dwa profile i żaden nie jest wybrany" (PRD:150) | Egzekwuje na katalogu: `ask={false}` (`CatalogProfileCorner.tsx:30`). Na stronach generatorów `ask` z `openingVisit` otwiera okno (`ProfileCorner.tsx:82`) — PRD zdanie dotyczy katalogu |

### A9. Rejestr rodzajów kart (`CardKind` ↔ `CardSettingsId` ↔ podsumowanie)

| Niezmiennik | Cytat | Status |
|---|---|---|
| Każdy rodzaj karty ma ustawienia, podsumowanie, stronę i miniaturę | „Nowe rodzaje kart dokładają swoje ustawienia w ten sam sposób" (PRD:198) | **Egzekwuje testem, nie typem.** `CARD_SETTINGS_IDS` = id z `CARD_KINDS` (`card-settings.test.ts:33`). Dodanie karty wymaga zmian w: `cards.ts`, `card-settings.ts` (interfejs `:57`, lista `:69`, `DEFAULTS` `:84`, `levelIds` `:191`), `card-summary.ts:54`, strona `.astro`, komponent, `scripts/build-thumbnails.mjs` (grep `pieniadze` w `src`/`scripts`: 6 plików) |

### A10. Arkusz A4 (kontrakt druku)

| Niezmiennik | Cytat | Status |
|---|---|---|
| Jedna strona A4, margines ≥10 mm, `@page` w jednym miejscu | AG „UI": „`@page` stays in `GeneratorShell.astro`" | **Egzekwuje testem treści**: `sheet/print-contract.test.ts:34–43` (string-matching po źródłach). Stałe 210/297/10 zduplikowane w 7 miejscach (6× `*/sheet.ts` + `WorksheetGenerator.tsx:27–29`) |
| Generowanie ≤5 s | PRD:70, 636 | Częściowo: test czasu w `money`, `sequence`, `sudoku`, `nonogram`, `maze`; **brak w `symmetry/generate.test.ts` i `dictation/generate.test.ts`** (`grep -c "performance\|Date.now"` = 0) |

## 4. Rozjazdy MODEL vs KOD

Kolumna „Co naprawić": **kod**, **dokument** (tylko gdy cytuję późniejszą decyzję), albo **decyzja** (nie wiadomo, która strona ma rację).

| # | Dokument mówi | Kod robi | Dowód | Co naprawić |
|---|---|---|---|---|
| R-1 | Poziom 3 sekwencji (6 lat): „wzór AB, AAB, ABC z kształtami", bez liczb (PRD:709) | Opis poziomu w liście na pasku obiecuje liczby: „liczby i wzory, 2 puste pola"; reguły tego poziomu to tylko AB/AAB/ABC | `src/lib/sequence/levels.ts:66` vs `:70–74` | **Kod** (tekst opisu). Nie ma późniejszej decyzji o liczbach na Poziomie 3; PRD:709 (tabela poziomów) jest tu źródłem; zmiana `context/archive/2026-10-26-sequence-age6-shapes-only` (sam tytuł, `change.md` bez treści) wskazuje to zwężenie do kształtów |
| R-2 | „Elementy to cztery kształty (koło, kwadrat, trójkąt, gwiazdka)" (PRD:703; PRD:232) | `SEQUENCE_SHAPES` ma 7: + serce, krzyżyk, strzałka | `src/lib/sequence/shapes.ts:3–13` | **Dokument.** Późniejsza decyzja: `context/archive/2026-10-26-sequence-easy-shapes/change.md` („Sekwencje: krzyżyk, serce i ukośna strzałka", GitHub #112, archiwum 2026-10-27) |
| R-3 | „Profile… pozostają dostępne… do czasu usunięcia ich przez rodzica" (PRD:647) | Profil z nierozpoznaną postacią albo zduplikowaną nazwą jest odrzucany przy odczycie i znika po następnym zapisie ustawień | `child-profiles.ts:260–267`, `:269–277`; zapis zwrotny `hooks/useCardSettings.ts:79–85`; test odrzucania `child-profiles.test.ts:127` | **Decyzja** (właściciel): czy usunięta z katalogu postać (por. Open Questions 3 o prawach do postaci) ma kasować profil, czy wracać do „Bez postaci". Dziś kod robi pierwsze, NFR mówi drugie |
| R-4 | „Drukowanie nie wymaga utworzenia profilu dziecka" (PRD:69); SN: „brak profilu nie blokuje druku" (SN Guardrails) | Przy ≥2 profilach i braku wyboru Generuj jest wyłączone, a okno profilu otwiera się samo; wyjście to „Bez profilu" | `hooks/useChildProfileVisit.ts:54`, `components/CardPage.tsx:125`, `:144`, `ProfileCorner.tsx:82` | **Decyzja:** PRD nie opisuje tego zachowania wprost (FR-008 mówi tylko o selektorze). Jeśli „wybór przed Generuj" ma zostać, dopisać do US-08/US-05 |
| R-5 | PRD:150 (GitHub 234): okno profilu nie otwiera się samo przy ≥2 profilach bez wyboru | Zachowanie zależy od strony: katalog `ask={false}`, generatory `ask` z `openingVisit` | `CatalogProfileCorner.tsx:30`, `child-profiles.ts:184` | **Dokument** doprecyzować: zdanie PRD jest o katalogu; generatory celowo pytają (testy `child-profiles.test.ts:228` itd.) |
| R-6 | AG: „The maze is a card like the others… the page reads it through `useCardSettings`"; `useCardPage` dostarcza pasek postaci | Strona labiryntu ma własną kopię logiki paska postaci (stan, `recordBarCharacter`), a pozostałe karty `useBarCharacter` | `WorksheetGenerator.tsx:41–44`, `:90`, `:96` vs `hooks/useBarCharacter.ts:30–66`, `hooks/useCardPage.ts:15` | **Kod** (dwie implementacje tej samej reguły „ulubiona nie zmienia się samoczynnie") |
| R-7 | Roadmapa S-33: gracz „zakreśla większą kupkę albo „tyle samo"", „oddzielone polem „="" (RM:70) | Karta ma puste pole na znak, odpowiedzi `left/right/equal` | `money/sheet.ts` (`signSize`, komentarz „where the child writes <, > or ="), `money/rules.ts:3–4` | **Dokument (RM i SN).** Późniejsza decyzja: PRD US-23 „decyzja 2026-11-01… wpisuje „<", ">" albo „="" (PRD:427). RM:70 i SN FR-033 to starsze brzmienie |
| R-8 | AG „Hard rules": „MVP has no accounts, payments, AI, or backend jobs. Keep… data on-device"; PRD:648 „Dane profili… nie opuszczają urządzenia" | Na produkcji ładuje się zewnętrzny skrypt Cloudflare Web Analytics; w PRD i RM nie ma słowa o analityce | `src/lib/analytics.ts:11–17` (host `printo-kids.printokids.workers.dev`), `src/layouts/Layout.astro:3`; `grep -in "analytic\|beacon"` w PRD i RM: 0; zmiana `context/archive/2026-11-01-gh271-web-analytics` | **Decyzja** (właściciela): nasz kod nie przekazuje beaconowi profili ani ustawień (`webAnalyticsBeacon` zwraca tylko `src` i token; samego skryptu zewnętrznego nie czytałem), ale produkt dla rodziców dzieci dodał stronę trzecią bez zapisu w PRD. Zapisać w PRD albo wycofać |
| R-9 | PRD:794: punkt startu dyktanda „leży na obrysie, w lewym górnym rogu sylwetki" | Reguła jest tylko w konstrukcji `traceOutline`; `dictationCardProblems` jej nie sprawdza | `dictation/outline.ts:217` vs `dictation/generate.ts:193–234` | **Kod** (niskie ryzyko): dodać sprawdzenie albo usunąć zdanie z PRD |
| R-10 | PRD NFR: generowanie ≤5 s (wszystkie karty) | Test czasu jest dla 5 z 7 kart; dla symetrii i dyktanda go nie ma; katalog dyktanda buduje się leniwie przy pierwszym użyciu | `grep -c "performance\|Date.now"` = 0 w `symmetry/generate.test.ts`, `dictation/generate.test.ts`; `dictation/generate.ts:93–126` | **Kod** (test) — brak dowodu, że guardrail trzyma |
| R-11 | PRD: „Wiersz „Bez postaci" zostaje" (PRD:111); „Własny obrazek" (US-02) | W kodzie etykiety to „Brak" i „Własne zdjęcie" | `sheet/character.ts:1`, `:99` | **Decyzja** (nazewnictwo UI): ujednolicić PRD albo etykiety |
| R-12 | AG: `npm test` = „Node's built-in test runner on the files named in the `test` script" | W skrypcie brakuje spacji: `…analytics.test.tssrc/lib/last-used.test.ts`, więc `analytics.test.ts` nigdy się nie uruchamia w `npm test` | `package.json:12` (skrypt `test`); skrypt porównujący `git ls-files "src/**/*.test.ts"` z listą: „not listed: src/lib/analytics.test.ts; listed but missing: …tssrc/lib/last-used.test.ts" | **Kod** (literówka) — tu domena nie ma winy, ale reguła „testy chronią reguły" jest dziurawa |
| R-13 | RM:44–47 + PRD: 10 rodzajów kart po M-5 | W kodzie 7 | `src/lib/cards.ts:10–67` | Nie rozjazd: zaplanowane (RM `ready`). Zapisane, żeby nikt nie liczył tego jako braku |
| R-14 | PRD:615 FR-032 „Zacznij od nowa" (nice-to-have) | Brak | `grep -rn "Zacznij od nowa" src` = 0 | **Decyzja** (priorytet nice-to-have: zostawić jako plan) |

## 5. Ranking refaktoru

Ocena: **wartość** = jak blisko rdzenia jest niezmiennik; **ryzyko** = jak słabo jest dziś egzekwowany albo jak wielki koszt przyniesie najbliższa zmiana (M-5: trzy nowe karty, RM:45–47).

| # | Kandydat | Wartość | Ryzyko | Uzasadnienie | Warunek „gotowe, gdy…" |
|---|---|---|---|---|---|
| **1** | **A9 Rejestr rodzajów kart** (`CardKind` ↔ `CardSettingsId` ↔ podsumowanie ↔ `levelIds`) | wysoka (wszystkie karty przechodzą przez niego) | **najwyższe**: S-34, S-35, S-36 mają wejść równolegle i każda dotknie tych samych 5–6 plików (RM:80 sam to ostrzega) | Jedyny kandydat, którego koszt rośnie przy najbliższej planowanej pracy; niezmienniki kart (A2–A7) są już dobrze strzeżone, rejestr strzeżony tylko testem długości | `grep -rln 'case "pieniadze"' src` zwraca **jeden** plik (dziś: `card-settings.ts:205` i `card-summary.ts:97`) |
| 2 | **A10 Arkusz A4 (stałe druku)** | średnia | średnie: 7 duplikatów 210/297/10 | Margines 10 mm to guardrail PRD, a zmiana jednego pliku nie zmienia pozostałych | `grep -rnE "inset: 10\|INSET = 10\|PAGE_WIDTH = 210" src --include=*.ts --include=*.tsx` (poza testami) zwraca **jedno** miejsce (dziś 8 trafień, 7 miejsc) |
| 3 | **Katalog szablonów obiektów** (część A2) | **najwyższa** (core wg FR-028) | średnie: mieszka w `symmetry/`, a S-34/S-35 dołożą dwóch kolejnych użytkowników (dziś: nonogram, dyktando) | Granica kontekstu: „Obiekty" nie są własnością „Symetrii" | `grep -rln "symmetry/templates" src --include=*.ts` (poza testami) zwraca tylko moduł obiektów i `symmetry/*` — nonogram i dyktando importują z modułu obiektów |
| 4 | **A1 Labirynt** | wysoka | niskie-średnie: niezmiennik w UI (`mazeForSheet` wołany z komponentu) | Jedyna karta bez własnego `*Problems` i bez `Card` | Test: `generateMaze` (lub nowe `generateMazeCard`) zwraca `null` dla labiryntu z dwiema drogami, bez udziału komponentu; `grep -n "mazeForSheet" src/components` nie znajduje trafień |
| 5 | **A8 Profil + pamięć ustawień** | średnia (Supporting, ale zapisuje dane dziecka) | niskie (aktualizacja 2026-11-03): właściciel nie przewiduje usuwania postaci z katalogu, a ewentualną postać podmieni pod tym samym id, więc R-3 nie zachodzi; zostaje kolizja literału `"none"` | Wcześniej miejsce 2 z powodu R-3; po odpowiedzi właściciela zostaje porządek nazewniczy i opcjonalne zabezpieczenie na przyszłość | Test w `sheet/character.test.ts` albo `child-profiles.test.ts` pinuje listę id postaci katalogu (id nie znikają); oraz `grep -rn 'NO_PROFILE' src/lib` nie używa literału `"none"` także jako id postaci (dwie różne stałe) |
| 6 | **Poziom jako pojęcie** (kolizja `lat5`, `NonogramSize`) | średnia | niskie dziś | Mylące dla ludzi i agentów, nie dla danych | `grep -rn "NonogramSize\b" src` zwraca 0 (zmiana nazwy na `NonogramLevel`) albo słownik wskazuje to jako decyzję |

**#1 do refaktoru: rejestr rodzajów kart.** Powód: wszystkie niezmienniki generowania (A2–A7) są dziś egzekwowane w czystych modułach z testami, więc ich refaktor nie przyniesie wartości, a M-5 zaraz doda trzy karty do rejestru, który wymaga równoległych zmian w kilku plikach i jest chroniony tylko jednym testem zgodności długości list (`card-settings.test.ts:33`).

### Pytania do osób, które znają odpowiedź w kilka minut

1. **Właściciel produktu:** czy profil z postacią spoza katalogu ma znikać z `localStorage` (dziś tak, R-3), czy wracać do „Bez postaci"? (Pytanie dotyczy zachowania kodu przy usunięciu postaci z katalogu, nie praw do własnego obrazka rodzica, który nigdy nie trafia do nas.)
   - **Odpowiedź (2026-11-03):** Postaci nie znikają; gdyby trzeba było wycofać plik, zostanie podmieniony na inny pod tym samym id. Ścieżka „postać znika z katalogu" nie zachodzi, więc R-3 przechodzi do ryzyka niskiego i zaakceptowanego. Nie jest to powiązane z Open Questions 3.
2. **Właściciel produktu:** czy Cloudflare Web Analytics na produkcji (R-8) jest świadomą zmianą zasady „dane nie opuszczają urządzenia"? Jeśli tak, wpis do PRD (Non-Goals/NFR).
   - **Odpowiedź (2026-11-03):** Tak, świadoma decyzja. Zdanie „dane nie opuszczają urządzenia" dotyczy profili i ustawień; nasz kod nie przekazuje ich licznikowi, który zlicza odsłony (przeglądarka wysyła mu jak każdemu skryptowi zewnętrznemu m.in. adres strony i IP; samego skryptu nie czytałem). Do zrobienia osobno: doprecyzować to zdanie w PRD i `AGENTS.md` (tu niezmienione).
3. **Właściciel produktu:** czy przy ≥2 profilach Generuj ma być zablokowane do wyboru dziecka (R-4)? Dziś jest, PRD nie mówi.
   - **Odpowiedź (2026-11-03):** Nie wiadomo; zachowanie wymaga dodatkowych testów użyteczności. R-4 zostaje otwarte.
4. **Autor kodu `sequence/levels.ts`:** czy opis „liczby i wzory" na Poziomie 3 jest tylko przeoczoną pozostałością (R-1)?
   - **Odpowiedź (2026-11-03):** Tak, przeoczona pozostałość. R-1 do poprawy w kodzie (tekst opisu).
5. **Autor `package.json`:** czy brak spacji w skrypcie `test` (R-12) jest literówką? (Tak wygląda; do potwierdzenia.)
   - **Odpowiedź (2026-11-03):** Nie wiadomo. R-12 zostaje otwarte.
6. **Użytkowniczka:** czy etykiety „Brak" i „Własne zdjęcie" mają zostać, czy wracają „Bez postaci" i „Własny obrazek" (R-11)?
   - **Odpowiedź (2026-11-03):** „Brak" zostaje (kod bez zmian; PRD mówi „Bez postaci", więc to dokument do ujednolicenia). „Własny obrazek" ma wrócić: etykieta w kodzie (`OWN_IMAGE_LABEL`, dziś „Własne zdjęcie") do zmiany.
