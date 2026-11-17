# Test plan po M-6 (S-46) — plan

Issue: drpc1/printo-kids#377. Tylko dokumentacja w `context/`; CI `ci`/`smoke`/`e2e` się nie uruchomi.

## Overview

Zaktualizować `context/foundation/test-plan.md` do stanu po M-6 (stan kodu na `origin/main` po PR #405): dwie nowe karty (Krzyżówka matematyczna `krzyzowka`, Zegar `zegar`), sezonowa zawartość z oknem dat (kategoria „Boże Narodzenie” z S-38, postacie Bałwanek, Mikołaj, Renifer z S-39), wyniki Strykera z S-45. Katalog ma 12 rodzajów (`src/lib/cards.ts`). Filtr katalogu i karty kodowania (S-42, S-43) są w M-7 i nie są opisane.

## Decyzja: bez `/10x-test-plan`

Struktura planu testów (§1–§7) już istnieje i jest aktualna; zmienia się zawartość, nie układ. `/10x-test-plan` przebudowuje całość i prowadzi fazy wdrożenia przez `/10x-new` → `/10x-research`, czego tu nie potrzeba. Edytujemy dokument bezpośrednio. Pytań do użytkownika brak: zakres rozstrzygnęło zlecenie (settled input).

## What We're NOT Doing

Bez zmian w kodzie, PRD i skryptach; bez opisu filtra i kart kodowania; bez nowych testów; bez przepisywania historycznych liczb Strykera z wcześniejszych kamieni.

## Phase 1: Aktualizacja test-plan.md

Zmiany (wszystkie liczby i nazwy z kodu, testów i archiwum):

- Frontmatter `checked`; §2: ryzyka 14 (krzyżówka: jedno rozwiązanie bez zgadywania, łańcuch, styk kratek), 15 (zegar: reguły karty, brak powtórek, minuty poziomu, kolejność „Połącz”), 16 (sezonowe okno: kategoria i postacie widoczne tylko 15.11–6.01, zapamiętany wybór poza oknem nie ginie); poprawka nazwy „Skopiuj obrazek” (ryzyko 12); akapit o strażniku kontraktu obejmuje nowe rodzaje; Risk Response Guidance dla 14–16.
- §3: fazy 8–10 (krzyżówka, zegar, sezonowe okno) ze statusem `complete` i folderami zarchiwizowanych zmian.
- §4 i §5: aktualna liczba testów z `npm test`, nowe pliki e2e, nowe sprawdzone fakty (okno dat, kontrakt kart, solver krzyżówki).
- §5a: wiersze Strykera dla `math-crossword` i `math-crossword-generate` z `context/archive/2026-11-16-stryker-m6-cards/reviews/stryker-results.md`; zegar bez zakresu z uzasadnieniem.
- §6: wzorzec „Sezonowe okno” i „Karta bez solvera”; §7: wpis, czego nie testujemy (wygląd tarczy, ikony świąteczne na wydruku).
- Roadmapa: S-46 `done` (minimalnie: At a glance + ciało + `updated`).

## Success Criteria

#### Automated Verification:

- `npx prettier --check context/foundation/test-plan.md context/foundation/roadmap.md` przechodzi.
- Liczba rodzajów w dokumencie zgadza się z `CARD_KINDS` (12).

#### Manual Verification:

- Każda liczba i nazwa w nowych akapitach ma źródło w kodzie, teście albo archiwum (przegląd `/10x-impl-review`).

## Progress

### Phase 1: Aktualizacja test-plan.md

#### Automated

- [x] 1.1 Prettier check test-plan.md i roadmap.md — 4e2ad1b
- [x] 1.2 Liczba rodzajów kart zgodna z `cards.ts` — 4e2ad1b

#### Manual

- [x] 1.3 Liczby i nazwy zweryfikowane w kodzie — 4e2ad1b
