# Umiejętności i filtr kart w katalogu (S-43) — plan implementacji

## Overview

Katalog na stronie głównej ma 16 rodzajów kart i rośnie. S-43 daje każdemu rodzajowi jedną albo dwie umiejętności („Co ćwiczy?”: Czas i pieniądze, Liczby, Logika, Rysowanie, Spostrzegawczość), pokazuje je szarym tekstem pod nazwą na miniaturze i dokłada nad katalogiem rząd chipów, którym rodzic jednym wyborem zawęża katalog do kart z wybraną umiejętnością. „Wszystkie” jest domyślne, a wybór nie jest zapamiętywany i nie zmienia stron generatorów ani profilu. Roadmapa M-7 S-43, GitHub drpc1/printo-kids#374; decyzje użytkowniczki z 2026-11-22 w `change.md` i w roadmapie (PR drpc1/printo-kids#457).

## Current State Analysis

Katalog to statyczny komponent Astro, który renderuje na serwerze listę miniatur z rejestru kart; plakietki poziomu z profilu dochodzą po załadowaniu krótkim skryptem w przeglądarce (bez Reacta), który odświeża je też przy `pageshow`, `storage` i zmianie profilu w tej zakładce. Rejestr `CARD_KINDS` ma 16 kart (w tym „Cienie” z S-47) z polami `id`, `title`, `href`, `thumbnail`, `description`; nie ma żadnej klasyfikacji kart. Słowo „tag” glosariusz zabrania przy plakietce i przy kategorii obiektów, a „kategoria” to już kategoria obiektów z paska symetrii, nonogramu, dyktanda i „Skopiuj obrazek”, dlatego nowe pojęcie nazywa się „umiejętność”. PRD (US-05, FR-014) opisuje katalog bez filtra.

## Desired End State

Rodzic otwiera stronę główną i nad miniaturami widzi „Co ćwiczy?” i chipy: Wszystkie, Czas i pieniądze, Liczby, Logika, Rysowanie, Spostrzegawczość (alfabetycznie po „Wszystkie”). Domyślnie wybrane jest „Wszystkie” i widać 16 kart. Kliknięcie chipa zostawia tylko karty z tą umiejętnością (np. „Czas i pieniądze”: Kto ma więcej i Zegar), w porządku alfabetycznym; karta z dwiema umiejętnościami pokazuje się pod obiema. Pod nazwą każdej miniatury stoi szara linijka z jej umiejętnościami („Logika · Rysowanie”). Każde wejście na stronę i każdy powrót na nią (także przyciskiem Wstecz z przywróceniem strony z pamięci przeglądarki) zaczyna od „Wszystkie”. Na telefonie (360 px) chipy zawijają się w dwa rzędy, nie nachodzą na nagłówek ani na róg profilu, a miniatury zostają w dwóch kolumnach. Plakietki poziomu działają na widocznych kartach jak dotąd. Weryfikacja: `npm test`, `npm run lint`, `npm run depcruise`, `npx astro check`, `npm run build`, Playwright na projektach Chromium, smoke, przegląd na stagingu na komputerze i telefonie.

### Key Discoveries:

- Rejestr: `src/lib/cards.ts:1-8` (`CardKind`), `CARD_KINDS` od :11 w kolejności polskich tytułów, `cardsInCatalogOrder` sortuje kopię; `CARD_KINDS` jest `as const satisfies readonly CardKind[]`, więc nowe pole w interfejsie bez wpisu w karcie to błąd kompilacji.
- Katalog: `src/components/CardCatalog.astro` — `<ul>` z `<li>` na kartę, link `a[data-card-title]`, plakietka `span[data-badge-for]` z `aria-hidden` nad miniaturą, tytuł w `<span>`; skrypt `showBadges` na dole i słuchacze `pageshow`, `storage`, `PROFILE_CHANGED_EVENT` (:62-70). Nazwa linku to tytuł albo „tytuł, plakietka” przez `aria-label`.
- `tests/e2e/catalog.spec.ts:16-26` bierze linki z `page.getByRole("list").getByRole("link")` — drugi element o roli `list` (np. chipy w `<ul>`) wywołałby błąd trybu ścisłego Playwrighta. Testy plakietek szukają linków po dokładnej nazwie („Labirynt, poz. 4”, `/^Sekwencje$/`), więc tekst umiejętności nie może wejść do nazwy linku.
- `scripts/smoke.mjs:101-115` zbiera adresy kart z `<a … data-card-title …>` — chipy nie mogą być linkami z tym atrybutem.
- Kontrolki: `src/components/ui/` ma `button.tsx` z eksportem `buttonVariants` (cva), którego Astro może użyć do klas bez wyspy React; innego gotowego przełącznika grupowego nie ma. Klasy łączyć `cn()` z `@/lib/utils`, kolory tylko z ról w `global.css`.
- `src/pages/how-it-works.astro` czyta `CARD_KINDS` (opisy) — bez zmian w tym planie (S-53).
- Glosariusz `context/domain/glossary.md:15` (Rodzaj karty), :100 (Plakietka, zakaz „tag”), :101 (Katalog), :72 (Kategoria obiektów, zakaz „tag”/„filtr”). Id karty „Labirynt liczbowy” to `liczby`, to samo słowo co id umiejętności „Liczby”.
- PRD: US-05 `context/foundation/prd.md:147`, FR-014 :794, Business Logic „Poziomy” :1334 i „Profil i zapamiętane ustawienia” :1340 (nowy podrozdział wejdzie przed „Poziomy”).
- Skrypt `test` w `package.json:12` wymienia pliki testów; `cards.test.ts` już w nim jest, więc nowy plik testu nie jest potrzebny.

