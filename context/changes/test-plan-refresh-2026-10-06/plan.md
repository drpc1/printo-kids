# Refresh the whole-product test-plan guide Implementation Plan

## Overview

Przepisać `context/foundation/test-plan.md` tak, żeby opisywał cały produkt według zaakceptowanego briefu: sześć ryzyk, cztery fazy, w tym backlog i rzeczy zaparkowane. Guide z 2026-10-05 zostaje w tym samym polskim układzie §1–§7. Ta zmiana nie dodaje testów.

## Current State Analysis

Guide oznaczony `checked: 2026-10-05` ma pięć ryzyk i trzy fazy. §3 wskazuje folder `testing-path-count` przy statusie `change opened` oraz fazę 2 jako `not started`. Żywego folderu `testing-path-count` nie ma. Archiwum `context/archive/2026-10-05-testing-path-count/` ma status `archived`, a jego plan ma odhaczone 34 ziarna i w „What We're NOT Doing” wyłącza odmowę kartki przy złej liczbie ścieżek.

`package.json:12` uruchamia cztery pliki i 59 testów. Badanie w `research.md` rozdziela to, co te testy dowodzą, od odmowy złej kartki, liczby stron w przeglądarce i profilu dziecka. `context/changes/path-count-test/change.md` ma status `new` i prosi o odmowę kartki przy zero i dwóch ścieżkach. `context/changes/print-sheet-contract/` ma status `implementing`; w jego planie Chrome i Edge są odhaczone, Firefox i Safari nie (`plan.md:256-271`).

Skan od 2026-09-06, zakres `src`: 19 commitów. Wystąpienia ścieżek w tych commitach: `src/components/` 39, `src/pages/` 15, `src/lib/` 11, `src/lib/maze/` 3, `src/components/auth/` 11, `src/pages/auth/` 6. Commit `b47adb4` z 2026-10-01 rysuje wspólną ścianę raz.

## Desired End State

Guide jest po polsku, z angielskimi literałami statusu. §2 ma sześć scenariuszy z briefu. §3 ma cztery fazy: faza 1 to `path-count-test` / `change opened`, faza 2 to `print-sheet-contract` / `implementing`, fazy 3 i 4 to `not started` z pustym folderem. §5 opisuje, co 59 testów już dowodzi. §6 zostaje TBD. Nagłówek `checked` ma datę 2026-10-06.

Weryfikacja: odczyt guide wobec briefu i `research.md`, plus polecenia z kryteriów poniżej. Produktowy `npm test` nie jest bramką tej zmiany, bo kod testów się nie zmienia.

### Key Discoveries:

- Cztery pliki i 59 testów: `package.json:12`, `research.md`.
- Odmowa kartki przy liczbie ścieżek innej niż 1 nie jest w tych testach. Klik zapisuje labirynt tylko przy wyniku 1 (`src/components/WorksheetGenerator.tsx:56-60`).
- Schemat guide każe nie przenumerowywać ryzyk. Brief tej zmiany przenumerowuje je i przepisuje §3 w tym samym pliku. Ta para idzie razem.
- `print-sheet-contract/plan.md:223` nadal mówi o ryzykach 2, 3 i 5 w starej numeracji. Tego planu ta zmiana nie edytuje.

## What We're NOT Doing

- Nie dodajemy testów, nie ruszamy `src/` ani `package.json`.
- Nie edytujemy `path-count-test`, `print-sheet-contract` ani archiwum.
- Nie powtarzamy podglądu Chrome, Edge, Firefox ani Safari.
- Nie oznaczamy fazy 1 guide jako `complete` z powodu 34 ziaren.
- Nie dopisujemy §8 i nie zmieniamy nazw sekcji na angielski schemat.
- Nie wracamy do starej piątki ryzyk.
- Nie aktualizujemy `AGENTS.md`, choć §4 nadal ma odnotować, że opis braku runnera jest nieaktualny wobec `package.json`.
- Nie liczymy hot-spotów inną jednostką niż poniżej.

## Implementation Approach

