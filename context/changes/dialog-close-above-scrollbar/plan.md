# Przycisk X bezpośrednio nad paskiem przewijania — Implementation Plan

## Overview

We wspólnym dialogu rynna paska przewijania dostaje te same lewe i prawe krawędzie co ramka X. Krzyżyk zostaje przypięty w rogu, a lista nadal przewija się pod nim.

## Current State Analysis

Na HEAD `DialogContent` przy krzyżyku dokłada `pt-14 pr-14` (`src/components/ui/dialog.tsx:52`). X jest `absolute top-4 right-4` (`:62`), a pasek należy do wewnętrznego `min-h-0 overflow-y-auto` (`:57`). `pr-14` (3.5rem) jest szerszy niż `right-4` (1rem), więc prawa krawędź scrollera — i rynna paska — stoi na lewo od X.

Oba okna tylko ograniczają wysokość: `WorksheetGenerator.tsx:220` i `ProfileCorner.tsx:296-297` podają `max-h-[calc(100dvh-2rem)]`. Nie dokładają własnego overflow ani prawego odstępu.

Wcześniejszy plan `dialog-close-button` przypiął X do rogu na czas przewijania i zabrał `overflow-y-auto` z elementu, który go pozycjonuje (`context/archive/2026-10-16-dialog-close-button/plan.md:45`, `:115`). Szerszy prawy odstęp jest skutkiem tego przypięcia. Nie ustawiał rynny pod X.

W drzewie roboczym jest już niezacommitowana podmiana `pr-14` na `pr-4`. Plan startuje od HEAD i traktuje tę edycję jako kandydatkę do kontraktu, nie jako osobne rozstrzygnięcie.

## Desired End State

Gdy okno się przewija, lewa i prawa krawędź ramki X pokrywają się z rynną paska. Cienki suwak w środku rynny może być węższy niż ikona. Krótkie okno nie dostaje paska, a X zostaje w rogu. Po przewinięciu listy X nie odjeżdża i nie zasłania pierwszego wiersza, ołówka ani kosza.

### Key Discoveries:

- Dźwignia kolumny to `padding-right` zewnętrznego dialogu. Wewnętrzny scroller jest zwykłym dzieckiem, więc jego prawa krawędź wynika z tego paddingu (`dialog.tsx:51-58`).
- Ramka X to ikona `size-4` (16 px) przy `right-4` (16 px). Na Windowsie zmierzona rynna ma 16 px, więc `pr-4` składa obie ramki: od 16 px do 32 px od prawej krawędzi paddingu.
- `npm test` nie montuje tych dialogów. Sprawdzenie kolumny jest ręczne.

## What We're NOT Doing

- Wyśrodkowanie glifu na widocznym suwaku, gdy suwak jest węższy niż rynna.
- Samo zrównanie prawych krawędzi, gdy ikona wystaje w lewo od cienkiego suwaka.
- Mierzenie szerokości paska w JavaScripcie.
- Osobne klasy na dialogu postaci i na oknie profilu.
- Napis „Zamknij”, tooltip, zachowanie usuwania, Escape i „Anuluj”.
- Nowy test UI i test Playwright tej kolumny.
- Zmiana PRD i roadmapy.

## Implementation Approach

Zostaje układ z `dialog-close-button`: X absolutny w rogu, przewijanie na wewnętrznym divie, `pt-14` nad pierwszym wierszem. Jedyna zmiana to prawy odstęp. `pr-14` schodzi do `pr-4`, czyli do tego samego offsetu co `right-4`. Przy rynnie 16 px lewa i prawa krawędź ramki X i rynny się schodzą. Wołający zostają przy samym `max-h`.

## Critical Implementation Details

- **User experience spec** — „Bezpośrednio nad” znaczy wspólne lewe i prawe krawędzie ramki X i rynny paska, nie środek cienkiego suwaka. `pt-14` zostaje, więc pierwszy wiersz zaczyna się pod ikoną. `overflow-y-auto` nie wraca na element, który pozycjonuje X.