## What We're NOT Doing

- Zapamiętywanie wyboru: ani w profilu, ani w ostatnich parametrach, ani w adresie strony (decyzja 2026-11-22: „Zawsze »Wszystkie«”, także po Wstecz).
- Wielokrotny wybór chipów, wyszukiwarka, licznik kart na chipie, sekcje z nagłówkami (odrzucone po makiecie).
- Umiejętności na stronie „Jak to działa”, w oknie profilu i na stronach generatorów (S-53, S-52).
- Zmiana nazw, miniatur, kolejności kart ani plakietek poziomu.
- Aktualizacja `context/foundation/test-plan.md` (S-51).

## Implementation Approach

Dane najpierw, interakcja potem. Faza 1 dokłada umiejętności do rejestru jako pole typowane po stałej liście `CARD_SKILLS` (kolejność chipów), przypina przypisanie z decyzji testem jednostkowym i pokazuje je szarym tekstem pod nazwą miniatury; to już widoczna, samodzielna zmiana, a dokumenty (glosariusz, PRD) dostają pojęcie „umiejętność”. Faza 2 dokłada chipy w tym samym komponencie Astro: serwer renderuje wszystkie karty i chipy (z „Wszystkie” wybranym), a mały skrypt obok `showBadges` przełącza `hidden` na `<li>` po atrybucie z umiejętnościami karty i `aria-pressed` na chipach. Bez JavaScriptu katalog pokazuje wszystkie karty, a chipy są ukryte, żeby nie było martwych przycisków.

## Critical Implementation Details

- **Powrót na stronę**: przy `pageshow` (także `persisted: true`, przywrócenie z pamięci przeglądarki) skrypt ustawia „Wszystkie” przed odświeżeniem plakietek; bez tego przeglądarka czasem przywraca stronę z wybranym chipem i zachowanie przestaje być jednolite z decyzją „Zawsze »Wszystkie«”.
- **Role w drzewie dostępności**: rząd chipów to `role="group"` z widoczną etykietą „Co ćwiczy?”, nie lista — inaczej istniejący test katalogu łapie dwie listy. Szary tekst umiejętności ma `aria-hidden`, jak plakietka, żeby nazwy linków zostały takie jak dziś.

## Phase 1: Umiejętności w rejestrze i na miniaturach

### Overview

Każdy rodzaj karty ma w rejestrze jedną albo dwie umiejętności z decyzji 2026-11-22, test przypina to przypisanie i reguły, miniatury pokazują umiejętności szarym tekstem, a glosariusz i PRD znają pojęcie „umiejętność”.

### Changes Required:

#### 1. Lista umiejętności i pole w rejestrze

**File**: `src/lib/cards.ts`

**Intent**: Dodać stałą listę umiejętności w kolejności chipów i pole `skills` przy każdej karcie, z przypisaniem dokładnie takim jak w decyzji, oraz pomocnik dający etykiety umiejętności karty w tej samej kolejności.