Jedno plikowe przepisanie istniejącego guide. Faza 1 planu pisze §1–§4, czyli część, którą czyta orkiestrator. Faza 2 planu pisze §5–§7. Głos zostaje taki jak w obecnym guide: polski, krótki, scenariusze awarii zamiast nazw testów. W §2 kolumna źródła cytuje wywiad, PRD, roadmapę i katalogi z licznikami. Nie cytuje `plik:linia`, nazw funkcji ani nazw modułów.

Jednostka hot-spotów: 19 to liczba commitów dotykających `src` od 2026-09-06 włącznie. Liczby przy katalogach to wystąpienia ścieżek w tych commitach, nie osobne commity.

## Critical Implementation Details

- **Numeracja.** W nowym guide ryzyko 4 to pozostałe przeglądarki, ryzyko 5 to dane lokalne, ryzyko 6 to bramka bez startera. Stary guide miał starter jako 4 i przeglądarki jako 5. Plan `print-sheet-contract` zostaje przy starym zdaniu. Nie „poprawiać” go przy okazji.
- **Kolejność faz.** Po zapisie pierwsza niedomknięta faza to labirynt. Orkiestrator wskaże `path-count-test`. Druk dokańcza się we własnym folderze i nie wskakuje na miejsce 1.
- **Właściwa postać.** `generateMaze` nie dostaje postaci. Postać wchodzi na kartkę jako obrazek w `WorksheetGenerator`: start czyta ostatni identyfikator (`WorksheetGenerator.tsx:35-40`), wybór zapisuje go (`:164`), a kartka dostaje adres pliku tego wyboru (`:104`, `:206-207`). Układ dostaje tylko wartość logiczną „czy postać jest” (`layout.ts:53`, `layout.test.ts:38-61`). Test ostatniego wyboru nie importuje generatora. Guide ma nazwać tę lukę przy ryzyku 3 i w §5. Nie wolno uznać odhaczonych podglądów Chrome i Edge za dowód, że na kartce jest samochodzik, rakieta albo dinozaur.
- **Ostatnia postać w schowku.** Kontrakt `readLastUsed` / `writeLastUsed` jest już pokryty przez `last-used.test.ts`: brak klucza, pusty zapis, zły JSON, goły napis, postać spoza listy, zapisane „none” i trzy dozwolone identyfikatory, wyjątek z `getItem` i z `setItem`, zapis i odczyt. Raport mutacji dla tego pliku, około 67%, nie jest luką. Wycięcie `raw === null || raw === ""` (`last-used.ts:12`) przy pustym napisie kończy się w `JSON.parse` i w `catch`, a przy braku klucza `JSON.parse(null)` nie rzuca: `characterField` dostaje `null` i funkcja i tak zwraca `"none"`. Wycięcie `isRecord` albo `typeof character === "string"` (`:40`, `:45`) odpada na liście dozwolonych postaci albo na tym samym `catch`. Nowa asercja pod te mutanty nie zmienia wyniku, który widzi wołający. Guide ma to zapisać w §5 i w §7. Nie mieszać tego z luką obrazka na kartce.

## Faza 1: Strategia, mapa i rollout

### Overview

Przepisać §1–§4 oraz datę `checked` w nagłówku. Po tej fazie orkiestrator widzi cztery fazy i właściwe foldery, zanim §5 opisze istniejące testy.

### Changes Required:

#### 1. Nagłówek i §1 Strategia

**File**: `context/foundation/test-plan.md`

**Intent**: Zostawić trzy zasady koszt × sygnał, obawy użytkownika i scenariusze zamiast lokalizacji kodu. Podmienić akapit hot-spotów na skan zweryfikowany w tym planie.

**Contract**: Frontmatter: `project: PrintoKids`, `status: active`, `checked: 2026-10-06`. §1 wymienia zakres `src`, 19 commitów od 2026-09-06, oraz wystąpienia ścieżek: `src/components/` 39, `src/pages/` 15, `src/lib/` 11. `src/lib/maze/` ma 3 wystąpienia. `src/components/auth/` ma 11 i `src/pages/auth/` ma 6; oba zostają śladem startera poza budżetem testów. Zdanie o wspólnej ścianie może podać datę 2026-10-01 jako dowód prawdopodobieństwa ryzyka 1, bez nazwy commita i bez `plik:linia`.

