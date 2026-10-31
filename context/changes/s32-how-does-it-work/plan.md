# S-32 Strona „Jak to działa” Implementation Plan

## Overview

Dodajemy statyczną stronę `/how-it-works`, która w jednym miejscu tłumaczy zasadę poziomów, profilu i postaci, oraz stopkę z linkiem do niej na katalogu kart i na stronach generatorów. Bez samouczka, bez okna pomocy, bez nowych tooltipów: podpowiedzi w miejscu wyboru weszły już w S-27, S-28, S-29 i S-31.

## Current State Analysis

Frame (`frame.md`, confidence HIGH): pytanie „strona czy asystent" rozstrzyga PRD (US-22, FR-031, Non-Goals); jedyną brakującą częścią jest strona ze stopki.

Stan kodu:

- Stopki nie ma ani w `src/layouts/Layout.astro`, ani w `src/pages/index.astro`, ani w `src/components/GeneratorShell.astro`.
- Podpowiedzi w miejscu wyboru istnieją: `src/components/RememberedNote.tsx` + `src/hooks/useCardSettings.ts:37` („Zapamiętane dla"), `src/components/CharacterChoiceControl.tsx:86,100` („Tylko na tę kartę", „Ustaw jako ulubioną"), `src/components/ProfileCorner.tsx:577` (zdanie w oknie profilu).
- `GeneratorShell.astro` w druku ukrywa `h1`, `p`, `a`, `button` wewnątrz `#worksheet-home` i zostawia sam SVG karty; na ekranie `.has-sheet .max-w-xl > p` jest ukryte.
- Trasy mają angielskie adresy (`/maze`, `/symmetry`, `/sequences`, `/sudoku`, `/nonogram`, `/dictation`).
- Testy: `scripts/smoke.mjs` (HTTP stron), `tests/e2e/*.spec.ts` (Playwright).

## Desired End State

Z katalogu `/` i z każdej strony generatora rodzic klika w stopce „Jak to działa" i widzi krótką stronę z całą zasadą. Strona ma link z powrotem do katalogu. Stopka nie wchodzi na wydruk A4 i nie zasłania „Generuj"/„Drukuj" na telefonie. `npm run lint`, `npm test`, `npx astro check`, `npm run build`, smoke i e2e są zielone.

### Key Discoveries:

- Link `a` w stopce wewnątrz `#worksheet-home` jest w druku ukryty regułą z `GeneratorShell.astro`, ale sam element `footer` trzeba ukryć osobno (`print:hidden`), żeby nie zostawił wysokości.
- Stopka nie może być bezpośrednim `p` w `.max-w-xl`, bo `.has-sheet .max-w-xl > p` ukrywa takie dzieci na ekranie.
- Kolory tylko z tokenów roli (AGENTS.md); klasy łączymy przez `cn()`.

## What We're NOT Doing

- Żadnego asystenta, touru, okna pomocy ani nowych tooltipów (PRD Non-Goals).
- Żadnej zmiany zachowania profilu, poziomów ani postaci; strona je tylko opisuje.
- Bez Reacta i bez `client:*` na nowej stronie.
- Bez zmiany istniejących podpowiedzi (S-27–S-31).
- Bez wersji językowych poza polską.

## Implementation Approach

Trzy fazy: najpierw samodzielna strona (da się obejrzeć pod adresem), potem stopka we wspólnym komponencie Astro użytym w dwóch miejscach, na końcu test, który wiąże treść strony z tekstami UI. Treść pisana po zachowaniu, które już jest w kodzie, a nie z pamięci.

## Phase 1: Strona „Jak to działa"

### Overview

Statyczna strona Astro pod `/how-it-works` z całą zasadą profilu, poziomów i postaci.

### Changes Required:

#### 1. Strona

**File**: `src/pages/how-it-works.astro`

**Intent**: Krótka strona (jedna kolumna, nagłówek, 4 sekcje) w `Layout` z `lang="pl"`, z linkiem „Wszystkie karty" do `/`. Treść z PRD US-22 i Business Logic „Profil i zapamiętane ustawienia" oraz „Poziomy": (1) poziomy to numery albo łatwy / średni / trudny, bez nazw wieku, wiek to tylko wskazówka przy niektórych kartach; (2) profil sam pamięta pasek każdej karty, a bez profilu urządzenie pamięta ostatnie ustawienia osobno dla każdej karty; (3) ulubiona postać zmienia się tylko jawnie, a inna postać z paska działa do końca wizyty; (4) postać stoi przy poleceniu i je „mówi" (na labiryncie stoi przy starcie). Dane zostają na urządzeniu.

**Contract**: Trasa `/how-it-works`, stały tytuł `PrintoKids - Jak to działa` (`cardPageTitle` przyjmuje tylko identyfikatory z `CARD_KINDS`, więc się tu nie nadaje); kolory wyłącznie tokeny roli; bez Reacta.

#### 2. Smoke

**File**: `scripts/smoke.mjs`

**Intent**: Dodać krok sprawdzający, że `/how-it-works` zwraca 200 i zawiera nagłówek „Jak to działa"; zaktualizować komentarz nagłówkowy z listą stron.

**Contract**: Ten sam kształt kroku `[name, run, ok, expected]` co sąsiednie.

### Success Criteria:

#### Automated Verification:

- Lint przechodzi: `npm run lint`
- Typy przechodzą: `npx astro check`
- Build przechodzi: `npm run build`
- Smoke przechodzi na działającym serwerze: `npm run smoke`

#### Manual Verification:

- Strona czyta się w minutę, nie używa wieku jako nazwy poziomu i prowadzi z powrotem do katalogu
- Wygląd poprawny na telefonie (360 px) i na komputerze

**Implementation Note**: Po fazie i zielonych testach automatycznych zatrzymaj się na ręczne potwierdzenie.

---

## Phase 2: Stopka z linkiem

### Overview

Stopka z linkiem „Jak to działa" na katalogu i na stronach generatorów, niewidoczna w druku.

### Changes Required:

#### 1. Komponent stopki

**File**: `src/components/SiteFooter.astro`

**Intent**: Mały element `footer` z jednym linkiem do `/how-it-works`, `print:hidden`, cel dotykowy co najmniej 44 px, kolory z tokenów.

**Contract**: Brak propsów; sam `<footer>` z `<a href="/how-it-works">Jak to działa</a>`. Nie jest bezpośrednim `p` w `.max-w-xl`.

#### 2. Użycie

**File**: `src/pages/index.astro`, `src/components/GeneratorShell.astro`

**Intent**: Wstawić stopkę pod katalogiem i pod slotem generatora (wewnątrz `#worksheet-home`, żeby istniejąca reguła druku ją obejmowała, plus własne `print:hidden`). Nie zmieniać układu karty ani paska ustawień.

**Contract**: W druku `#worksheet-home` nadal zawiera wyłącznie SVG karty; na telefonie stopka leży pod kartą i nie zasłania „Generuj"/„Drukuj". `main` jest wyśrodkowany (`justify-center`), więc stopka dostaje `mt-auto` i odstęp `pt-8`, żeby przed pierwszym Generuj nie wisiała pośrodku ekranu, tylko przy dolnej krawędzi.

#### 3. Kontrakt druku

**File**: `src/lib/sheet/print-contract.test.ts`

**Intent**: Dopisać asercję, że stopka jest ukryta w druku (`print:hidden` w `SiteFooter.astro`), obok istniejących asercji reguł `#worksheet-home` (linie ok. 57–76), żeby druk pilnował też `npm test`, a nie tylko e2e.

**Contract**: Ten sam styl co sąsiednie asercje; nie zmienia istniejących regexów.

### Success Criteria:

#### Automated Verification:

- Lint i typy: `npm run lint` oraz `npx astro check`
- Testy jednostkowe: `npm test`
- Istniejące e2e układu i druku zielone: `E2E_PORT=<wolny port> npx playwright test --project=chromium --project=phone-360`

#### Manual Verification:

- Stopka widoczna na `/` i na każdej z sześciu stron generatorów
- Podgląd wydruku A4 pokazuje tylko kartę, bez stopki, na jednej stronie z marginesem 10 mm
- Na telefonie stopka nie nachodzi na „Generuj"/„Drukuj"

**Implementation Note**: Pauza na ręczne potwierdzenie przed fazą 3.

---

## Phase 3: Test zgodności treści z UI i zamknięcie

### Overview

Test, który wiąże stronę z tekstami UI, żeby nie rozjechała się z zachowaniem (ryzyko z roadmapy), oraz uzgodnienie PRD i roadmapy z wdrożoną stopką.

### Changes Required:

#### 1. Test e2e

**File**: `tests/e2e/how-it-works.spec.ts`

**Intent**: Sprawdza: link „Jak to działa" w stopce katalogu i jednej strony generatora prowadzi na `/how-it-works`; strona zawiera kluczowe zasady (poziomy bez wieku, profil pamięta pasek, ulubiona zmieniana jawnie, postać przy poleceniu); w UI nadal są teksty „Tylko na tę kartę" i „Ustaw jako ulubioną" (zmiana ich brzmienia psuje test i wymusza przejrzenie strony). Dodatkowo druk A4 generatora nie pokazuje stopki.

**Contract**: Playwright, wzorzec jak `tests/e2e/favorite-character.spec.ts` (aktywny profil).

#### 2. Roadmapa

**File**: `context/foundation/roadmap.md`

**Intent**: Zmienić `Change ID` elementu S-32 z `how-it-works-page` na `s32-how-does-it-work`, żeby `/10x-implement` i `/10x-archive` mogły przesuwać jego status. Status zmienia się dalej tymi skillami.

**Contract**: Trzy miejsca: wiersz S-32 w tabeli „At a glance”, linia `- **Change ID:**` w bloku `### S-32` i wiersz S-32 w tabeli następnych kroków (ok. linii 49, 149, 169).

#### 3. PRD

**File**: `context/foundation/prd.md`

**Intent**: W US-05 zdanie „Pod kartą nic nie ma.” zastąpić zdaniem, że pod kartą nie ma niczego poza stopką z linkiem „Jak to działa” (US-22). Bez tego PRD byłby sprzeczny z wdrożoną stopką.

**Contract**: Zmienia się tylko to jedno zdanie w kryteriach US-05; nie zmienia się US-22 ani FR-031.

### Success Criteria:

#### Automated Verification:

- Nowy test przechodzi: `E2E_PORT=<wolny port> npx playwright test tests/e2e/how-it-works.spec.ts`
- Całość CI lokalnie: `npm run lint`, `npm test`, `npx astro check`, `npm run build`
- Roadmapa i PRD mają nowe zapisy: `grep -c "s32-how-does-it-work" context/foundation/roadmap.md` zwraca 3, a `grep -c "Pod kartą nic nie ma\." context/foundation/prd.md` zwraca 0

#### Manual Verification:

- Czytelnik, który nie zna aplikacji, po przeczytaniu strony rozumie, co pamięta profil i co zmienia poziom

---

## Testing Strategy

### Unit Tests:

- Brak nowej logiki; `npm test` ma pozostać zielone.

### Integration Tests:

- Smoke dla `/how-it-works` (200 i nagłówek); e2e: nawigacja ze stopki, treść strony, brak stopki w druku.

### Manual Testing Steps:

1. Otwórz `/` i kliknij „Jak to działa"; wróć przez „Wszystkie karty".
2. Na `/maze` wygeneruj kartę i obejrzyj podgląd wydruku A4.
3. Powtórz na telefonie 360 px i sprawdź „Generuj" i „Drukuj".

## Performance Considerations

Statyczna strona bez JS; brak wpływu na czas generowania.

## References

- Frame: `context/changes/s32-how-does-it-work/frame.md`
- Roadmap: `context/foundation/roadmap.md` (S-32), GitHub issue 139
- PRD: US-22, FR-031, Non-Goals
- Wzorzec stron: `src/pages/maze.astro`, `src/components/GeneratorShell.astro`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Strona „Jak to działa"

#### Automated

- [x] 1.1 Lint przechodzi: `npm run lint` — 7f9a940
- [x] 1.2 Typy przechodzą: `npx astro check` — 7f9a940
- [x] 1.3 Build przechodzi: `npm run build` — 7f9a940
- [x] 1.4 Smoke przechodzi na działającym serwerze: `npm run smoke` — 7f9a940

#### Manual

- [x] 1.5 Strona czyta się w minutę, nie używa wieku jako nazwy poziomu i prowadzi z powrotem do katalogu — 7f9a940
- [x] 1.6 Wygląd poprawny na telefonie (360 px) i na komputerze — 7f9a940

### Phase 2: Stopka z linkiem

#### Automated

- [x] 2.1 Lint i typy: `npm run lint` oraz `npx astro check` — 87b81ed
- [x] 2.2 Testy jednostkowe: `npm test` — 87b81ed
- [x] 2.3 Istniejące e2e układu i druku zielone: `E2E_PORT=<wolny port> npx playwright test --project=chromium --project=phone-360` — 87b81ed

#### Manual

- [x] 2.4 Stopka widoczna na `/` i na każdej z sześciu stron generatorów — 87b81ed
- [x] 2.5 Podgląd wydruku A4 pokazuje tylko kartę, bez stopki, na jednej stronie z marginesem 10 mm — 87b81ed
- [x] 2.6 Na telefonie stopka nie nachodzi na „Generuj"/„Drukuj" — 87b81ed

### Phase 3: Test zgodności treści z UI i zamknięcie

#### Automated

- [x] 3.1 Nowy test przechodzi: `E2E_PORT=<wolny port> npx playwright test tests/e2e/how-it-works.spec.ts` — 72c9992
- [x] 3.2 Całość CI lokalnie: `npm run lint`, `npm test`, `npx astro check`, `npm run build` — 72c9992
- [x] 3.3 Roadmapa i PRD mają nowe zapisy: `grep -c "s32-how-does-it-work" context/foundation/roadmap.md` zwraca 3, a `grep -c "Pod kartą nic nie ma\." context/foundation/prd.md` zwraca 0 — 72c9992

#### Manual

- [x] 3.4 Czytelnik, który nie zna aplikacji, po przeczytaniu strony rozumie, co pamięta profil i co zmienia poziom — 72c9992
