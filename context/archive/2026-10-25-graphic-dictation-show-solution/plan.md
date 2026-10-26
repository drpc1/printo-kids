# Dyktando graficzne — „Pokaż rozwiązanie” Implementation Plan

## Overview

Na stronie dyktanda graficznego rodzic dostaje przełącznik „Pokaż rozwiązanie”, taki jak na nonogramie. Włączenie dorysowuje na podglądzie kreskę zewnętrznego obrysu, którą dziecko ma narysować według strzałek. Wydruk zostaje pustą kratką. Nowa karta — z Generuj albo ze zmiany poziomu — zaczyna z wyłączonym przełącznikiem. Issue [#119](https://github.com/drpc1/printo-kids/issues/119).

## Current State Analysis

- `/dyktando` montuje `DictationGenerator` (`src/pages/dyktando.astro`). Po karcie pasek ma poziom, kategorię, Generuj i Drukuj (`src/components/DictationGenerator.tsx:124-148`). Przed pierwszą kartą przełącznika nie ma gdzie położyć: pasek z kartą w ogóle nie istnieje.
- `DictationSheet` rysuje zdanie, polecenia, kratkę, ramkę i kropkę startu. Komentarz przy komponencie mówi, że obrysu się nie rysuje (`DictationGenerator.tsx:164-269`). `card.outline` to wypełnione kratki sylwetki i służy do sprawdzeń (`src/lib/dictation/generate.ts:29`).
- Linia, którą dziecko prowadzi po strzałkach, jest już na karcie: `card.start` (wierzchołek kratki, `col`/`row`) i `card.commands`. `walkCommands` rozwija je do wierzchołków (`src/lib/dictation/outline.ts:243-260`). Dziury (okno, oczy, pestki) nie wchodzą w tę drogę (`outline.ts:41-42`, test „a ring traces like a filled square” w `outline.test.ts:66`).
- Nowa karta powstaje w `generateFor` (`DictationGenerator.tsx:52-59`). Wołają ją przycisk Generuj (`:62-66`) i zmiana poziomu, gdy karta już jest (`:69-73`). `null` wraca przed `setCard` i zostawia poprzednią kartę. Sama zmiana kategorii woła tylko `setCategoryId` (`:100`).
- Nonogram trzyma `showSolution` lokalnie, etykieta to „Pokaż rozwiązanie”, a udane Generuj gasi przełącznik (`src/components/NonogramGenerator.tsx:29`, `:62`, `:84-88`). Sylwetka jest grupą SVG z `print:hidden` i `data-solution` (`:192-208`). Test druku wymaga, żeby ta klasa siedziała na grupie (`src/lib/sheet/print-contract.test.ts:228-239`).
- Dyktando ma dziś dokładnie dwa `print:hidden`, oba na paskach sterowania (`print-contract.test.ts:196-200`). Helper łapie tylko `className={cn("…")}` z jednym stringiem (`:302-310`).
- PRD, US-17: karta ma pustą kratkę, a druk jest czarny i bez rysunku odpowiedzi (`context/foundation/prd.md:309-321`). Nonogram ma już osobne zdanie o przełączniku tylko na ekranie (`prd.md:293`). Dyktando takiego zdania nie ma. NFR zostawia oba druki bez odpowiedzi (`prd.md:458`).
- Miniatura katalogu rysuje dyktando ręcznie i kończy na kropce (`scripts/build-thumbnails.mjs`). Nie czyta komponentu strony.

## Desired End State

- Po wygenerowaniu karty na pasku, obok dotychczasowych kontrolek, jest „Pokaż rozwiązanie”. Startuje wyłączone. Przełączenie nie losuje nowej karty.
- Włączony przełącznik dorysowuje na podglądzie zamkniętą kreskę po wierzchołkach z `walkCommands`, na wierzchu linii kratki i ramki. Kropka startu zostaje na kresce. Polecenia, kratka i poziomy zostają.
- Wydruk i podgląd druku nie zawierają tej kreski, także przy zostawionym włączniku.
- Udane `generateFor` gasi przełącznik. Dotyczy to Generuj i zmiany poziomu, która podmienia kartę. Sama zmiana kategorii go nie gasi. Nieudane Generuj (`null`) zostawia przełącznik i poprzednią kartę.
- US-17 i akapit „Karta dyktanda graficznego” opisują ten przełącznik. Zdania o druku bez rysunku odpowiedzi zostają.

### Key Discoveries:

- Reset musi stać w `generateFor` po udanym losowaniu. Sam `handleGenerate` nie widzi zmiany poziomu (`DictationGenerator.tsx:69-73`).
- `walkCommands` bierze `{ x, y }`, a start karty ma `col` i `row`. Kropka na karcie liczy się jako `grid.x + card.start.col * card.cellSize` (`DictationGenerator.tsx:264-268`).
- Trzeci `print:hidden` w `DictationGenerator.tsx` wywraca `deepEqual` w `print-contract.test.ts:197-200`, więc test jedzie w tej samej fazie co klasa.
- `graphic-dictation-show-solution` nie występuje w `context/foundation/roadmap.md`.

## What We're NOT Doing

- Obrys na wydruku. Issue pisało o wydruku; w planowaniu zostało odrzucone na rzecz kontraktu nonogramu.
- Zamalowanie kratek z `card.outline` i rysowanie dziur.
- Osobna kartka z kluczem dla rodzica.
- Zapis przełącznika w profilu albo w ostatnich parametrach.
- Wspólny komponent przełącznika wyciągany z nonogramu.
- Zmiana strzałek, kratki, poziomów, kategorii albo miniatury katalogu.
- Nowa ścieżka liczenia obrysu. `walkCommands` już jest.

## Implementation Approach

Stan zostaje w `DictationGenerator`, obok `card`, na wzór `showSolution` w `NonogramGenerator`. Kontrolka używa istniejącego `Switch` i tego samego napisu. Kreska jest polilinią w `DictationSheet`, rysowaną tylko gdy prop jest włączony, w grupie ukrytej na druku. Grubość żyje przy pozostałych kreskach karty w `DICTATION_SHEET`, żeby strona i ewentualny późniejszy rysunek miały jedną liczbę. Miniatura tej stałej nie używa.

Reset jest jedną linijką po udanym `setGenerateFailed(false)` w `generateFor`, przed `setCard`. Oba wejścia, które podmieniają kartę, już tam wchodzą. Kategoria i nieudane losowanie nie wchodzą w tę gałąź.

## Critical Implementation Details

- **Kolejność stanu.** `setShowSolution(false)` stoi w `generateFor` dopiero po sprawdzeniu `next === null`. Wczesny `return` przy porażce zostawia włącznik. Przeniesienie resetu do samego `handleGenerate` gasi go przy przycisku i zostawia włączonego po zmianie poziomu, co łamie ustaloną regułę.
- **Hak testu druku.** Helper widzi wyłącznie `className={cn("jeden string")}`. Grupa rozwiązania ma mieć dokładnie `className={cn("print:hidden")}`, bez drugiej klasy w tym stringu. Inaczej lista w teście dyktanda jej nie złapie, a assertion na źródle grupy trzeba będzie pisać od nowa.
- **Współrzędne.** `walkCommands({ x: card.start.col, y: card.start.row }, card.commands)` daje wierzchołki w kratkach. Na stronie: `grid.x + vertex.x * card.cellSize`, `grid.y + vertex.y * card.cellSize`. Zamiana `x` z `col` przesuwa kreskę względem kropki.
- **Warstwy.** Polilinia idzie po ramce, a `<circle>` kropki zostaje ostatni, żeby start był wciąż widać na kresce.

## Phase 1: Przełącznik i kreska na podglądzie

### Overview

Rodzic włącza obrys na podglądzie i wyłącza go każdą nową kartą. Druk tej kreski nie bierze. Test kontraktu druku pilnuje grupy `print:hidden`.

### Changes Required:

#### 1. Stan, kontrolka i reset

**File**: `src/components/DictationGenerator.tsx`

**Intent**: Dodać lokalny przełącznik, który rodzic widzi dopiero przy karcie, i gasić go przy każdej udanej podmianie karty, żeby następny obrazek nie wchodził odsłonięty.

**Contract**: `showSolution` startuje od `false`. Etykieta i `Switch` jak w `NonogramGenerator.tsx:84-88`: widoczny tekst „Pokaż rozwiązanie”, klasy `text-muted-foreground flex items-center gap-2 text-base`. Kontrolka stoi w istniejącym pasku `print:hidden` po karcie (`DictationGenerator.tsx:125-147`), nie w pasku przed pierwszą kartą. `onCheckedChange` tylko zmienia stan. W `generateFor`, po gałęzi `next === null`, udana karta woła `setShowSolution(false)` i dopiero potem `setCard`. `handleLevelSelect` i `setCategoryId` zostają przy swoich dzisiejszych wywołaniach. `DictationSheet` dostaje `showSolution`.

#### 2. Kreska obrysu

**File**: `src/components/DictationGenerator.tsx`, `src/lib/dictation/sheet.ts`

**Intent**: Pokazać rodzicowi na ekranie tę samą zamkniętą drogę, którą dziecko rysuje po strzałkach, na tyle grubą, żeby było ją widać na liniach kratki.

**Contract**: W `DICTATION_SHEET` dochodzi `solutionStroke: 1.2` (ramka ma `frameStroke: 0.65`, kratka `gridStroke: 0.3`). Przy `showSolution` arkusz rysuje jedną polilinię z `walkCommands({ x: card.start.col, y: card.start.row }, card.commands)`. Punkty: `grid.x + vertex.x * card.cellSize`, `grid.y + vertex.y * card.cellSize`. Grupa:

```tsx
<g
  className={cn("print:hidden")}
  fill="none"
  stroke="var(--foreground)"
  strokeWidth={DICTATION_SHEET.solutionStroke}
  strokeLinecap="round"
  strokeLinejoin="round"
  data-solution
>
```

Polilinia jest po `<rect>` ramki i przed `<circle>` kropki. Komentarz „never the outline” przy `DictationSheet` opisuje teraz kreskę tylko na ekranie. Miniatura w `scripts/build-thumbnails.mjs` zostaje przy kropce, bez tej grupy.

#### 3. Kontrakt druku

**File**: `src/lib/sheet/print-contract.test.ts`

**Intent**: Przypiąć ukrycie kreski do grupy rozwiązania, tak jak przy nonogramie, żeby włączony przełącznik nie trafiał na papier.

**Contract**: Test „print hides the dictation controls” (`:196-200`) oczekuje trzech stringów, w kolejności źródła:

- `flex w-full flex-col gap-3 print:hidden`
- `flex flex-col items-center gap-6 print:hidden`
- `print:hidden`

Osobna asercja wymaga w `DictationGenerator.tsx` obu fragmentów `className={cn("print:hidden")}` i `data-solution`. Nie wymagaj jednego ciągu `<g className=… data-solution>`: przy `printWidth` 120 Prettier łamie otwarcie `<g` na kilka linii, więc jednoliniowy `includes` z nonogramu (`:235-238`) by nie przeszedł. `classNamesContaining` i tak złapie samo `print:hidden`, bo `cn("print:hidden")` mieści się w jednej linii.

### Success Criteria:

#### Automated Verification:

- `npm test` przechodzi, w tym zaktualizowany test dyktanda w `src/lib/sheet/print-contract.test.ts`
- `npm run lint` przechodzi

#### Manual Verification:

- Po Generuj przełącznik jest wyłączony, a karta ma polecenia, pustą kratkę i kropkę
- Włączenie dorysowuje zamkniętą kreskę po liniach kratki; polecenia zostają, a nowa karta się nie losuje
- Podgląd druku przy włączonym przełączniku nie pokazuje kreski
- Kolejne Generuj wyłącza przełącznik
- Zmiana poziomu przy widocznej karcie wyłącza przełącznik na nowej karcie
- Sama zmiana kategorii zostawia przełącznik i bieżącą kartę aż do Generuj

**Implementation Note**: Po zielonych testach tej fazy zatrzymaj się na ręczne potwierdzenie kryteriów z przeglądarki, zanim ruszy faza 2.

---

## Phase 2: Zdanie w PRD

### Overview

Zapisana reguła produktu mówi to samo co przełącznik: obrys na ekranie, druk bez kreski, nowa karta startuje wyłączona.

### Changes Required:

#### 1. US-17 i karta dyktanda

**File**: `context/foundation/prd.md`

**Intent**: Dopisać zachowanie przełącznika tam, gdzie nonogram ma już swoje zdanie, bez ruszania reguły pustego druku.

**Contract**: W kryteriach US-17 (`prd.md:315-323`) dochodzi jedno kryterium:

> Rodzic może włączyć „Pokaż rozwiązanie”, żeby zobaczyć na ekranie kreskę zewnętrznego obrysu. Domyślnie wyłączone; przełączenie zostawia tę samą kartę. Udane Generuj oraz zmiana poziomu, która układa nową kartę, wyłączają przełącznik. Sama zmiana kategorii go nie wyłącza. Nieudane Generuj zostawia przełącznik i poprzednią kartę. Wydruk nigdy nie pokazuje obrysu (decyzja 2026-10-25).

Akapit „Karta dyktanda graficznego” (`prd.md:594-606`) dostaje to samo zdanie o ekranie i o druku. Zostają: „Druk jest czarny i bez rysunku odpowiedzi.” w US-17 oraz NFR o czarnym druku bez odpowiedzi (`prd.md:458`). Then US-17 o pustej kratce zostaje opisem karty, którą rodzic dostaje do druku.

### Success Criteria:

#### Manual Verification:

- US-17 i akapit „Karta dyktanda graficznego” zawierają zdanie o przełączniku, o gaśnięciu przy Generuj i zmianie poziomu, o zostawieniu stanu przy samej kategorii i przy nieudanym Generuj, oraz o wydruku bez obrysu
- US-17 nadal mówi, że druk jest czarny i bez rysunku odpowiedzi, a NFR dyktanda zostaje przy czarnym druku bez odpowiedzi

**Implementation Note**: Faza jest tylko w `prd.md`. Po niej nie ma osobnego kroku w kodzie.

---

## Testing Strategy

### Unit Tests:

- Istniejące testy `walkCommands` zostają dowodem, że wierzchołki wracają do startu. Nowego testu geometrii nie dodajemy.
- `print-contract.test.ts` sprawdza listę `print:hidden` i atrybut `data-solution` na grupie.

### Integration Tests:

- Brak nowego testu przeglądarkowego. Strona jest wyspą `client:only`, a smoke nie widzi przełącznika.

### Manual Testing Steps:

1. Otwórz `/dyktando`, wygeneruj kartę i sprawdź, że przełącznik jest wyłączony.
2. Włącz go i porównaj kreskę ze strzałkami: droga ma dojść z powrotem do kropki, także na poziomie 5 lat i 7 lat.
3. Zostaw włącznik i otwórz podgląd druku. Kreski obrysu nie ma, polecenia i kratka są.
4. Wygeneruj jeszcze raz i zmień poziom. Po obu czynnościach przełącznik jest wyłączony.
5. Włącz przełącznik i zmień samą kategorię. Karta i włącznik zostają, dopóki nie klikniesz Generuj.

## Performance Considerations

Jedna polilinia z wierzchołków, które karta już trzyma. Bez nowego liczenia obrysu i bez kosztu przy wyłączonym przełączniku.

## Migration Notes

Stan żyje w komponencie strony. Nic w profilu ani w ostatnich parametrach nie wymaga migracji.

## References

- Issue: https://github.com/drpc1/printo-kids/issues/119
- Wzór przełącznika i grupy druku: `src/components/NonogramGenerator.tsx:29`, `:62`, `:84-88`, `:192-208`
- Test wzorca: `src/lib/sheet/print-contract.test.ts:228-239`
- Droga obrysu: `src/lib/dictation/outline.ts:243-260`
- Zdanie nonogramu w PRD: `context/foundation/prd.md:293`
- Wcześniejsza reguła „bez rysunku odpowiedzi”: `context/archive/2026-10-25-graphic-dictation-first-printable/plan.md`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Przełącznik i kreska na podglądzie

#### Automated

- [x] 1.1 `npm test` przechodzi, w tym zaktualizowany test dyktanda w `src/lib/sheet/print-contract.test.ts` — fb085e2
- [x] 1.2 `npm run lint` przechodzi — fb085e2

#### Manual

- [x] 1.3 Po Generuj przełącznik jest wyłączony, a karta ma polecenia, pustą kratkę i kropkę — fb085e2
- [x] 1.4 Włączenie dorysowuje zamkniętą kreskę po liniach kratki; polecenia zostają, a nowa karta się nie losuje — fb085e2
- [x] 1.5 Podgląd druku przy włączonym przełączniku nie pokazuje kreski — fb085e2
- [x] 1.6 Kolejne Generuj wyłącza przełącznik — fb085e2
- [x] 1.7 Zmiana poziomu przy widocznej karcie wyłącza przełącznik na nowej karcie — fb085e2
- [x] 1.8 Sama zmiana kategorii zostawia przełącznik i bieżącą kartę aż do Generuj — fb085e2

### Phase 2: Zdanie w PRD

#### Manual

- [x] 2.1 US-17 i akapit „Karta dyktanda graficznego” zawierają zdanie o przełączniku, o gaśnięciu przy Generuj i zmianie poziomu, o zostawieniu stanu przy samej kategorii i przy nieudanym Generuj, oraz o wydruku bez obrysu — 45902bd
- [x] 2.2 US-17 nadal mówi, że druk jest czarny i bez rysunku odpowiedzi, a NFR dyktanda zostaje przy czarnym druku bez odpowiedzi — 45902bd