#### 2. §2 Mapa ryzyk

**File**: `context/foundation/test-plan.md`

**Intent**: Wpisać sześć scenariuszy z briefu, w tej kolejności i z tymi parami wpływ × prawdopodobieństwo. Progi łatwy/średni/trudny nie dostają własnego wiersza.

**Contract**: Tabela ma dokładnie sześć wierszy.

| # | Para | Scenariusz, który ma zostać |
| - | --- | --- |
| 1 | Wysoki × Średni | Kartka wygląda na gotową, a labiryntu nie da się uczciwie rozwiązać: brak ścieżki, więcej niż jedna, albo po zmianie rysowania, kształtu lub poziomów wynik przestaje być prawidłowy |
| 2 | Średni × Wysoki | Ekran jest dobry, a podgląd druku Chrome obcina labirynt albo daje drugą stronę |
| 3 | Średni × Średni | Brak „Meta”, przy starcie nie ma wybranej postaci albo stoi inna, postać zasłania wejście, albo wydruk nie zgadza się z tymi faktami |
| 4 | Średni × Średni | Edge, Firefox albo Safari powtarza obcięcie lub drugą stronę, gdy Chrome jest dobry |
| 5 | Wysoki × Niski | Jednorazowa zmiana kartki zapisuje się jako profil, usunięcie przechodzi bez potwierdzenia, albo profil, ostatnie parametry lub własny obrazek opuszczają urządzenie. To nie jest alert o chmurze |
| 6 | Średni × Wysoki | Przebieg automatyczny poświadcza konta ze startera albo budżet schodzi na testy startera |

Źródła, które wolno wpisać: wywiad P1 i P4 przy ryzyku 1; P2 przy 2 i 4; P5 przy 6; P3 tylko jako powód kolejności faz, nie jako ósme ryzyko; PRD o dokładnie jednym rozwiązaniu, FR-005 i marginesie 10 mm, czterech przeglądarkach, US-01, FR-009, FR-010, NFR danych na urządzeniu, US-02; roadmapa S-02, S-05, S-06, F-02 `proposed`; katalogi z licznikami z §1. Rubryka wpływu i prawdopodobieństwa zostaje przy obecnych definicjach guide, z jedną poprawką: prawdopodobieństwo średnie ryzyka 1 bierze się z włączonych przez użytkownika zaparkowanych poziomów i z trzech wystąpień `src/lib/maze/`, nie z tego, że progi są już znane.

Tabela Risk Response Guidance ma sześć wierszy. Ochrona, kwestionowane założenie, warstwa i anty-wzorzec bierzemy z briefu w `change.md`. Kontekst badania zostaje pytaniem do przyszłego `/10x-research` fazy, nie odpowiedzią z obecnego `research.md`. Dla ryzyka 1 warstwa to test jednostkowy na runnerze Node; anty-wzorzec to wyrocznia skopiowana z bieżącego rysunku oraz progi wymyślone przed ich ustaleniem. Dla ryzyka 3 ochrona obejmuje też to, że na kartce jest postać właśnie wybrana albo przywrócona jako ostatnia, a „Bez postaci” zostawia napis Start. Kwestionowane założenie: znacznik o właściwym rozmiarze oznacza właściwą postać. Warstwa zostaje przy kontrakcie kartki; wyrocznią jest adres pliku tej postaci, nie migawka pikseli. Dla ryzyka 5: testu nie pisać, zanim istnieje S-05, S-06 albo US-02.

#### 3. §3 Stopniowe wdrażanie

**File**: `context/foundation/test-plan.md`

**Intent**: Ustawić cztery fazy tak, żeby orkiestrator czytał stan z dysku. Kolejność bierze się z wpływu i sparzenia, zgodnie z wywiadem P3.

**Contract**: Słownik statusu zostaje: `not started`, `change opened`, `researched`, `planned`, `implementing`, `complete`. Wiersze:

