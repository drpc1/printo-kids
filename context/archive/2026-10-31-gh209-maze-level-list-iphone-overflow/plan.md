# Lista poziomów labiryntu mieści się na iPhone 13 — Implementation Plan

## Overview

Workflow `e2e-phone` (WebKit, `iphone-13`) pada na `tests/e2e/phone-layout.spec.ts:499`: ciało dialogu listy poziomów labiryntu ma 18 px przepełnienia, test wymaga 0 (GitHub #209). Zagęszczamy pionowy rytm wierszy trzyliniowych na telefonie, żeby sześć wierszy mieściło się bez przewijania. Trzy linie wiersza (US-22) zostają.

## Current State Analysis

- Dialog poziomów labiryntu to `LevelChoiceControl` w `src/components/WorksheetGenerator.tsx:155-195`, wiersze w `LevelChoiceRows` (`src/components/ProfileCorner.tsx:599-622`).
- Wiersz z opisem dostaje `levelRowClass` (`src/components/LevelRow.tsx:4`): `h-auto flex-col items-start gap-0.5 ...`, a pionowy padding pochodzi z `DIALOG_ROW_CLASS` (`ProfileCorner.tsx:39`): `py-2.5 sm:py-2`.
- Wiersz = 2×10 px padding + 24 (nazwa) + 2×20 (opis, wiek) + 2×2 (gap) ≈ 88 px; 6 wierszy + 5×8 px odstępu ≈ 568 px. Dialog ma `max-h-[calc(100dvh-2rem)]`, `pt-14`, `p-6`, więc na viewporcie iPhone 13 w WebKit zostaje ok. 550 px. Różnica odpowiada zgłoszonym 18 px.
- Ostatni zielony przebieg (2026-10-16) poprzedza trzecią linię wiersza (US-22, 2026-10-26). To hipoteza z dat; pomiar jest w Phase 1.
- Projekty Chromium przechodzą, bo ich viewporty są wyższe niż iPhone 13.

## Desired End State

Na iPhone 13 lista sześciu poziomów labiryntu mieści się w dialogu bez przewijania (`scrollHeight - clientHeight <= 0`), każdy wiersz ma nadal co najmniej 44 px wysokości i trzy linie. Workflow `e2e-phone` jest zielony.

### Key Discoveries:

- `levelRowClass` jest wspólne dla labiryntu (`ProfileCorner.tsx:610-612`), `LevelChoice` (symetria, sekwencje, dyktando; `LevelChoice.tsx:68-70`) i `SudokuChoice` (`SudokuChoice.tsx:58-60`), więc jedna zmiana ujednolica listy; to tylko ciaśniejszy padding, nie zmiana układu.
- `DIALOG_ROW_CLASS` jest też używane przez wiersze bez opisu (profil, postać, kategoria); zmiana nie może ich ruszyć, dlatego idzie do `levelRowClass`, które dotyczy tylko wierszy z opisem.
- `cn()` (tailwind-merge) pozwala nadpisać `py-2.5` w `levelRowClass`, a wariant `sm:py-2` zostaje.

## What We're NOT Doing

- Nie łączymy opisu i wieku w jedną linię (łamałoby US-22, trzy linie).
- Nie luzujemy testu `phone-layout.spec.ts:499`.
- Nie ruszamy `DIALOG_ROW_CLASS` ani wierszy bez opisu.
- Nie zmieniamy treści opisów ani PRD.

## Implementation Approach

Jedna zmiana w `levelRowClass`: dla wierszy z opisem zmniejszyć pionowy padding poniżej `sm` z `py-2.5` do `py-1.5` (oszczędność ≈ 8 px na wiersz, ≈ 48 px na listę, zapas ≈ 30 px). Wysokość wiersza ≈ 80 px zostaje dużo powyżej celu 44 px. Najpierw pomiar przepełnienia w WebKit (lub reprodukcja przez `E2E_WEBKIT=1`), żeby potwierdzić hipotezę, potem poprawka i ponowny pomiar.

## Phase 1: Zagęszczenie wierszy listy poziomów

### Overview

Potwierdzić przyczynę pomiarem, zmniejszyć padding wierszy trzyliniowych na telefonie, zweryfikować na WebKit.

### Changes Required:

#### 1. Pomiar przyczyny

**File**: `tests/e2e/phone-layout.spec.ts` (tylko uruchomienie, bez edycji)

**Intent**: Odtworzyć porażkę lokalnie (`E2E_WEBKIT=1`, `E2E_PORT` wolny port) albo, gdy WebKit nie startuje na Windows, policzyć wysokości wierszy w Chromium o viewporcie iPhone 13 (390×664) i porównać z 18 px.

**Contract**: Wynik: przepełnienie w px przed zmianą, zapisane w notatce zmiany.

#### 2. Ciaśniejszy padding wiersza z opisem

**File**: `src/components/LevelRow.tsx`

**Intent**: `levelRowClass` dodaje `py-1.5` dla wierszy z opisem, więc na telefonie wiersz jest niższy; od `sm` zostaje `sm:py-2` z `DIALOG_ROW_CLASS`.

**Contract**: `levelRowClass(description)` dla `description !== undefined` zawiera `py-1.5`; dla `undefined` zwraca pusty ciąg jak dziś. Komentarz funkcji wspomina, że padding jest ciaśniejszy, bo trzy linie × sześć wierszy muszą się zmieścić na iPhone 13 (GitHub #209).

### Success Criteria:

#### Automated Verification:

- Lint przechodzi: `npm run lint`
- Typy przechodzą: `npx astro check`
- Testy jednostkowe przechodzą: `npm test`
- Test układu telefonu przechodzi w Chromium (pixel-7, phone-360), ze wskazanym `E2E_PORT`
- Test przechodzi na iphone-13: lokalnie z `E2E_WEBKIT=1`, a gdy nie startuje, workflow `e2e-phone` (workflow_dispatch)

#### Manual Verification:

- Lista poziomów labiryntu ma sześć wierszy bez przewijania na iPhone 13 (lub emulacji WebKit)
- Listy symetrii, sekwencji, dyktanda i sudoku wyglądają porządnie
- Wiersz na telefonie ma co najmniej 44 px wysokości

**Implementation Note**: Po zielonym `e2e-phone` zamknąć #209.

---

## Testing Strategy

### Unit Tests:

- Test `levelRowClass`, jeśli istnieje plik testowy dla `LevelRow`; w przeciwnym razie pokrywa go test e2e.

### Integration Tests:

- `tests/e2e/phone-layout.spec.ts:499` (bez zmian) na `iphone-13`, `pixel-7`, `phone-360`.

### Manual Testing Steps:

1. Otworzyć `/maze` w emulacji iPhone 13, kliknąć „Poziom: …”, sprawdzić brak przewijania.
2. Powtórzyć dla symetrii, sekwencji, dyktanda i sudoku.

## Performance Considerations

Brak.

## References

- GitHub #209
- `src/components/LevelRow.tsx:4`, `src/components/ProfileCorner.tsx:39,599-622`, `src/components/WorksheetGenerator.tsx:155-195`
- `tests/e2e/phone-layout.spec.ts:499-520`
- PRD US-22 (trzy linie wiersza), US-04

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Zagęszczenie wierszy listy poziomów

#### Automated

- [x] 1.1 Lint przechodzi: `npm run lint` — f612d38
- [x] 1.2 Typy przechodzą: `npx astro check` — f612d38
- [x] 1.3 Testy jednostkowe przechodzą: `npm test` — f612d38
- [x] 1.4 Test układu telefonu przechodzi w Chromium (pixel-7, phone-360) — f612d38
- [x] 1.5 Test przechodzi na iphone-13 (lokalnie z E2E_WEBKIT=1 albo workflow e2e-phone) — f612d38

#### Manual

- [ ] 1.6 Lista poziomów labiryntu ma sześć wierszy bez przewijania na iPhone 13
- [ ] 1.7 Listy symetrii, sekwencji, dyktanda i sudoku wyglądają porządnie
- [ ] 1.8 Wiersz na telefonie ma co najmniej 44 px wysokości