## Phase 1: Wspólna kolumna

### Overview

Prawy odstęp wspólnego dialogu zrównać z kolumną X, bez ruszania przypięcia krzyżyka i bez osobnych klas na oknach.

### Changes Required:

#### 1. Prawy odstęp dialogu

**File**: `src/components/ui/dialog.tsx`

**Intent**: Rynna paska ma te same lewe i prawe krawędzie co ramka X, bo dzisiejsze `pr-14` wcina scroller szerzej niż kolumna krzyżyka.

**Contract**: Przy `showCloseButton` prawy padding dialogu jest `pr-4`, ten sam co `right-4` krzyżyka. Górny padding zostaje `pt-14`. Krzyżyk zostaje `absolute top-4 right-4`, ikona `size-4`. Scroller zostaje wewnętrznym `min-h-0 overflow-y-auto`. `WorksheetGenerator.tsx` i `ProfileCorner.tsx` zostawiają samo `max-h-[calc(100dvh-2rem)]`.

### Success Criteria:

#### Automated Verification:

- Lint przechodzi: `npm run lint`
- Sprawdzenie typów przechodzi: `npx astro check`
- Dotychczasowe testy przechodzą: `npm test`

#### Manual Verification:

- Lista profili z paskiem: lewa i prawa krawędź ramki X pokrywają się z rynną paska.
- Dialog postaci z paskiem: lewa i prawa krawędź ramki X pokrywają się z rynną paska.
- Pytanie o usunięcie bez paska: X zostaje w rogu i nie zasłania tytułu.
- Po przewinięciu listy X zostaje w rogu, a ołówek, kosz i pierwszy wiersz postaci nadal się klikają.

**Implementation Note**: Po zielonym sprawdzeniu automatycznym zatrzymaj się na ręczne potwierdzenie tych czterech punktów.

---

## Testing Strategy

### Unit Tests:

- Brak nowego testu jednostkowego. `npm test` nie montuje dialogu i ma tylko nie spaść.

### Integration Tests:

- Brak nowego testu Playwright tej kolumny.

### Manual Testing Steps:

1. Otwórz listę profili na tyle krótkim oknie, żeby pojawił się pasek, i porównaj ramkę X z rynną.
2. Otwórz wybór postaci z paskiem i zrób to samo.
3. Otwórz pytanie o usunięcie i sprawdź róg bez paska.
4. Przewiń długą listę i kliknij ołówek, kosz oraz pierwszy wiersz postaci.

## Performance Considerations

Jedna klasa odstępu. Brak budżetu wydajności.

## Migration Notes

Brak danych do przeniesienia. Zachowanie startuje od HEAD z `pr-14`.

## References

- Related research: brak
- Frame brief: `context/changes/dialog-close-above-scrollbar/frame.md`
- Similar implementation: `context/archive/2026-10-16-dialog-close-button/plan.md:45`, `:115`
- Issue: https://github.com/drpc1/printo-kids/issues/37
- Source: `src/components/ui/dialog.tsx:51-68`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Wspólna kolumna

#### Automated

- [x] 1.1 Lint przechodzi: `npm run lint` — 9d6974e
- [x] 1.2 Sprawdzenie typów przechodzi: `npx astro check` — 9d6974e
- [x] 1.3 Dotychczasowe testy przechodzą: `npm test` — 9d6974e

#### Manual

- [x] 1.4 Lista profili z paskiem: lewa i prawa krawędź ramki X pokrywają się z rynną paska. — 9d6974e
- [x] 1.5 Dialog postaci z paskiem: lewa i prawa krawędź ramki X pokrywają się z rynną paska. — 9d6974e
- [x] 1.6 Pytanie o usunięcie bez paska: X zostaje w rogu i nie zasłania tytułu. — 9d6974e
- [x] 1.7 Po przewinięciu listy X zostaje w rogu, a ołówek, kosz i pierwszy wiersz postaci nadal się klikają. — 9d6974e
