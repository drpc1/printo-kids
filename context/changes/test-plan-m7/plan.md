# Test plan po M-7 (S-51) — plan

Tylko dokumentacja w `context/`; CI `ci`/`smoke`/`e2e` się nie uruchomi (wszystkie zmienione ścieżki są pod `context/`).

## Overview

Zaktualizować `context/foundation/test-plan.md` do stanu po M-7 (stan kodu na `origin/main` po PR #490): cztery nowe karty (kodowanie `kodowanie`, cienie `cienie`, „Od najmniejszego” `odnajmniejszego`, „Labirynt liczbowy” `liczby`), filtr umiejętności w katalogu (S-43), sezon „Zima” z oknem 1.12–29.02 i postaciami Bałwanek, Pingwin (S-54), „Skopiuj obrazek” z kształtami dyktanda (S-55), okno profilu z użytymi i zwiniętymi kartami (S-52), „Jak to działa” w trzech grupach (S-53) oraz wyniki Strykera z S-50. Katalog ma 16 rodzajów (`CARD_KINDS` w `src/lib/cards.ts`), `npm test` 2094 testy (2093 przechodzą, 1 pominięty), `tests/e2e/` 51 plików `*.spec.ts`.

## Current State Analysis

`test-plan.md` ma `checked: 2026-11-17` i opisuje stan po M-6: 12 rodzajów kart, 1780 testów, ryzyka 1–16, fazy 1–11 w §3. Nieaktualne zdania do poprawy: §4 „dwunastu rodzajów”, §5 „1780 testów”, §7 „Filtr katalogu i karty kodowania: poza M-6 (M-7), więc bez ryzyk w tym planie”, ryzyko 16 i faza 11 już uwzględniają „Zimę”, ale akapit §5 o sezonowym oknie mówi tylko o oknie świątecznym.

Precedens: `context/archive/2026-11-17-test-plan-m6/` (S-46) — edycja dokumentu bez `/10x-test-plan`, bo struktura §1–§7 się nie zmienia. Wyniki Strykera M-7: `context/archive/2026-11-23-stryker-m7-cards/reviews/stryker-results.md`.

### Key Discoveries:

- Strażnik kontraktu kart (`card-contract.ts`, `card-engines.ts`) obejmuje każdy rodzaj kart z rejestru; nowe cztery karty zaczynają od niego, a nie od własnego testu zbiorczego (akapit pod mapą ryzyk).
- Zakresy Strykera istnieją dla `coding`, `shadows`, `size-order`, `number-maze`, `copy-drawing` (skrypty `mutate:*` w `package.json`); `shadows` trwa ok. 3 h 20 min, `number-maze` ok. 99 min.
- Filtr umiejętności ma testy jednostkowe (`src/lib/cards.test.ts`, „card skills”) i trzy testy Playwright w `tests/e2e/catalog.spec.ts` (zawężanie, brak zapamiętywania, telefon).
- Okno dat jest jedną funkcją `inWindow` w `src/lib/date-window.ts`; „Zima” używa tego samego mechanizmu co „Boże Narodzenie” (`winter-category.spec.ts`, `winter-characters.spec.ts`).

## Desired End State

Otwierając `context/foundation/test-plan.md`, widać stan po M-7: nowe ryzyka w §2, fazy w §3, aktualne liczby w §4–§5, wiersze Strykera w §5a, wzorce w §6 i granice w §7, bez nieaktualnych liczb kart. Roadmapa ma S-51 `done`. Weryfikacja: `npx prettier --check` przechodzi, a liczba rodzajów w dokumencie zgadza się z `CARD_KINDS` (16).

## What We're NOT Doing

- Bez zmian w kodzie, PRD i skryptach; bez nowych testów i bez nowych przebiegów Strykera.
- Bez przepisywania historycznych liczb z wcześniejszych kamieni (np. liczby testów w starszych zdaniach z datą).
- Bez opisu wyglądu rysunków cieni, kart i świątecznych obiektów na wydruku: zostaje ręcznym sprawdzeniem (§7).
- Bez zmiany struktury §1–§7 i bez `/10x-test-plan`.

## Implementation Approach

Edytować dokument bezpośrednio, tą samą metodą co S-46: każda liczba i nazwa ma źródło w kodzie, teście albo archiwum. Nowe ryzyka numerować dalej (17 i kolejne), z tym samym układem kolumn co 10–16. Nowe karty dzielą wzorce już opisane (karta z jedną odpowiedzią, strażnik kontraktu), więc wiersze Risk Response Guidance odwołują się do nich zamiast je powtarzać.

## Phase 1: §2 Mapa ryzyk i §3 Stopniowe wdrażanie

### Overview

Dopisać do mapy ryzyk to, co M-7 dołożył, i dodać fazy ze statusem `complete`.

### Changes Required:

#### 1. Mapa ryzyk i Risk Response Guidance (§2)

**File**: `context/foundation/test-plan.md`

**Intent**: Dopisać ryzyka dla czterech nowych kart i filtra oraz rozszerzyć istniejące ryzyka o zmiany M-7; zaktualizować akapit o strażniku kontraktu i akapit „najpierw Wysoki × Wysoki”, jeśli wymieniają numery ryzyk.

**Contract**: Nowe wiersze w tabeli ryzyk i w Risk Response Guidance, każdy ze źródłem (US/FR/Business Logic w PRD, roadmapa M-7 i slice, archiwum zmiany):
- 17 kodowanie (US-35/36, FR-45/46, S-42): droga Zapisz ma dokładnie jedną najkrótszą drogę, tryb Wykonaj kończy się na jednym obrazku, a pozostałe nie leżą na drodze, kratka mieści się na A4;
- 18 cienie (US-41/42, FR-51/52, S-47, GitHub 452): żadne dwa cienie na karcie nie są takie same ani prawie takie same (próg różnicy cieni, własny próg Poziomu 4), żaden cień nie stoi w rzędzie swojego obrazka;
- 19 „Od najmniejszego” (US-37/38, FR-47/48, S-48): wszystkie wielkości różne, najmniejszy krok poziomu, rząd nigdy nie rosnący ani malejący, karta bez powtórzonego obrazka;
- 20 „Labirynt liczbowy” (US-39/40, FR-49/50, S-49): z każdej kratki drogi dokładnie jedna sąsiednia ma następną liczbę, pułapka nie jest nigdy następną liczbą (niezależne sprawdzenie od startu);
- 21 filtr umiejętności (US-05, S-43): każda karta ma jedną albo dwie umiejętności w kolejności `CARD_SKILLS`, chip zostawia karty z tą umiejętnością (karta z dwiema pod obiema), wybór nie jest zapamiętywany.
Ryzyko 16 dostaje zdanie o „Zimie” (okno 1.12–29.02, Bałwanek i Pingwin, przeniesienie bałwanka z Bożego Narodzenia); ryzyko 12 zdanie o kształtach dyktanda w „Skopiuj obrazek”; ryzyko 5 zdanie o oknie profilu z użytymi i zwiniętymi kartami (S-52). Akapit o strażniku kontraktu: nowe rodzaje M-7 w `card-engines.ts`.

#### 2. Fazy wdrożenia (§3)

**File**: `context/foundation/test-plan.md`

**Intent**: Dodać fazy 12–16 w tabeli §3 ze statusem `complete` i folderami zarchiwizowanych zmian.

**Contract**: Wiersze z `Faza`, `Cel ochrony`, `Ryzyka`, `Typy testów`, `Status`, `Change folder` w tym samym układzie co fazy 8–11; foldery z `context/archive/` (`coding-card`, `shadows-card`, `shadows-poses-level`, `size-order-card`, `number-maze-card`, `card-tags-filter`, `copy-drawing-asymmetric-shapes`, `profile-card-summary`, `stryker-m7-cards`). Faza 11 (sezonowe okno) dostaje, jeśli brakuje, folder `seasons-objects-characters` (już jest).

### Success Criteria:

#### Automated Verification:

- Prettier przechodzi: `npx prettier --check context/foundation/test-plan.md`
- Numery ryzyk w tabeli §2, w Risk Response Guidance i w §3 są ciągłe i zgodne: `grep -c` wierszy `| 17 |`–`| 21 |` w obu tabelach §2 daje po 1

#### Manual Verification:

- Każde nowe ryzyko ma źródło w PRD, roadmapie albo archiwum i nie cytuje `plik:linia` ani nazw funkcji w scenariuszu (zasada 3 z §1).

**Implementation Note**: Po fazie i zielonych kontrolach automatycznych zatrzymaj się na potwierdzenie ręczne przed fazą 2.

---

## Phase 2: §4–§7, frontmatter

### Overview

Zaktualizować liczby, sprawdzone fakty, tabelę Strykera, podręcznik i granice.

### Changes Required:

#### 1. Frontmatter, §4 i §5

**File**: `context/foundation/test-plan.md`

**Intent**: Podnieść `checked`; zamienić „dwunastu rodzajów” na 16 i dopisać `coding/`, `shadows/`, `size-order/`, `number-maze/` do listy katalogów generatorów; zaktualizować liczbę testów (2094, 2093 przechodzi i 1 pominięty, stan 2026-11-28) i listę plików e2e; w §5 dopisać akapit „Karty z M-7 (ryzyka 17–21)” w stylu akapitu „Karty z M-6”: co pilnuje każda niezależna wyrocznia, `catalog.spec.ts` dla filtra, `winter-*.spec.ts` dla „Zimy”, `profile-summary.spec.ts` dla okna profilu.

**Contract**: Akapity §4 i §5; liczby zweryfikowane `npm test` i `ls tests/e2e`; opis każdej karty oparty na testach, które istnieją (nie na planach).

#### 2. §5a Mutacje Strykera

**File**: `context/foundation/test-plan.md`

**Intent**: Dopisać wiersze tabeli i akapit M-7 na podstawie `stryker-results.md` z S-50 (kodowanie, cienie, „Od najmniejszego”, „Labirynt liczbowy”, „Skopiuj obrazek” zmieniony w S-55), z liczbami „przed → po”, ocalałymi bez testu i uzasadnieniem, że filtr i układy nie są mutowane.

**Contract**: Wiersze w istniejących kolumnach (zakres, ryzyko, mutanty, wynik przed, wynik po, ocalałe); „Jak powtórzyć” odsyła do pliku wyników w archiwum.

#### 3. §6 Podręcznik i §7 Poza budżetem

**File**: `context/foundation/test-plan.md`

**Intent**: Dodać wzorce, które M-7 nazwał po zachowaniu (np. „Niezależne sprawdzenie drogi od startu” dla labiryntu liczbowego i „Próg różnicy cieni” dla cieni); w §7 zamienić zdanie o filtrze i kartach kodowania na aktualne granice (raster cieni bez testu pikseli, wygląd rysunków cieni i kart na wydruku ręcznie, wygląd filtra poza testami `catalog.spec.ts`).

**Contract**: Nowe `###` w §6 po „Sezonowe okno”; usunięty zdezaktualizowany punkt w §7.

### Success Criteria:

#### Automated Verification:

- Prettier przechodzi: `npx prettier --check context/foundation/test-plan.md`
- Liczba rodzajów w dokumencie (16) zgadza się z `CARD_KINDS`: `node --experimental-strip-types -e 'import("./src/lib/cards.ts").then(m=>console.log(m.CARD_KINDS.length))'`
- Liczba testów w §4 i §5 zgadza się z ostatnim `npm test`

#### Manual Verification:

- Każda liczba w tabeli Strykera zgadza się z `context/archive/2026-11-23-stryker-m7-cards/reviews/stryker-results.md`.
- Żaden nowy akapit nie twierdzi, że test istnieje, jeśli go w repozytorium nie ma.

**Implementation Note**: Po fazie i zielonych kontrolach automatycznych zatrzymaj się na potwierdzenie ręczne przed fazą 3.

---

## Phase 3: Roadmapa i weryfikacja

### Overview

Zamknąć S-51 w roadmapie i sprawdzić dokument przeglądem.

### Changes Required:

#### 1. Roadmapa

**File**: `context/foundation/roadmap.md`

**Intent**: S-51 `done` w „At a glance” i w ciele slice'a, wiersz w Backlog Handoff, `updated` we frontmatterze; wpis do „Done” zrobi `/10x-archive`.

**Contract**: Tylko pole `Status` slice'a S-51 i wiersz tabeli Backlog Handoff; milestone M-7 zamyka osobny krok `/10x-roadmap`, nie ta zmiana.

#### 2. Przegląd

**File**: `context/foundation/test-plan.md`

**Intent**: Przegląd `/10x-impl-review` (zgodnie z regułą repozytorium przed PR-em fazy) sprawdzający liczby, numerację ryzyk i spójność z PRD i roadmapą.

**Contract**: Raport w `context/changes/test-plan-m7/reviews/impl-review.md`.

### Success Criteria:

#### Automated Verification:

- Prettier przechodzi: `npx prettier --check context/foundation/test-plan.md context/foundation/roadmap.md`
- `git diff --name-only origin/main` zawiera tylko pliki pod `context/`

#### Manual Verification:

- Raport `/10x-impl-review` ma werdykt APPROVED.

---

## Testing Strategy

Brak nowego kodu, więc brak nowych testów. Weryfikacja jest dokumentowa: Prettier, zgodność liczb z `CARD_KINDS` i `npm test`, przegląd każdej liczby względem kodu i archiwum.

## References

- Precedens: `context/archive/2026-11-17-test-plan-m6/plan.md`
- Wyniki Strykera M-7: `context/archive/2026-11-23-stryker-m7-cards/reviews/stryker-results.md`
- Roadmapa: `context/foundation/roadmap.md` (S-51, M-7)

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: §2 Mapa ryzyk i §3 Stopniowe wdrażanie

#### Automated

- [x] 1.1 Prettier przechodzi: `npx prettier --check context/foundation/test-plan.md` — cbf61709
- [x] 1.2 Numery ryzyk w tabeli §2, w Risk Response Guidance i w §3 są ciągłe i zgodne (17–21 po jednym wierszu w obu tabelach §2) — cbf61709

#### Manual

- [x] 1.3 Każde nowe ryzyko ma źródło w PRD, roadmapie albo archiwum i nie cytuje `plik:linia` ani nazw funkcji w scenariuszu — cbf61709

### Phase 2: §4–§7, frontmatter

#### Automated

- [x] 2.1 Prettier przechodzi: `npx prettier --check context/foundation/test-plan.md` — 85dc40df
- [x] 2.2 Liczba rodzajów w dokumencie (16) zgadza się z `CARD_KINDS` — 85dc40df
- [x] 2.3 Liczba testów w §4 i §5 zgadza się z ostatnim `npm test` — 85dc40df

#### Manual

- [x] 2.4 Każda liczba w tabeli Strykera zgadza się z `stryker-results.md` z S-50
- [x] 2.5 Żaden nowy akapit nie twierdzi, że test istnieje, jeśli go w repozytorium nie ma

### Phase 3: Roadmapa i weryfikacja

#### Automated

- [x] 3.1 Prettier przechodzi: `npx prettier --check context/foundation/test-plan.md context/foundation/roadmap.md` — 4d243334
- [x] 3.2 `git diff --name-only origin/main` zawiera tylko pliki pod `context/` — 4d243334

#### Manual

- [x] 3.3 Raport `/10x-impl-review` ma werdykt APPROVED — 4d243334