**Contract**: `CARD_SKILLS` — `readonly { id, label }[]` w kolejności: `czas-pieniadze` „Czas i pieniądze”, `liczby` „Liczby”, `logika` „Logika”, `rysowanie` „Rysowanie”, `spostrzegawczosc` „Spostrzegawczość” (alfabetycznie po polskich etykietach); typ `CardSkillId`. `CardKind.skills: readonly CardSkillId[]` (1–2 wpisy, w kolejności `CARD_SKILLS`). Przypisanie: Cienie `spostrzegawczosc`; Dyktando graficzne `rysowanie`; Kodowanie `logika`; Krzyżówka matematyczna `liczby`; Kto ma więcej `czas-pieniadze`, `liczby`; Który nie pasuje `logika`, `spostrzegawczosc`; Labirynt `logika`, `rysowanie`; Labirynt liczbowy `liczby`; Nonogram `logika`; Od najmniejszego `spostrzegawczosc`; Sekwencje `logika`; Skopiuj obrazek `rysowanie`, `spostrzegawczosc`; Sudoku `logika`; Symetria `rysowanie`, `spostrzegawczosc`; Szlaczki `rysowanie`; Zegar `czas-pieniadze`. Komentarz przy liście: zasada „umiejętność pasuje, gdy rodzic się nie zdziwi” i to, że nowa umiejętność wpada w swoje miejsce alfabetu. Pomocnik np. `cardSkillLabels(kind): string[]`.

#### 2. Testy przypisania i reguł

**File**: `src/lib/cards.test.ts`

**Intent**: Przypiąć decyzję użytkowniczki, żeby przypadkowa zmiana przypisania czerwieniła test, i pilnować reguł, które musi spełniać każda nowa karta.

**Contract**: test z pełną tabelą umiejętność → tytuły kart (pięć wierszy z decyzji); każda karta ma 1–2 różne umiejętności w kolejności `CARD_SKILLS`; każda umiejętność ma co najmniej 2 karty; `CARD_SKILLS` jest w polskiej kolejności alfabetycznej etykiet i ma unikalne id; `cardSkillLabels` zwraca etykiety w kolejności listy.

#### 3. Szary tekst pod nazwą miniatury

**File**: `src/components/CardCatalog.astro`

**Intent**: Pod nazwą karty pokazać małą, przygaszoną linijkę z jej umiejętnościami, rozdzielonymi „·”.

**Contract**: element pod `<span>` tytułu wewnątrz linku, `aria-hidden="true"`, kolor `text-muted-foreground`, mniejszy tekst niż tytuł; klasy przez `cn()` jeśli warunkowe; bez nowych kolorów. Nazwa linku i plakietka bez zmian.

#### 4. Glosariusz

**File**: `context/domain/glossary.md`

**Intent**: Dodać pojęcie „Umiejętność” i dopisać filtr do wiersza „Katalog”, żeby kolejne zmiany nazywały je tak samo.

**Contract**: nowy wiersz w sekcji „Karty” (obok „Rodzaj karty”): „Umiejętność” — co karta ćwiczy, 1–2 na rodzaj karty, pięć wartości; w kodzie `CARD_SKILLS`, `CardSkillId`, `CardKind.skills`; nie nazywać „tag”, „kategoria”, „filtr”; uwaga, że id `liczby` umiejętności to inny typ niż id karty `liczby` („Labirynt liczbowy”). Wiersz „Katalog” (:101): dopisać rząd chipów „Co ćwiczy?” z jednym wyborem, bez zapamiętywania.

#### 5. PRD

**File**: `context/foundation/prd.md`

**Intent**: Opisać umiejętności i filtr w wymaganiach, żeby PRD zgadzał się z produktem po obu fazach.

**Contract**: US-05 — nowe kryteria: miniatura ma pod nazwą umiejętności karty; nad katalogiem chipy „Co ćwiczy?” z jednym wyborem, „Wszystkie” domyślne, chip zostawia karty z tą umiejętnością, karta z dwiema pod obiema, wybór niezapamiętywany (nowe wejście i powrót Wstecz to „Wszystkie”), chipy zawijają się na telefonie (decyzja 2026-11-22, S-43). FR-014 — dopisać filtr po umiejętności. Business Logic — nowy podrozdział „Umiejętności kart” przed „Poziomy”, z tabelą przypisania i zasadą „rodzic się nie zdziwi”. Success Criteria (Secondary) — jedna linijka o zawężaniu katalogu umiejętnością.

### Success Criteria:

#### Automated Verification:

- Testy jednostkowe przechodzą, w tym nowe testy umiejętności: `npm test`
- Lint przechodzi: `npm run lint`
- Typy i strony Astro przechodzą: `npx astro check`
- Reguły zależności przechodzą: `npm run depcruise`
- Build przechodzi: `npm run build`
- Obecne e2e katalogu przechodzą bez zmian (nazwy linków i plakietki): `E2E_PORT=4399 npx playwright test tests/e2e/catalog.spec.ts`

