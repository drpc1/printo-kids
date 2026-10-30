# Przycisk „Dodaj profil” odróżnia się od wierszy profili — plan

## Overview

W oknie profilu (`ProfileCorner.tsx`) „Dodaj profil” wygląda jak wiersz z imieniem dziecka. Zmieniamy go na przycisk-akcję: wariant `outline` z ikoną `Plus`, wyśrodkowany. GitHub #74. Wygląd zatwierdzony na makiecie `mockup.html`.

## Current State Analysis

- `src/components/ProfileCorner.tsx:484` — „Dodaj profil” to `Button variant="ghost"` z `DIALOG_ROW_CLASS` + `w-full`, identyczny jak „Bez profilu” (`:471`) i wiersze imion (`:418`).
- `button.tsx` ma gotowy wariant `outline` (ramka, `bg-background`); lucide już importowane w pliku (`Pencil`, `Trash2`, `ChevronDown`).
- `tests/e2e/profile-summary.spec.ts:160` klika przycisk po nazwie „Dodaj profil”.
- Przycisk jest też jedynym elementem listy dla pustej listy profili (`:481-486`); dialog otwiera wtedy od razu formularz, więc ten przypadek nie dotyka zmiany.

## Desired End State

Przycisk „Dodaj profil” ma obramowanie, ikonę Plus przed napisem i wyśrodkowany tekst; wiersze imion i „Bez profilu” bez zmian. Nazwa dostępna to nadal „Dodaj profil”. Wysokość 44 px i rozmiar tekstu jak reszta wierszy dialogu.

### Key Discoveries:

- Wariant `outline` istnieje, więc nie ma nowego koloru ani tokenu (reguły UI w AGENTS.md).
- Ikona dekoracyjna z `aria-hidden` nie zmienia nazwy dostępnej, więc istniejący test e2e dalej przechodzi.

## What We're NOT Doing

- Nie zmieniamy „Bez profilu” ani wierszy imion.
- Nie zmieniamy `DIALOG_ROW_CLASS` (używany też przez listy postaci i poziomów).
- Nie dodajemy nowych kolorów, tokenów ani wariantu do `button.tsx`.

## Implementation Approach

Jedna zmiana w jednym przycisku plus jedna asercja e2e.

## Phase 1: Wygląd przycisku i test

### Overview

Zmiana przycisku i test regresji wyglądu.

### Changes Required:

#### 1. Przycisk w oknie profilu

**File**: `src/components/ProfileCorner.tsx`

**Intent**: Odróżnić „Dodaj profil” od wierszy profili: obramowanie, ikona Plus, wyśrodkowanie.

**Contract**: `variant="outline"`, dalej `DIALOG_ROW_CLASS` i `w-full`, plus `justify-center`; dziecko `<Plus aria-hidden className={cn("size-4")} />` (import z `lucide-react`) przed napisem. Nazwa dostępna bez zmian.

#### 2. Test e2e

**File**: `tests/e2e/profile-summary.spec.ts`

**Intent**: Pilnować, że przycisk ma ikonę i ramkę, a nazwa to nadal „Dodaj profil”.

**Contract**: Nowy test w stylu istniejących (seed profilu, `/maze`, otwarcie dialogu): przycisk „Dodaj profil” zawiera `svg`, ma niezerową szerokość ramki (`border-top-width` > 0), a „Bez profilu” (przy aktywnym profilu) jej nie ma.

### Success Criteria:

#### Automated Verification:

- Lint przechodzi: `npm run lint`
- Typy przechodzą: `npx astro check`
- Testy jednostkowe: `npm test`
- E2E profilu: `npx playwright test tests/e2e/profile-summary.spec.ts --project=chromium`

#### Manual Verification:

- Na desktopie i telefonie „Dodaj profil” jest wyraźnie akcją, nie kolejnym profilem
- Przycisk mieści się w dialogu bez ucinania, wysokość 44 px
- Tryb ciemny i fokus klawiatury wyglądają poprawnie

**Implementation Note**: Po automatycznych testach zatrzymaj się na ręczne potwierdzenie.

---

## Testing Strategy

### Unit Tests:

- Brak; zmiana czysto prezentacyjna.

### Integration Tests:

- E2E jak wyżej.

### Manual Testing Steps:

1. Otwórz `/maze` z dwoma profilami, kliknij narożnik profilu.
2. Porównaj „Dodaj profil” z wierszami imion i „Bez profilu”.
3. Powtórz na wąskim viewportcie (360 px).

## References

- GitHub #74
- Makieta: `context/changes/gh74-add-profile-button/mockup.html`
- `src/components/ProfileCorner.tsx:484`, `src/components/ui/button.tsx`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Wygląd przycisku i test

#### Automated

- [x] 1.1 Lint przechodzi: `npm run lint` — 570f746
- [x] 1.2 Typy przechodzą: `npx astro check` — 570f746
- [x] 1.3 Testy jednostkowe: `npm test` — 570f746
- [x] 1.4 E2E profilu: `npx playwright test tests/e2e/profile-summary.spec.ts --project=chromium` — 570f746

#### Manual

- [x] 1.5 Na desktopie i telefonie „Dodaj profil” jest wyraźnie akcją, nie kolejnym profilem — 570f746
- [x] 1.6 Przycisk mieści się w dialogu bez ucinania, wysokość 44 px — 570f746
- [x] 1.7 Tryb ciemny i fokus klawiatury wyglądają poprawnie
