# Wybór kategorii obiektów (S-26) Implementation Plan

## Overview

Na paskach stron symetrii, nonogramu i dyktanda graficznego dochodzi wybór „Kategoria”: Wszystkie (domyślnie), Zwierzęta, Jedzenie, Przyroda, Kosmos i maszyny, Domy i budowle. Dokładnie jedna naraz, w stanie strony; kolejne Generuj losuje obiekt tylko z wybranej kategorii (US-20, FR-029).

## Current State Analysis

Każdy szablon ma `categories` (`src/lib/symmetry/template-format.ts:41`), ale `symmetryTemplatesFor(levelId)` (`src/lib/symmetry/templates.ts`) zwraca wszystkie. Trzy generatory czytają obiekty tylko przez tę funkcję. Dyktando trzyma katalog kart per poziom w `catalogs` (`src/lib/dictation/generate.ts`). Liczby per kategoria × poziom/rozmiar są w `research.md`: najmniej to 3 obiekty i 8 różnych obrysów dyktanda, więc żadna kombinacja nie zostaje z jednym obrysem ani z zerem; decyzji dla użytkowniczki nie ma.

## Desired End State

Rodzic wybiera kategorię przyciskiem „Kategoria: …” obok „Poziom: …”; po Generuj obiekt pochodzi z tej kategorii. Zmiana kategorii nie generuje nowej karty sama (US-20: obowiązuje przy następnym Generuj), nie zmienia poziomu, rozmiaru ani kolorów, a wybór na jednej stronie nie zmienia drugiej. Weryfikacja: testy per kategoria × poziom/rozmiar i przegląd na 375 px.

### Key Discoveries:

- Jedyny punkt odczytu katalogu: `symmetryTemplatesFor` (symetria `generate.ts`, nonogram `generate.ts`, dyktando `catalogFor`; ponadto `nonogramVariants`).
- `LevelChoice` jest generyczny po `{id,label}`, ale ma na sztywno „Poziom” (`src/components/LevelChoice.tsx`); wymaga parametrów etykiety.
- Pusta lista szablonów dałaby `pick(random, 0)` = −1 i wyjątek w symetrii i nonogramie; musi dać `null`.

## What We're NOT Doing

- Wielokrotny wybór kategorii, zapis kategorii w profilu lub w ostatnich parametrach (stan strony).
- Nowe obiekty, zmiany szablonów, wyłączanie kategorii lub komunikat o braku obiektów (liczby tego nie wymagają).
- Automatyczne generowanie nowej karty po zmianie kategorii.
- Rozmiar nonogramu (S-24, osobna sesja).

## Implementation Approach

Filtr w jednym miejscu (`templates.ts`), parametr `category` z domyślnym „wszystkie” w trzech generatorach, kategoria w kluczu cache dyktanda. UI: wspólny przycisk z dialogiem przez uogólnienie `LevelChoice` o etykietę; w każdym generatorze stan `categoryId` i kontrolka obok poziomu. Pasek zawija się (`flex-wrap`), więc mieści się na telefonie.

## Phase 1: Filtr kategorii w bibliotece i generatorach

### Overview

Logika bez UI, z testami.

### Changes Required:

#### 1. Katalog

**File**: `src/lib/symmetry/templates.ts`

**Intent**: Wybór kategorii jako dane: lista „Wszystkie” + 5 kategorii z etykietami PRD oraz filtr szablonów.

**Contract**: `ObjectCategoryChoiceId = "wszystkie" | ObjectCategoryId`; `OBJECT_CATEGORY_CHOICES: readonly {id, label}[]` z „Wszystkie” pierwszym; `DEFAULT_OBJECT_CATEGORY_ID = "wszystkie"`; `symmetryTemplatesFor(levelId, category = "wszystkie")` zwraca szablony zawierające kategorię (dla „wszystkie” tę samą tablicę co dotąd).

#### 2. Generatory

**Files**: `src/lib/symmetry/generate.ts`, `src/lib/nonogram/generate.ts`, `src/lib/dictation/generate.ts`

**Intent**: Przyjmują `category` (domyślnie „wszystkie”); pusta lista daje `null`, nie wyjątek ani pętlę. Dyktando: cache pod kluczem poziom+kategoria; `dictationVariantCount` i `nonogramVariants` też przyjmują kategorię.

**Contract**: ostatni opcjonalny parametr `category` w `generateSymmetryCard`, `generateNonogramCard`, `generateDictationCard`, `dictationVariantCount`, `nonogramVariants`; istniejące wywołania działają bez zmian.

#### 3. Testy

**File**: nowy `src/lib/object-categories.test.ts`, dopisany do skryptu `test` w `package.json`