#### Manual Verification:

- Na stronie głównej każda miniatura ma pod nazwą szarą linijkę z umiejętnościami zgodnymi z tabelą, czytelną na komputerze i na telefonie
- Glosariusz i PRD opisują „umiejętność” tak samo jak kod

**Implementation Note**: Po fazie i zielonej weryfikacji automatycznej zatrzymać się na ręczne potwierdzenie; przed PR fazy uruchomić `/10x-impl-review`.

---

## Phase 2: Chipy i filtr w katalogu

### Overview

Nad katalogiem stoi rząd chipów z jednym wyborem; chip zawęża katalog do kart z umiejętnością, „Wszystkie” przywraca całość, a każde wejście i powrót na stronę zaczyna od „Wszystkie”.

### Changes Required:

#### 1. Rząd chipów i filtr

**File**: `src/components/CardCatalog.astro`

**Intent**: Wyrenderować nad listą etykietę „Co ćwiczy?” i chipy (Wszystkie + `CARD_SKILLS` w ich kolejności), oznaczyć każdą kartę jej umiejętnościami i dodać skrypt, który przy kliknięciu chipa ukrywa karty bez tej umiejętności i przenosi zaznaczenie.

**Contract**: grupa `role="group"` z etykietą „Co ćwiczy?” (`aria-labelledby`), ukryta (`hidden`) do czasu uruchomienia skryptu; chip to `<button type="button" aria-pressed>` z `data-skill` (`wszystkie` albo `CardSkillId`), klasy z `buttonVariants` i `cn()`, stan wybrany przez wariant `aria-pressed:` (role kolorów z `global.css`), zawijanie (`flex-wrap`), cel dotyku co najmniej jak obecne linki (`min-h-11`). `<li>` karty dostaje `data-skills` z jej id umiejętności. Skrypt: `applySkill(id)` ustawia `hidden` na `<li>` i `aria-pressed` na chipach; „Wszystkie” pokazuje wszystkie karty; przy `pageshow` najpierw `applySkill("wszystkie")`, potem `showBadges`. Wybór nie trafia do `localStorage`, `sessionStorage` ani adresu. Chipy nie mają atrybutu `data-card-title` (smoke).

#### 2. Testy e2e filtra

**File**: `tests/e2e/catalog.spec.ts`

**Intent**: Sprawdzić filtr w przeglądarce: zawężanie, kartę z dwiema umiejętnościami, powrót do „Wszystkie” i układ na telefonie.

**Contract**: na `chromium`: domyślnie „Wszystkie” ma `aria-pressed="true"` i widać tyle linków co kart; „Czas i pieniądze” zostawia dokładnie „Kto ma więcej” i „Zegar” w tej kolejności, a „Liczby” także „Kto ma więcej”; „Wszystkie” przywraca wszystkie; po wejściu w kartę i „Wszystkie karty” oraz po `pageshow` z `persisted: true` wybrane jest „Wszystkie”; przy aktywnym profilu plakietka widocznej karty dalej jest w nazwie linku. Na `phone-360`: chipy nie nachodzą na nagłówek i róg profilu, wszystkie są widoczne bez przewijania w bok, miniatury w dwóch kolumnach.

### Success Criteria:

#### Automated Verification:

- Testy jednostkowe przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Typy i strony Astro przechodzą: `npx astro check`
- Reguły zależności przechodzą: `npm run depcruise`
- Build przechodzi: `npm run build`
- Smoke przechodzi na zbudowanym serwerze: `npm run smoke`
- E2E katalogu przechodzi na projektach Chromium, w tym nowe testy filtra: `E2E_PORT=4399 npx playwright test tests/e2e/catalog.spec.ts`

#### Manual Verification:

- Na stagingu na komputerze każdy chip zostawia karty z tabeli, a „Wszystkie” przywraca 16
- Na telefonie chipy zawijają się w dwa rzędy, łatwo je trafić palcem i nie zasłaniają rogu profilu ani miniatur
- Powrót przyciskiem Wstecz z karty i ponowne wejście na stronę główną zaczynają od „Wszystkie” (Safari na iPhonie i Chrome)
- Plakietki poziomu z profilu widać na kartach po zawężeniu

**Implementation Note**: Po fazie i zielonej weryfikacji automatycznej zatrzymać się na ręczne potwierdzenie; przed PR fazy uruchomić `/10x-impl-review`.

