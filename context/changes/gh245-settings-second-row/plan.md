# Druga linia ustawień karty na komputerze (GH 245) Implementation Plan

## Overview

Gdy pasek ustawień karty zawija się od szerokości `sm` (640 px), druga linia zaczyna się bardziej w lewo niż pierwsza. Wyrównujemy wcięcie kontrolek na wszystkich szerokościach tak, żeby pierwsza kontrolka każdej linii zaczynała się tam, gdzie tekst „Postać” (reguła z #173, dziś tylko telefon).

## Current State Analysis

Tekst „Postać” (i „Poziom”, „Kategoria”, „Rozmiar”) stoi 12 px od lewej krawędzi wiersza: przycisk ma `px-2`, ale `has-[>svg]:px-3` z `ui/button` (przycisk z ikoną chevron) wygrywa. Kontrolki bez chevrona dostają wcięcie 12 px tylko poniżej `sm` (`max-sm:`); od `sm` mają 0 albo 8 px.

### Key Discoveries:

- `src/components/SettingToggle.tsx:18` — `max-sm:px-3`; od `sm` brak paddingu, więc przełącznik (Kolory, Pokaż rozwiązanie) schodzi na drugą linię z wcięciem 0 px.
- `src/components/SudokuSymbolsChoice.tsx:30` — `px-2 … max-sm:px-3`; od `sm` przyciski Kształty/Cyfry mają 8 px, gdy zaczynają linię.
- `src/components/CardPage.tsx:94-104` — wiersz `flex-wrap`, od `sm` dosunięty do lewej po Generuj; nic do zmiany.
- `src/components/LevelChoice.tsx:51`, `CharacterChoiceControl.tsx:60`, `SudokuChoice.tsx:41` — przyciski z chevronem; wzorzec wcięcia, do którego dopasowujemy.
- `tests/e2e/phone-settings-rows.spec.ts` — reguła „tekst pierwszej kontrolki w linii = tekst Postać” sprawdzana tylko na `phone-360`; helpery `textLeft`, `contentLeft`, `expectRowRules`.

## Desired End State

Na szerokości 640 px i więcej, po Generuj i przed nim, każda linia zawiniętego paska zaczyna się tam, gdzie tekst „Postać” (przełącznik: jego lewa krawędź). Telefon bez zmian wizualnych. Weryfikacja: rozszerzony test e2e przechodzi na projektach Chromium.

## What We're NOT Doing

- Nie zmieniamy `CardPage` ani układu wiersza (zawijanie, odstępy, centrowanie przed pierwszą kartą).
- Nie zmieniamy reguły odstępów między liniami (zostaje tylko dla telefonu).
- Nie ruszamy `ui/button` ani wcięcia przycisków z chevronem.

## Implementation Approach

Zdjąć prefiks `max-sm:` z wcięcia `px-3` w dwóch kontrolkach bez chevrona, żeby wcięcie 12 px było takie samo na każdej szerokości (`basis-full` przełącznika zostaje tylko na telefonie). Test e2e uogólnić na szerokość ≥ 640 px.

## Phase 1: Wspólne wcięcie i test od sm

### Overview

Wcięcie 12 px na wszystkich szerokościach + test chroniący regułę poniżej i powyżej `sm`.

### Changes Required:

#### 1. SettingToggle

**File**: `src/components/SettingToggle.tsx`

**Intent**: Przełącznik ma wcięcie jak przyciski z chevronem na każdej szerokości, więc po zawinięciu zaczyna linię tam, gdzie „Postać”. Zaktualizować komentarz nad komponentem.

**Contract**: `px-3` bez `max-sm:`; `max-sm:basis-full` zostaje.

#### 2. SudokuSymbolsChoice

**File**: `src/components/SudokuSymbolsChoice.tsx`

**Intent**: Przyciski Kształty/Cyfry mają to samo wcięcie na każdej szerokości.

**Contract**: `px-3` zamiast `px-2 … max-sm:px-3`.

#### 3. Test e2e

**File**: `tests/e2e/phone-settings-rows.spec.ts`

**Intent**: Reguła wyrównania (bez reguły odstępów) sprawdzana także od `sm`: ustawić viewport ok. 700 px szerokości w projektach `chromium` i `tablet-768` (pozostałe, `phone-360` i `pixel-7`, są poniżej 640 px), tak by pasek sudoku (6×6) zawinął się po Generuj; asercja, że pasek ma co najmniej dwie linie na sudoku, żeby test nie przechodził pusto. Zaktualizować komentarz nagłówkowy (usunąć zdanie, że od 640 px wcięcie nie obowiązuje).

**Contract**: wydzielić z `expectRowRules` część wyrównania do osobnej funkcji, którą wołają oba warianty.

### Success Criteria:

#### Automated Verification:

- Lint przechodzi: `npm run lint`
- Typy: `npx astro check`
- Testy jednostkowe: `npm test`
- E2E wiersza ustawień na projektach Chromium: `E2E_PORT=4399 npx playwright test tests/e2e/phone-settings-rows.spec.ts`

#### Manual Verification:

- Na komputerze (okno ok. 700 px) po Generuj na sudoku, nonogramie i dyktandzie druga linia zaczyna się tam, gdzie „Postać”
- Telefon (360 px) wygląda jak dotąd
- Szeroki ekran (jedna linia) wygląda poprawnie, po Generuj (przed Generuj wiersz jest wyśrodkowany z założenia)

**Implementation Note**: Po automatycznych kontrolach zatrzymać się na potwierdzenie ręczne.

---

## Testing Strategy

### Unit Tests:

- Brak; zmiana klas CSS.

### Integration Tests:

- `phone-settings-rows.spec.ts` na `phone-360` (regresja) i na szerokości ≥ 640 px.

### Manual Testing Steps:

1. Otworzyć `/sudoku`, wybrać 6×6, Generuj, zwęzić okno do ok. 700 px.
2. Powtórzyć na `/nonogram` i `/dictation`.

## Performance Considerations

Brak.

## References

- Issue: GitHub 245; wcześniejsza reguła telefonu: GitHub 173 (commit f0c974d)
- `src/components/SettingToggle.tsx:18`, `src/components/SudokuSymbolsChoice.tsx:30`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Wspólne wcięcie i test od sm

#### Automated

- [x] 1.1 Lint przechodzi: `npm run lint` — 52b7e4f
- [x] 1.2 Typy: `npx astro check` — 52b7e4f
- [x] 1.3 Testy jednostkowe: `npm test` — 52b7e4f
- [x] 1.4 E2E wiersza ustawień na projektach Chromium: `E2E_PORT=4399 npx playwright test tests/e2e/phone-settings-rows.spec.ts` — 52b7e4f

#### Manual

- [x] 1.5 Na komputerze (okno ok. 700 px) po Generuj na sudoku, nonogramie i dyktandzie druga linia zaczyna się tam, gdzie „Postać” — 52b7e4f
- [x] 1.6 Telefon (360 px) wygląda jak dotąd
- [x] 1.7 Szeroki ekran (jedna linia) wygląda poprawnie, po Generuj (przed Generuj wiersz jest wyśrodkowany z założenia) — 52b7e4f
