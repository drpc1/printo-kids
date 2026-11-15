# Usunięcie znaku zapytania z nazwy „Kto ma więcej” — plan implementacji

## Overview

Nazwa karty pieniędzy w aplikacji i w żywym opisie produktu to „Kto ma więcej”, bez znaku zapytania. GitHub [#383](https://github.com/drpc1/printo-kids/issues/383). Polecenie na kartce zostaje.

## Current State Analysis

Wyświetlana nazwa to `title` rodzaju `pieniadze` w `src/lib/cards.ts`. Katalog, nagłówki „Rodzaje kart”, link w oknie profilu, nagłówek `/money` i `<title>` (`PrintoKids - …`) czytają ten tytuł przy renderze. Profil zapisuje poziom, walutę i kolory, nie tytuł.

Trzy napisy są na sztywno i nie podążą za rejestrem: akapit o poziomach na „Jak to działa”, opis strony `/money` i `aria-label` arkusza. Miniatura i polecenie na kartce mówią „Gdzie jest więcej pieniędzy?” — to inne zdanie.

Kolejność katalogu (`localeCompare` z `"pl"`) ma sąsiadów „Krzyżówka matematyczna” i „Który nie pasuje”. Znak zapytania stoi na końcu tytułu, więc jego usunięcie tych sąsiadów nie zamienia.

Żywy kontrakt nadal ma starą pisownię: PRD, wiersz glosariusza, otwarte pytanie 6 roadmapy, ryzyko 10 planu testów. Te same pliki mają zdania historyczne, których nie wolno przepisać hurtową zamianą.

## Desired End State

Rodzic widzi „Kto ma więcej” w katalogu, na „Jak to działa”, w oknie profilu, w nagłówku `/money`, w tytule karty przeglądarki i w nazwie dostępnej arkusza. Polecenie na kartce jest bez zmian. US-23, FR-033, nagłówek logiki biznesowej, glosariusz, otwarte pytanie 6 i ryzyko 10 używają tej samej nazwy. Wpis z 2026-11-01 i zamknięte M-5 zostają przy „Kto ma więcej?”.

### Key Discoveries:

- Tytuł jest w `src/lib/cards.ts` (rodzaj `pieniadze`); `cardTitle` / `cardPageTitle` tylko go zwracają (`src/lib/cards.ts`).
- Na sztywno: `src/pages/how-it-works.astro` (akapit poziomów), `src/pages/money.astro` (opis), `src/components/MoneyGenerator.tsx` (`aria-label` przy `role="img"`).
- Sortowanie: `cardsInCatalogOrder` w `src/lib/cards.ts`. Test katalogu sortuje tak samo i nie wpisuje tego tytułu.
- Glosariusz zamyka nazwę prostym `"`, nie polskim `”` (`context/domain/glossary.md`).
- W roadmapzie nie ma Change ID `gh383-kto-ma-wiecej`.

## What We're NOT Doing

- Polecenie „Gdzie jest więcej pieniędzy?” na kartce, w miniaturze `public/thumbnails/pieniadze.svg` i w `INSTRUCTION_TEXT`.
- Komentarze w `src/lib/money/`, w skryptach makiet i w nagłówkach testów e2e.
- Archiwum `context/archive/`, notatki kształtujące, snapshot domeny z 2026-11-03.
- Historię w plikach żywego kontraktu: PRD przy wejściu karty do zakresu (2026-11-01) i zamknięte pytanie 13; roadmapa M-5 i S-33; wiersz wyniku Strykera w planie testów (§5a).
- Zmiana identyfikatora `pieniadze`, trasy `/money`, ustawień profilu, kolejności katalogu.

## Implementation Approach

Jedna pisownia w rejestrze zasila każdy ekran, który czyta `kind.title`. Trzy napisy na sztywno i testy, które szukają starej nazwy, idą w tej samej fazie, bo inaczej testy e2e zostaną czerwone. Dokumenty idą potem: w tych samych plikach żywe zdania sąsiadują z historią, a hurtowa zamiana by ją starła. Najpierw ekran, który da się odpalić testem, potem kontrakt czytany przez następną pracę.

## Critical Implementation Details

- W PRD, roadmapzie i planie testów stara pisownia występuje i w zdaniach żywych, i w historii. Zamieniaj wystąpienia z listy w fazie 2, nie cały plik.
- W glosariuszu znika tylko `?`. Cudzysłów zamykający zostaje prosty (`"`), jak w tym wierszu dziś.
- `aria-label` arkusza ma być dokładnie `Kto ma więcej`, bez cudzysłowu. Testy e2e szukają obrazka po tej nazwie. Zdanie postaci w `character-speaks.spec.ts` zostaje.

## Phase 1: Nazwa w aplikacji

### Overview

Rodzic widzi nową nazwę na każdym ekranie, a testy, które trzymały starą, trzymają nową.

### Changes Required:

#### 1. Rejestr kart

**File**: `src/lib/cards.ts`

**Intent**: Tytuł rodzaju `pieniadze` traci znak zapytania, żeby katalog, profil, nagłówek strony i tytuł przeglądarki wzięły nową nazwę z jednego miejsca.

**Contract**: Pole `title` tego rodzaju. `cardTitle` i `cardPageTitle` bez zmian sygnatury. Opis karty nie zawiera nazwy i zostaje.

#### 2. Napisy na sztywno

**File**: `src/pages/how-it-works.astro`

**Intent**: Akapit o poziomach wymienia kartę tak samo jak rejestr.

**Contract**: Jedno wystąpienie w tekście poziomów. Nagłówki listy rodzajów już czytają `card.title` i nie dostają własnej zamiany.

**File**: `src/pages/money.astro`

**Intent**: Opis pod nagłówkiem strony mówi nową nazwą.

**Contract**: Atrybut `description` w `GeneratorShell`. `heading` i `title` layoutu zostają wywołaniami `cardTitle` / `cardPageTitle`.

**File**: `src/components/MoneyGenerator.tsx`

**Intent**: Nazwa dostępna arkusza jest taka sama jak tytuł karty.

**Contract**: `aria-label` elementu `role="img"`. Tekst polecenia rysowany na karcie zostaje.

#### 3. Testy, które trzymają nazwę

**File**: `src/lib/card-summary.test.ts`, `tests/e2e/how-it-works.spec.ts`, `tests/e2e/profile-summary.spec.ts`, `tests/e2e/phone-layout.spec.ts`, `tests/e2e/phone-toggle-align.spec.ts`, `tests/e2e/money.spec.ts`, `tests/e2e/money-reprint.spec.ts`, `tests/e2e/character-speaks.spec.ts`

**Intent**: Asercje nazwy karty przechodzą na nową pisownię, a asercja polecenia na kartce zostaje.

**Contract**: W `character-speaks.spec.ts` pole `sheet` (nazwa obrazka) się zmienia, pole `sentence` nie. W `profile-summary.spec.ts` wyrażenie szuka nowej nazwy i nadal poziomu „łatwy”. Komentarze na górze plików e2e zostają.

### Success Criteria:

#### Automated Verification:

- `npm test` przechodzi, a `src/lib/card-summary.test.ts` oczekuje tytułu `Kto ma więcej`
- Playwright przechodzi dla `tests/e2e/money.spec.ts`, `tests/e2e/money-reprint.spec.ts`, `tests/e2e/how-it-works.spec.ts`, `tests/e2e/profile-summary.spec.ts`, `tests/e2e/phone-layout.spec.ts`, `tests/e2e/phone-toggle-align.spec.ts` i `tests/e2e/character-speaks.spec.ts`

#### Manual Verification:

- Katalog, „Jak to działa” (nagłówek rodzaju i akapit poziomów), link w oknie profilu oraz nagłówek `/money` i nazwa dostępna arkusza pokazują `Kto ma więcej`
- Kartka nadal mówi `Gdzie jest więcej pieniędzy?`, a w katalogu sąsiadami zostają „Krzyżówka matematyczna” i „Który nie pasuje”

**Implementation Note**: Po zielonych testach automatycznych zatrzymaj się na potwierdzenie ręczne, zanim zacznie się faza 2. W blokach faz są zwykłe wypunktowania. Odpowiadające im `- [ ]` są tylko w `## Progress`.

---

## Phase 2: Żywy kontrakt

### Overview

Aktualny opis produktu używa tej samej nazwy co ekran. Zdania historyczne w tych samych plikach zostają świadectwem starej pisowni.

### Changes Required:

#### 1. PRD, zdania żywe

**File**: `context/foundation/prd.md`

**Intent**: Każde żywe zdanie, które nazywa kartę, traci znak zapytania, żeby US, FR i logika biznesowa nie przywracały starej nazwy przy następnej pracy.

**Contract**: Zamieniane wystąpienia: kryterium sukcesu, US-22 (lista kart M-5), nagłówki i Given US-23 i US-24, odesłania do „Karta „Kto ma więcej?””, nagłówek sekcji FR, FR-033, FR-034, NFR granic M-5, nagłówek logiki biznesowej, zdanie o górnym przypięciu przy „Skopiuj obrazek”, akapit o poziomach, wiersz tabeli ustawień, non-goals M-5 (dwa zdania), „Pieniądze, ciąg dalszy”, otwarte pytanie 14. Zostają: akapit wejścia do zakresu z 2026-11-01 (cytuje dawną nazwę i dawny nagłówek logiki) oraz zamknięte pytanie 13.

#### 2. Glosariusz

**File**: `context/domain/glossary.md`

**Intent**: Wiersz pojęć karty nazywa ją tak jak ekran.

**Contract**: Jedno wystąpienie w wierszu „Kupka, nominał, waluta, remis, mylenie liczbą sztuk”. Znika `?`. Cudzysłów zamykający zostaje `"`.

#### 3. Roadmapa i plan testów

**File**: `context/foundation/roadmap.md`

**Intent**: Otwarte pytanie 6 nazywa kartę tak jak PRD, do którego odsyła.

**Contract**: Pytanie 6 w otwartych pytaniach. Historia M-5 i S-33 zostaje. Status pozycji roadmapy się nie zmienia: ta zmiana nie ma tam Change ID.

**File**: `context/foundation/test-plan.md`

**Intent**: Aktywne ryzyko 10 nazywa kartę tak jak US-23 i nagłówek logiki biznesowej.

**Contract**: Wiersz ryzyka 10, oba wystąpienia nazwy. Wiersz wyniku Strykera w §5a zostaje.

### Success Criteria:

#### Automated Verification:

- W żywych zdaniach PRD, w wierszu glosariusza, w pytaniu 6 roadmapy i w ryzyku 10 planu testów nie ma `Kto ma więcej?`, a ta pisownia zostaje w akapicie PRD z 2026-11-01, w zamkniętym pytaniu 13, w historii M-5 i S-33 oraz w §5a planu testów

#### Manual Verification:

- Nagłówek US-23 i wiersz glosariusza czytają się jako „Kto ma więcej”, a akapit wejścia karty do zakresu nadal ma znak zapytania

**Implementation Note**: Po sprawdzeniu wyszukiwaniem zatrzymaj się na przeczytanie US-23 i wiersza glosariusza. W blokach faz są zwykłe wypunktowania. Odpowiadające im `- [ ]` są tylko w `## Progress`.

---

## Testing Strategy

### Unit Tests:

- `src/lib/card-summary.test.ts` oczekuje nowego tytułu. Test kolejności katalogu zostaje: sortuje żywe tytuły i nie wpisuje tej nazwy.

### Integration Tests:

- Specy e2e z fazy 1 szukają obrazka, linku profilu i zdania na „Jak to działa” po nowej nazwie. `character-speaks.spec.ts` nadal oczekuje polecenia ze znakiem zapytania.

### Manual Testing Steps:

1. Otwórz katalog i sprawdź podpis karty oraz sąsiadów: „Krzyżówka matematyczna”, potem ta karta, potem „Który nie pasuje”.
2. Otwórz „Jak to działa” i sprawdź nagłówek rodzaju oraz akapit o poziomach.
3. Otwórz okno profilu i sprawdź link tej karty.
4. Otwórz `/money`, sprawdź nagłówek, wygeneruj kartę i sprawdź, że polecenie brzmi „Gdzie jest więcej pieniędzy?”.

## Performance Considerations

Brak. Zmiana nie rusza generatora, obrazków ani zapisu profilu.

## Migration Notes

Tytuł nie jest w `localStorage`. Zapisane profile pokażą nową nazwę przy następnym otwarciu, bez migracji pól `level`, `currency` i `colors`.

## References

- Zgłoszenie: https://github.com/drpc1/printo-kids/issues/383
- Brak `research.md` i `frame.md`. Ustalenia są z tego planu.
- Rejestr: `src/lib/cards.ts`
- Glosariusz, wiersz pojęć karty: `context/domain/glossary.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Nazwa w aplikacji

#### Automated

- [x] 1.1 `npm test` przechodzi, a `src/lib/card-summary.test.ts` oczekuje tytułu `Kto ma więcej` — a2e9d5e
- [x] 1.2 Playwright przechodzi dla `tests/e2e/money.spec.ts`, `tests/e2e/money-reprint.spec.ts`, `tests/e2e/how-it-works.spec.ts`, `tests/e2e/profile-summary.spec.ts`, `tests/e2e/phone-layout.spec.ts`, `tests/e2e/phone-toggle-align.spec.ts` i `tests/e2e/character-speaks.spec.ts` — a2e9d5e

#### Manual

- [x] 1.3 Katalog, „Jak to działa” (nagłówek rodzaju i akapit poziomów), link w oknie profilu oraz nagłówek `/money` i nazwa dostępna arkusza pokazują `Kto ma więcej` — a2e9d5e
- [x] 1.4 Kartka nadal mówi `Gdzie jest więcej pieniędzy?`, a w katalogu sąsiadami zostają „Krzyżówka matematyczna” i „Który nie pasuje” — a2e9d5e

### Phase 2: Żywy kontrakt

#### Automated

- [x] 2.1 W żywych zdaniach PRD, w wierszu glosariusza, w pytaniu 6 roadmapy i w ryzyku 10 planu testów nie ma `Kto ma więcej?`, a ta pisownia zostaje w akapicie PRD z 2026-11-01, w zamkniętym pytaniu 13, w historii M-5 i S-33 oraz w §5a planu testów

#### Manual

- [x] 2.2 Nagłówek US-23 i wiersz glosariusza czytają się jako „Kto ma więcej”, a akapit wejścia karty do zakresu nadal ma znak zapytania