---

## Testing Strategy

### Unit Tests:

- Pełne przypisanie umiejętność → karty z decyzji (pięć wierszy).
- Każda karta ma 1–2 różne umiejętności w kolejności listy; każda umiejętność ma co najmniej 2 karty.
- `CARD_SKILLS` w polskiej kolejności alfabetycznej, unikalne id; etykiety karty w kolejności listy.

### Integration Tests:

- Playwright `catalog.spec.ts`: domyślne „Wszystkie”, zawężenie „Czas i pieniądze” i „Liczby”, karta z dwiema umiejętnościami, „Wszystkie” przywraca, powrót przez „Wszystkie karty” i `pageshow` z `persisted`, plakietka przy zawężeniu, układ na `phone-360`.
- Obecne testy katalogu (kolejność, nazwy linków z plakietką, tytuły stron) bez zmian.

### Manual Testing Steps:

1. Strona główna na komputerze: przejść wszystkie chipy i porównać karty z tabelą w PRD.
2. Telefon (360 px i iPhone): chipy w dwóch rzędach, kliknąć „Rysowanie”, otworzyć kartę, wrócić Wstecz — widać „Wszystkie”.
3. Wybrać profil z zapamiętanym poziomem, zawęzić katalog — plakietka zostaje.

## Performance Considerations

Brak: 16 elementów i przełączanie atrybutu `hidden` w przeglądarce, bez zapytań do serwera.

## Migration Notes

Brak: umiejętności są w kodzie, a nie w zapisanych danych; profile i ostatnie parametry się nie zmieniają.

## References

- Decyzje: `context/changes/card-tags-filter/change.md`, `context/foundation/roadmap.md` (S-43), PR drpc1/printo-kids#457, komentarz w drpc1/printo-kids#374
- Katalog i plakietki: `src/components/CardCatalog.astro`, `src/lib/catalog-badges.ts`
- Rejestr: `src/lib/cards.ts`, `src/lib/cards.test.ts`
- E2E: `tests/e2e/catalog.spec.ts`; smoke: `scripts/smoke.mjs:101-115`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Umiejętności w rejestrze i na miniaturach

#### Automated

- [x] 1.1 Testy jednostkowe przechodzą, w tym nowe testy umiejętności: `npm test` — 957ffd35
- [x] 1.2 Lint przechodzi: `npm run lint` — 957ffd35
- [x] 1.3 Typy i strony Astro przechodzą: `npx astro check` — 957ffd35
- [x] 1.4 Reguły zależności przechodzą: `npm run depcruise` — 957ffd35
- [x] 1.5 Build przechodzi: `npm run build` — 957ffd35
- [x] 1.6 Obecne e2e katalogu przechodzą bez zmian (nazwy linków i plakietki): `E2E_PORT=4399 npx playwright test tests/e2e/catalog.spec.ts` — 957ffd35

#### Manual

- [ ] 1.7 Na stronie głównej każda miniatura ma pod nazwą szarą linijkę z umiejętnościami zgodnymi z tabelą, czytelną na komputerze i na telefonie
- [ ] 1.8 Glosariusz i PRD opisują „umiejętność” tak samo jak kod

### Phase 2: Chipy i filtr w katalogu

#### Automated

- [ ] 2.1 Testy jednostkowe przechodzą: `npm test`
- [ ] 2.2 Lint przechodzi: `npm run lint`
- [ ] 2.3 Typy i strony Astro przechodzą: `npx astro check`
- [ ] 2.4 Reguły zależności przechodzą: `npm run depcruise`
- [ ] 2.5 Build przechodzi: `npm run build`
- [ ] 2.6 Smoke przechodzi na zbudowanym serwerze: `npm run smoke`
- [ ] 2.7 E2E katalogu przechodzi na projektach Chromium, w tym nowe testy filtra: `E2E_PORT=4399 npx playwright test tests/e2e/catalog.spec.ts`

#### Manual

- [ ] 2.8 Na stagingu na komputerze każdy chip zostawia karty z tabeli, a „Wszystkie” przywraca 16
- [ ] 2.9 Na telefonie chipy zawijają się w dwa rzędy, łatwo je trafić palcem i nie zasłaniają rogu profilu ani miniatur
- [ ] 2.10 Powrót przyciskiem Wstecz z karty i ponowne wejście na stronę główną zaczynają od „Wszystkie” (Safari na iPhonie i Chrome)
- [ ] 2.11 Plakietki poziomu z profilu widać na kartach po zawężeniu