| # | Faza | Ryzyka | Status | Change folder |
| - | --- | --- | --- | --- |
| 1 | Prawidłowy labirynt po zmianie rysowania | 1 | `change opened` | `path-count-test` |
| 2 | Kontrakt druku i faktów kartki | 2, 3, 4 | `implementing` | `print-sheet-contract` |
| 3 | Dane lokalne po powstaniu plasterka | 5 | `not started` | `—` |
| 4 | Bramka produktu bez startera | 6 | `not started` | `—` |

Cel fazy 1: kartka bez uczciwego rozwiązania nie jest gotowa. Typ testu: jednostkowy na obecnym runnerze Node. Cel fazy 2: jedna strona A4 w Chrome, labirynt nieobcięty, margines co najmniej 10 mm, „Meta” oraz na starcie ta postać, która została wybrana albo przywrócona; Firefox i Safari zostają ręcznym podglądem, nadal otwartym. To, która postać weszła na kartkę, jest w tej fazie nadal otwarte: obecny plan `print-sheet-contract` tego nie sprawdza. Cel fazy 3: jawny zapis, potwierdzenie usunięcia, dane zostają na urządzeniu, i tylko gdy plasterek istnieje. Cel fazy 4: bramka pilnuje kartki i nie obrasta testami kont. Zdanie o kolejności: faza 1 ma najwyższy wpływ i najtańszą warstwę; faza 2 ma najwyższe prawdopodobieństwo i jedyne sparzenie z podglądu Chrome.

#### 4. §4 Stos

**File**: `context/foundation/test-plan.md`

**Intent**: Zastąpić zdanie o jednym pliku testu opisem czterech plików. Zostawić produkt bez kont w wymaganiach, przy żywym smoke startera jako osobnym jobie.

**Contract**: Zostają Astro 7 SSR, wyspy React, TypeScript, Tailwind, Cloudflare Workers, Node 22.14.0. Baza testów: `sparse`. `npm test` uruchamia cztery pliki w `src/lib/`: `maze/generate.test.ts`, `sheet/layout.test.ts`, `sheet/print-contract.test.ts`, `last-used.test.ts`. Nie ma Vitest, Jest ani Playwright. CI odpala `npm test` oraz, osobno, smoke po flow kont. `AGENTS.md` nadal opisuje brak runnera testów jednostkowych; guide ma nazwać to nieaktualnym wobec `package.json`. Notatka Stack grounding tools dostaje datę `checked: 2026-10-06` i stan z sesji planowania: docs niedostępne, WebSearch dostępny i nieużyty do wyboru narzędzia, przeglądarka w sesji nadaje się do ręcznego podglądu i nie jest runnerem, provider niedostępny. Warstwy AI-natywnej nie ma.

### Success Criteria:

#### Automated Verification:

- Wiersze §3 w `context/foundation/test-plan.md` mają fazę 1 ze statusem `change opened` i folderem `path-count-test`, fazę 2 ze statusem `implementing` i folderem `print-sheet-contract` oraz fazy 3 i 4 ze statusem `not started`
- W tym samym pliku nie ma cytatu `plik:linia` (`rg` po `\.ts:|\.tsx:|\.astro:|\.mjs:` nie znajduje trafień)

#### Manual Verification:

- Czytelnik sprawdza, że §2 ma sześć wierszy z parami z tabeli powyżej, ryzyko 1 jest Wysokie × Średnie, a progi łatwy/średni/trudny nie mają własnego wiersza

**Implementation Note**: Po zielonej weryfikacji automatycznej zatrzymaj się na ręczne potwierdzenie §2, zanim przejdziesz do fazy 2.

---

## Faza 2: Sprawdzone, podręcznik i budżet

### Overview

Dopisać §5–§7 tak, żeby guide mówił, co 59 testów już dowodzi, i zostawiał wzorce §6 puste do zamknięcia faz rolloutu.

### Changes Required:

#### 1. §5 Co jest już sprawdzone

**File**: `context/foundation/test-plan.md`

**Intent**: Zastąpić akapit o jednym teście szczęśliwej ścieżki listą zachowań. Nie wklejać kotwic z `research.md`.

**Contract**: §5 ma powiedzieć, zachowaniem:

- Dla 34 ziaren, liczb 0–31 oraz 99 i 12345, generator daje labirynt 13 na 16 z otwartymi nacięciami i jedną ścieżką. To samo ziarno daje te same ściany. Generator nie woła `Math.random`.
- Zmutowana siatka potrafi dać więcej niż jedną ścieżkę. Siatka z otwartymi wewnętrznymi ścianami zatrzymuje licznik na 2. Przypadek „więcej niż jedna” wybiera siatkę tym samym licznikiem, który potem sprawdza. Żaden z tych dwóch przypadków nie przechodzi przez klik, który zapisuje kartkę. Asercji odmowy kartki przy zero ścieżkach nie ma.
- Układ kartki: strona 210 na 297, labirynt co najmniej 10 od krawędzi, „Meta” pod kratką i co najmniej 10 od krawędzi, przy postaci znacznik 30 na 30 ze spodem na górze labiryntu. Góra znacznika nie musi mieć 10. Bez postaci jest „Start”, a „Meta” zostaje.
- Reguły druku są tekstem źródeł: jedno `@page` A4 z marginesem 0, brak `@page` w globalnym arkuszu, SVG druku 210 mm na 297 mm z ukrytym przepełnieniem, druk chowa nagłówek, linię celu i przyciski, a dopełnienie ekranu zostaje w regule ekranu. Te testy nie otwierają przeglądarki i nie dowodzą liczby stron.
- Ręczny podgląd Chrome i Edge jest zapisany jako zrobiony w planie `print-sheet-contract`. Firefox i Safari są otwarte. Ten guide ich nie powtarza.
- Ostatnia postać w schowku ma już kontrakt: brak klucza, pusty zapis, zły JSON, postać spoza listy, wyjątek ze schowka, zapis i odczyt. Zła wartość wraca jako brak postaci. To nie jest zapis ani usunięcie profilu dziecka. Wynik mutacji około 67% nie otwiera nowego testu: przeżyte mutanty i tak zwracają „none”. Ten kontrakt nie sprawdza, że generator wstawia identyfikator na kartkę.
- Układ przy „jakiejś” postaci wymaga znacznika 30 na 30, a bez postaci wymaga napisu Start. Nie wymaga, żeby adres obrazka był adresem wybranej postaci: samochodzik, rakieta albo dinozaur. „Bez postaci” jako brak obrazka na kartce generatora też nie jest w tych testach.
- Smoke w osobnym jobie CI nadal sprawdza flow kont ze startera.

#### 2. §6 Podręcznik

**File**: `context/foundation/test-plan.md`

**Intent**: Zostawić wzorce nazwane po zachowaniu. 34 ziarna nie zamykają wzorca odmowy kartki.

**Contract**: Cztery podsekcje, każda TBD ze wskazaniem fazy §3:

- Prawidłowa kartka — faza 1, odmowa przy zero ścieżkach i przy więcej niż jednej. Zdanie, że 34 ziarna z §5 nie są tym wzorcem.
- Druk i znaczniki kartki — faza 2, łącznie z tym, że na starcie jest plik wybranej albo przywróconej postaci, a nie sam prostokąt znacznika.
- Dane lokalne — faza 3. Nie wypełniać, dopóki plasterek nie istnieje.
- Bramka produktu — faza 4.

#### 3. §7 Poza budżetem

**File**: `context/foundation/test-plan.md`

**Intent**: Zostawić negatywną przestrzeń z briefu, łącznie z backlogiem i rzeczami zaparkowanymi.

**Contract**: Lista ma objąć: logowanie, rejestrację, potwierdzenie maila, dashboard, API kont i dokładanie asercji startera do smoke; migawki pikseli kartki i postaci; zgodność labiryntu z poziomem, dopóki poziomów nie ma; bibliotekę kart FR-011, która użyje wyroczni ryzyka 1 dopiero gdy powstanie; profil, ostatnie parametry i własny obrazek, dopóki nie istnieją S-05, S-06 albo US-02; automatyczne „czy rodzic rozumie ekran”; macierz automatycznych przeglądarek jako pierwszy test druku; asercje ostatniej postaci dopisane tylko po to, by zabić mutanta, który i tak zwraca „none”.

### Success Criteria:

#### Automated Verification:

