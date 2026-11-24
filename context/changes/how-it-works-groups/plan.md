# Jak to działa: trzy zwinięte grupy i opis własnego obrazka — plan

## Overview

Strona `/how-it-works` po S-53 ma zasady jako długi, rozwinięty tekst nad 16 zwijanymi kartami. Zmieniamy ją na trzy grupy (Ustawienia i zasady, Karty, Dobrze wiedzieć), w których każdy wiersz to zwijane `<details>`, domyślnie zamknięte. Dopisujemy opis „Własnego obrazka”, bo ta funkcja jest dziś schowana na liście postaci. To poprawka po wdrożeniu S-53 (PR #486), nie nowy slice roadmapy.

## Current State Analysis

- `src/pages/how-it-works.astro`: tablica `sections` (6 zasad) renderowana jako `h2` + akapit, potem `h2` „Rodzaje kart” i 16 `<details>` z `cardsInCatalogOrder()`, opisem z `CARD_KINDS`, poziomami z `cardLevelGroups` i linkiem „Otwórz …” poza `<summary>`.
- `tests/e2e/how-it-works.spec.ts` przypina `h2` „Poziomy”, „Profil dziecka”, „Ulubiona postać”, „Postać na karcie”, „Święta”, teksty zasad, kolejność kart i brak słowa „filtr”.
- Własny obrazek: `src/lib/sheet/own-image.ts` (bajty JPEG/PNG/WebP/HEIC, limit 8 MB, zmniejszanie do 512 px), wiersz „Własny obrazek” (`OWN_IMAGE_LABEL`) na liście postaci w `ProfileCorner.tsx` (profil: tworzenie i ulubiona) oraz w pasku kart przez `WorksheetGenerator.tsx` i generatory. Plik zostaje w przeglądarce (US-02).
- PRD: US-05 zdanie „Od S-53 (decyzja 2026-11-23)…” i US-22 punkt o stronie „Jak to działa”.

## Desired End State

Po wejściu na `/how-it-works` widać nagłówek, a pod nim trzy grupy z `h2`, w podanej kolejności. Każda ma wiersze zamknięte, w kolejności alfabetycznej po polsku. Wiersze zasad wyglądają jak wiersze kart. Wiersz „Postać i własny obrazek” zawiera dotychczasowy tekst o postaci i opis własnego obrazka. Weryfikacja: testy e2e, ręczny przegląd przy 375 px i klawiaturą.

### Key Discoveries:

- Wiersz karty (`<details class="group">`, `h3` w `<summary>`, `min-h-11`, link poza `<summary>`) jest gotowym wzorem dla wierszy zasad (`how-it-works.astro`).
- Test „opisuje każdy rodzaj karty” liczy `details` i `h3` globalnie, więc trzeba go zawęzić do grupy „Karty”.
- „Święta” w teście działa przez dopasowanie podciągu nagłówka „Święta i zima”; nagłówek stanie się `h3` w wierszu.

## What We're NOT Doing

- Zmiany `CARD_KINDS`, `levels.ts`, `card-levels.ts`, listy postaci, interfejsu paska.
- Wyraźniejszej podpowiedzi o „Własnym obrazku” przy samej liście postaci (osobny follow-up, do wspomnienia w raporcie).
- Zmiany treści zasad poza scaleniem „Profil dziecka” z „Ulubiona postać” i dopisaniem własnego obrazka.
- JS, React ani `set:html`; testów WebKit i telefonu (e2e tylko Chromium).
- Nowego slice'a w roadmapie.

## Implementation Approach

Powtarzalny wiersz wyciągamy do małego komponentu `src/components/HowItWorksRow.astro` (tytuł `h3` w `<summary>`, strzałka, slot na treść), bo trzeba go użyć dla zasad, kart i „Dobrze wiedzieć”. Dane zasad są w tablicach we frontmatterze (tytuł + akapity). Alfabetyczna kolejność po polsku jest zapisana wprost w kolejności tablic i pilnowana testem (`localeCompare(…, "pl")`). Grupy mają stałą kolejność.

## Phase 1: Układ strony

### Overview

Trzy grupy z `h2`, wszystkie wiersze zwinięte, komponent wiersza, scalenie profilu, nowy wiersz własnego obrazka.

### Changes Required:

#### 1. Komponent wiersza

**File**: `src/components/HowItWorksRow.astro`

**Intent**: Wyciągnąć wiersz `<details>` (summary z `h3` i strzałką, treść w slocie) tak, by zasady i karty wyglądały identycznie, bez zmiany wyglądu wiersza karty.

**Contract**: Prop `title: string`; slot domyślny na treść. Klasy i atrybuty jak dziś (`group`, `min-h-11`, `[&::-webkit-details-marker]:hidden`, `group-open:rotate-180`), bez `open`.

#### 2. Strona

**File**: `src/pages/how-it-works.astro`

**Intent**: Zastąpić listę sekcji i sekcję „Rodzaje kart” trzema grupami z `h2`: „Ustawienia i zasady” (Postać i własny obrazek, Poziomy, Profil dziecka i ulubiona postać), „Karty” (16 wierszy jak dziś), „Dobrze wiedzieć” (Święta i zima, Twoje dane). Scalić dawne „Profil dziecka” i „Ulubiona postać” w jeden wiersz z dwoma akapitami tekstu bez zmian merytorycznych. Do wiersza postaci dopisać na końcu opis własnego obrazka.

**Contract**: Tekst dopisku: „Zamiast postaci z katalogu możesz wybrać „Własny obrazek” na liście postaci: przy pasku „Postać” na karcie, przy tworzeniu profilu i przy ulubionej postaci. Wskaż plik z urządzenia, np. zdjęcie dziecka albo jego rysunek (JPEG, PNG, WebP albo HEIC, do 8 MB). Obrazek zostaje w przeglądarce i nie jest wysyłany na serwer. Może być też ulubioną postacią profilu.” Tekst „Poziomy” zmienia odwołanie „w części „Rodzaje kart”” na „w wierszu danej karty w grupie „Karty””. Wiersze w grupach alfabetycznie po polsku; kolejność grup stała.

### Success Criteria:

#### Automated Verification:

- Lint przechodzi: `npm run lint`
- Typy i build przechodzą: `npx astro check` oraz `npm run build`

#### Manual Verification:

- Po wejściu na `/how-it-works` wszystkie wiersze są zamknięte, a grupy są w kolejności: Ustawienia i zasady, Karty, Dobrze wiedzieć
- Wiersze zasad rozwijają się myszą i klawiaturą (Enter), a przy 375 px nie ma poziomego przepełnienia
- Wiersz „Postać i własny obrazek” zawiera opis własnego obrazka

---

## Phase 2: Testy e2e

### Overview

Dostosować `how-it-works.spec.ts` do nowej struktury, nie osłabiając pilnowania treści.

### Changes Required:

#### 1. Spec

**File**: `tests/e2e/how-it-works.spec.ts`

**Intent**: Sprawdzać trzy nagłówki `h2` w kolejności, zamknięcie wszystkich wierszy po wejściu, treść zasad po rozwinięciu wiersza, opis własnego obrazka w wierszu „Postać i własny obrazek”, kolejność alfabetyczną wierszy w każdej grupie oraz kolejność kart zgodną z katalogiem. Zachować asercje tekstowe zasad, okna dat świąt i braku słowa „filtr”; test kart zawęzić do grupy „Karty”.

**Contract**: Pomocnik `rowFor` zostaje; grupa to `section` z `h2` o danej nazwie. Alfabet: lista tytułów równa się własnej kopii posortowanej `localeCompare(…, "pl")`.

### Success Criteria:

#### Automated Verification:

- Spec przechodzi: `E2E_PORT=<wolny port> npx playwright test tests/e2e/how-it-works.spec.ts --project=chromium`
- Spec jest czerwony po celowym dodaniu `open` do `<details>`, a po cofnięciu zielony

---

## Phase 3: PRD i pełna weryfikacja

### Overview

Zaktualizować PRD i uruchomić wszystkie bramki.

### Changes Required:

#### 1. PRD

**File**: `context/foundation/prd.md`

**Intent**: W US-05 (zdanie „Od S-53…”) i US-22 (punkt o stronie „Jak to działa”) opisać układ: trzy grupy, wszystkie wiersze zwinięte, alfabetycznie w grupach, oraz że strona opisuje „Własny obrazek”. Reszta PRD bez zmian.

**Contract**: Edycja tylko tych dwóch miejsc, z datą decyzji 2026-11-24.

### Success Criteria:

#### Automated Verification:

- `npm test`, `npm run lint`, `npm run depcruise`, `npx astro check`, `npm run build` zielone
- Spec e2e z fazy 2 zielony

#### Manual Verification:

- PRD US-05 i US-22 zgadzają się z działającą stroną

---

## Testing Strategy

### Unit Tests:

- Brak nowej logiki; istniejące `npm test` musi zostać zielone.

### Integration Tests:

- Spec e2e (Chromium) z fazy 2.

### Manual Testing Steps:

1. `preview_start` „dev”, wejść na `/how-it-works`: wszystkie wiersze zamknięte, trzy grupy w kolejności.
2. Rozwinąć „Postać i własny obrazek” klawiaturą (Tab, Enter) i przeczytać opis.
3. Zmniejszyć okno do 375 px: brak poziomego przepełnienia.

## References

- Poprzednia zmiana: `context/archive/2026-11-23-how-it-works-m7/`
- Fakty o własnym obrazku: `src/lib/sheet/own-image.ts`, `src/components/ProfileCorner.tsx`
- PRD: US-02, US-03, US-05, US-22

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Układ strony

#### Automated

- [x] 1.1 Lint przechodzi: `npm run lint`
- [x] 1.2 Typy i build przechodzą: `npx astro check` oraz `npm run build`

#### Manual

- [x] 1.3 Wszystkie wiersze zamknięte, trzy grupy w podanej kolejności
- [x] 1.4 Wiersze zasad rozwijają się myszą i klawiaturą, brak poziomego przepełnienia przy 375 px
- [x] 1.5 Wiersz „Postać i własny obrazek” zawiera opis własnego obrazka

### Phase 2: Testy e2e

#### Automated

- [x] 2.1 Spec przechodzi na Chromium z `E2E_PORT`
- [x] 2.2 Spec jest czerwony po celowym dodaniu `open` do `<details>`, a po cofnięciu zielony

### Phase 3: PRD i pełna weryfikacja

#### Automated

- [ ] 3.1 `npm test`, `npm run lint`, `npm run depcruise`, `npx astro check`, `npm run build` zielone
- [ ] 3.2 Spec e2e z fazy 2 zielony

#### Manual

- [ ] 3.3 PRD US-05 i US-22 zgadzają się z działającą stroną