**Intent**: Dla każdej kategorii × poziom symetrii / rozmiar nonogramu / poziom dyktanda: wiele losowań daje tylko obiekty z kategorii (symetria i nonogram po id szablonu z klucza; dyktando po obrysie wśród obrysów kategorii), każda kombinacja daje co najmniej 2 różne karty (dyktando: `dictationVariantCount(level, category).distinctOutlines`; nonogram: warianty z `nonogramVariants` bez `nonogramCardProblems`), kolejne Generuj z kluczem poprzedniej daje inną kartę. „Wszystkie” obejmuje każdą kategorię. Nieznana kategoria daje `null`. Bez pinowania liczb wariantów.

### Success Criteria:

#### Automated Verification:

- Testy przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Typy: `npx astro check`

---

## Phase 2: Kontrolka „Kategoria” na trzech stronach

### Overview

UI: przycisk z dialogiem, stan strony, podpięcie do generatorów.

### Changes Required:

#### 1. Wspólna kontrolka

**File**: `src/components/LevelChoice.tsx`

**Intent**: Uogólnić o etykietę przycisku i tytuł dialogu, żeby ta sama kontrolka służyła kategorii.

**Contract**: opcjonalne `label` (domyślnie „Poziom”) i `dialogTitle` (domyślnie „Wybierz poziom”); `aria-label` = `${label}: ${wybór}`; pozostałe użycia bez zmian.

#### 2. Strony

**Files**: `src/components/SymmetryGenerator.tsx`, `src/components/NonogramGenerator.tsx`, `src/components/DictationGenerator.tsx`

**Intent**: Stan `categoryId` i `categoryOpen`, kontrolka „Kategoria” obok poziomu w obu miejscach paska (przed i po pierwszym Generuj; nonogram: obok „Pokaż rozwiązanie”); generowanie przekazuje kategorię. Zmiana kategorii tylko ustawia stan. `disabled={waitingForChild}` jak przy poziomie.

**Contract**: stan tylko w komponencie strony; bez profilu, `last-used` i `useChildProfileVisit`.

### Success Criteria:

#### Automated Verification:

- Lint, typy, build i testy przechodzą: `npm run lint`, `npx astro check`, `npm run build`, `npm test`

#### Manual Verification:

- Na każdej z trzech stron wybór kategorii działa, Generuj losuje tylko z niej, „Wszystkie” jest domyślne, a wybór na jednej stronie nie zmienia drugiej
- Przy 375 px pasek się zawija, Generuj i Drukuj nie nachodzą na siebie, a karta zostaje bez zmian na A4

---

## Phase 3: Dokumenty

### Overview

PRD pytanie 11 i roadmapa.

### Changes Required:

#### 1. PRD i roadmapa

**Files**: `context/foundation/prd.md`, `context/foundation/roadmap.md`

**Intent**: Dopisać do Open Questions 11 liczby per kategoria (z `research.md`, stan 2026-10-25) i wniosek, że żadna kombinacja nie zostaje z jednym obrysem; usunąć zdanie „Kategorie nie są jeszcze widoczne na pasku”; zaktualizować status S-26 w roadmapie.

### Success Criteria:

#### Automated Verification:

- Formatowanie zmienionych plików md: `npx prettier --check context/foundation/prd.md context/foundation/roadmap.md`

#### Manual Verification:

- Opis PR zawiera liczby per kategoria

---

## Testing Strategy

### Unit Tests:

- Filtr kategorii i liczność kombinacji (co najmniej 2 różne karty), `null` przy pustej kategorii bez pętli, inna karta przy kolejnym Generuj.

### Manual Testing Steps:

1. Każda strona: wybierz kategorię, kilka razy Generuj, obiekty z kategorii.
2. Telefon 375 px: pasek i przyciski.

## Performance Considerations

Katalog dyktanda budowany leniwie raz na poziom × kategorię; to podzbiór dotychczasowego kosztu.

## References

- Related research: `context/changes/object-category-choice/research.md`
- Wzorzec kontrolki: `src/components/LevelChoice.tsx`, `src/components/SymmetryGenerator.tsx:85`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Filtr kategorii w bibliotece i generatorach

#### Automated

- [x] 1.1 Testy przechodzą: `npm test`
- [x] 1.2 Lint przechodzi: `npm run lint`
- [x] 1.3 Typy: `npx astro check`

### Phase 2: Kontrolka „Kategoria” na trzech stronach

#### Automated

- [x] 2.1 Lint, typy, build i testy przechodzą: `npm run lint`, `npx astro check`, `npm run build`, `npm test`

#### Manual

- [ ] 2.2 Na każdej z trzech stron wybór kategorii działa, Generuj losuje tylko z niej, „Wszystkie” jest domyślne, a wybór na jednej stronie nie zmienia drugiej
- [ ] 2.3 Przy 375 px pasek się zawija, Generuj i Drukuj nie nachodzą na siebie, a karta zostaje bez zmian na A4

### Phase 3: Dokumenty

#### Automated

- [x] 3.1 Formatowanie zmienionych plików md: `npx prettier --check context/foundation/prd.md context/foundation/roadmap.md`

#### Manual

- [ ] 3.2 Opis PR zawiera liczby per kategoria