- §5 w `context/foundation/test-plan.md` zawiera `12345`, mówi o braku odmowy przy zero ścieżkach i wymienia Firefox oraz Safari jako nadal otwarte
- §6 ma TBD dla faz 1, 2, 3 i 4, a §7 wymienia testy startera, migawki pikseli, progi poziomów, bibliotekę kart i test profilu przed plasterkiem
- §5 mówi, że testy nie sprawdzają, czy na kartkę wszedł plik wybranej postaci
- §5 nazywa kontrakt ostatniej postaci pokrytym, a §7 wyłącza asercje dopisane tylko pod równoważnego mutanta tej funkcji

#### Manual Verification:

- Czytelnik sprawdza, że §5 nie uznaje 59 testów za dowód jednej strony w Chrome ani za dowód, że profil zostaje na urządzeniu

**Implementation Note**: Po zielonej weryfikacji automatycznej zatrzymaj się na ręczne potwierdzenie §5.

---

## Testing Strategy

### Unit Tests:

- Ta zmiana nie dodaje testu produktu. Istniejące 59 testów zostają opisane w §5, nie uruchamiane jako bramka zapisu guide.

### Integration Tests:

- Nie dotyczy. Guide nie zmienia jobów CI.

### Manual Testing Steps:

1. Odczytać §2 i porównać sześć par wpływ × prawdopodobieństwo z briefem w `change.md`.
2. Odczytać §3 i porównać statusy z `path-count-test/change.md` oraz z checkboxami `print-sheet-contract/plan.md`.
3. Odczytać §5 wobec sekcji Summary w `research.md` i sprawdzić, że odmowa kartki, liczba stron, profil oraz plik wybranej postaci zostały po stronie „otwarte”.

## Performance Considerations

Przepisanie jednego pliku markdown nie ma budżetu wydajności.

## Migration Notes

Czytelnik starego guide, dla którego ryzyko 4 było starterem, a ryzyko 5 przeglądarkami, ma użyć nowej numeracji. Plan `print-sheet-contract` zachowuje zdanie o ryzykach 2, 3 i 5 do czasu zamknięcia tamtej zmiany. Zachowania fazy 2 — Chrome, Edge, Firefox, Safari, „Meta”, postać — zostają fazą 2 także przy nowych numerach 2, 3 i 4.

## References

- Brief i decyzje: `context/changes/test-plan-refresh-2026-10-06/change.md`
- Badanie: `context/changes/test-plan-refresh-2026-10-06/research.md`
- Guide do przepisania: `context/foundation/test-plan.md`
- Cztery pliki testów: `package.json:12`
- Odmowa kartki jeszcze otwarta: `context/changes/path-count-test/change.md`
- Archiwum 34 ziaren: `context/archive/2026-10-05-testing-path-count/plan.md`
- Druk w toku i stara numeracja: `context/changes/print-sheet-contract/plan.md:223`, `:256-271`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Strategia, mapa i rollout

#### Automated

- [x] 1.1 §3 ma fazę 1 change opened / path-count-test, fazę 2 implementing / print-sheet-contract oraz fazy 3 i 4 not started — 329d415
- [x] 1.2 Guide nie zawiera cytatu plik:linia — 329d415

#### Manual

- [x] 1.3 §2 ma sześć ryzyk z briefu, a progi poziomów nie są osobnym wierszem — 329d415

### Phase 2: Sprawdzone, podręcznik i budżet

#### Automated

- [x] 2.1 §5 wymienia 34 ziarna do 12345, brak odmowy przy zero ścieżkach oraz otwarte Firefox i Safari — 9b975c2
- [x] 2.2 §6 ma TBD dla faz 1–4, a §7 wyłącza starter, migawki, progi, bibliotekę kart i profil przed plasterkiem — 9b975c2
- [x] 2.4 §5 mówi, że testy nie sprawdzają pliku wybranej postaci na kartce — 9b975c2
- [x] 2.5 §5 nazywa kontrakt ostatniej postaci pokrytym, a §7 nie goni równoważnych mutantów — 9b975c2

#### Manual

- [x] 2.3 §5 nie uznaje 59 testów za dowód strony Chrome ani profilu na urządzeniu — 9b975c2
