# S-33 Karta „Kto ma więcej?” Implementation Plan

## Overview

Dokładamy dziesiąty rodzaj karty: „Kto ma więcej?” (GitHub drpc1/printo-kids#264, PRD US-23, US-24, FR-033, FR-034). Pięć rzędów po dwie kupki monet i banknotów oddzielone pustym polem na znak; dziecko wpisuje w polu między kupkami „<”, „>” lub „=”. Karta ma poziomy łatwy / średni / trudny, pamięć ustawień w profilu, miniaturę w katalogu i wpis w „Jak to działa”. Jako pierwsza z czterech kart M-5 zamienia wpisaną na sztywno liczbę kart w testach i skryptach na liczbę z katalogu, żeby S-34 do S-36 dokładały karty bez zmiany tych testów.

## Current State Analysis

Karta wchodzi jednym wzorcem, wyznaczonym przez sekwencje: `src/lib/cards.ts:10` (`CARD_KINDS`), `src/lib/card-settings.ts:52-84` (typ, `CARD_SETTINGS_IDS`, `DEFAULTS`, `levelIds`), `src/lib/card-summary.ts:51-99` (`summaryParts`), strona `src/pages/sequences.astro`, generator `src/components/SequenceGenerator.tsx` na `CardPage` / `useCardPage` / `useCardSettings`, moduł `src/lib/sequence/` (levels, generate, layout, sheet), miniatura z `scripts/build-thumbnails.mjs`, lista testów w `package.json` (`test`). Katalog (`src/components/CardCatalog.astro`) i „Jak to działa” (`src/pages/how-it-works.astro`) czytają `CARD_KINDS`, więc nowy wpis tam trafia sam.

Liczba kart wpisana na sztywno (stan 2026-11-01), pełna lista po przeglądzie kodu:

- `src/lib/card-settings.test.ts:21` (`CARD_SETTINGS_IDS.length, 6`)
- `src/lib/card-summary.ts:27` (komentarz „six cards”) i `src/lib/card-summary.test.ts:21` (tytuł testu)
- `src/lib/cards.test.ts:9-14` (kolejność tytułów i tytuł ostatniej karty) — **brakuje w issue**
- `tests/e2e/phone-layout.spec.ts:546` (`toHaveCount(6)` plakietek; seed ma 5 kart plus labirynt)
- `tests/e2e/catalog.spec.ts:17` (kolejność kart), `:471` (lista stron i tytułów) i komentarz `:2-3` (trzy miniatury)
- `tests/e2e/how-it-works.spec.ts:61` (tablica sześciu tytułów, `toHaveText(titles)`) — **brakuje w issue**
- `scripts/smoke.mjs` (jeden krok na stronę)

Frame: `frame.md` (pewność MEDIUM). Potwierdza jedną zmianę z kartą, ale makieta wymaga wydruku użytkownika, a lista miejsc z liczbą kart była niepełna.

## Desired End State

Na `/money` rodzic wybiera poziom, klika Generuj i dostaje kartę A4: polecenie z postacią w dymku, pięć rzędów, w każdym dwie kupki i puste pole na znak. Karta jest jedną stroną A4 z marginesem 10 mm, czarna, bez odpowiedzi. Profil pamięta poziom, katalog pokazuje plakietkę, „Jak to działa” opisuje kartę. `npm test`, `npm run lint`, `npx astro check`, `npm run build` i e2e są zielone, a dodanie kolejnej karty nie wymaga zmiany liczb w testach.

### Key Discoveries:

- Sekwencje liczą dwuznaczność względem całej listy reguł i zwracają `null`, gdy nie znajdą poprawnej karty; generator monet idzie tym samym kształtem: `generateSequenceCard(random, previousKey, level)` (`src/lib/sequence/generate.ts`).
- Wzorzec makiety: `scripts/sudoku-mockup.mjs` pisze plik do folderu zmiany z prawdziwego generatora i stałych strony; wydruk 100% A4.
- Stałe rysunku karty żyją w `*/sheet.ts` i czyta je zarówno strona, jak i skrypt miniatury, więc miniatura nie rozjeżdża się z kartą.
- Katalog ma `a[data-card-title]` i `[data-badge-for=id]` dla każdej karty, także ukrytych: testy e2e mogą brać karty z DOM, bez importu z `src`.
- Wysokość druku mierzy się osobno w Safari, Chrome iOS i Brave iOS (`context/foundation/lessons.md`).

## What We're NOT Doing

- Grosze, banknoty powyżej 20 zł, ceny i reszta, układanie dokładnej kwoty, ocena rysunku dziecka (PRD Non-Goals, M-5).
- Wierne kopie polskich monet i banknotów. Użytkowniczka sprawdziła (2026-11-01): wizerunek da się pokazać na karcie edukacyjnej, o ile reprodukcja nie może uchodzić za prawdziwy pieniądz. Rysunki są więc uproszczone i wyraźnie inne niż oryginał (moneta: koło, banknot: prostokąt z nominałem, bez zabezpieczeń i godeł); nie blokuje to planu.
- Przełącznik „Kolory” i kolorowe monety. Pomysł zgłoszony w trakcie planowania; PRD US-23 mówi o druku czarnym, a rysunek monety zależy od bramki w fazie 2, więc idzie jako osobny kawałek (proponowane osobne GitHub issue), po tej karcie. Plan nie zamyka na to drogi: ustawienia karty to obiekt, do którego dojdzie pole `colors`.
- Testy mutacyjne Stryker dla generatora; reguły pokrywają testy jednostkowe z ręcznym oraklem.
- Przekierowanie ze starej ścieżki: `/money` jest nowa.
- Zmiana kart S-34 do S-36 i strony „Jak to działa” poza opisem tej karty (S-37 poprawia zdania o poziomach).

## Implementation Approach

Pięć faz. Faza 1 (testy z liczbą z katalogu) jest mechaniczna i nie zależy od makiety, więc wchodzi pierwsza i może być scalona osobno. Faza 2 to makieta z ręczną bramką: użytkownik drukuje ją i potwierdza czytelność monety i banknotu oraz wartości startowe (liczba sztuk w kupce, rozmiary). Fazy 3–4 zaczynają się dopiero po bramce. Faza 5 aktualizuje PRD zgodnie z decyzjami; decyzje zapadły już przed fazą 2, więc fazę 5 można wykonać zaraz po bramce, żeby PRD nie było nieaktualne podczas implementacji.

Decyzje z rozmowy (2026-11-01):

- Id `pieniadze`, strona `/money`, tytuł „Kto ma więcej?”, w katalogu alfabetycznie między „Dyktando graficzne” a „Labirynt”. Poziomy `latwy` / `sredni` / `trudny`, domyślnie `sredni`. Ustawienia: tylko `level`.
- Poziomy (wartości startowe, potwierdza wydruk):
  - łatwy: monety 1, 2 i 5 zł mieszane (decyzja użytkowniczki 2026-11-01: nie jeden nominał w rzędzie), suma kupki do 10 zł, od 1 do 5 sztuk; żaden rząd „nie myli” (kupka z mniejszą liczbą sztuk nie jest warta więcej);
  - średni: monety 1, 2, 5 zł mieszane, suma kupki do 20 zł; dokładnie 2 z 5 rzędów „myli”;
  - trudny: 1, 2, 5, 10, 20 zł mieszane (monety i banknoty), suma kupki do 50 zł; co najmniej 3 z 5 rzędów „myli”.
- „Myli” = kupka z mniejszą liczbą sztuk ma większą wartość.
- Remis: na karcie zero lub jeden rząd z równymi kupkami; poza nim kupki różnią się wartością. Remis to kupki o równej wartości i różnym składzie (dwie identyczne kupki nie są remisem na żadnym poziomie).
- Zaznaczanie: dziecko wpisuje w polu między kupkami „<”, „>” (która kupka jest większa) lub „=” (równe); polecenie nie każe zakreślać, ale zakreślenie kupki też jest czytelną odpowiedzią; odpowiedź rzędu zostaje jedna: lewa, prawa albo równe. To odchylenie od PRD (zakreślanie kupki i „tyle samo”), więc faza 5 poprawia PRD.
- Jeden rząd nie powtarza się na karcie (para kupek, także z zamienionymi stronami), a kolejna karta ma inny `key` niż poprzednia.

## Faza 1: Liczba kart z katalogu w testach i skryptach

### Overview

Zamiana wpisanej liczby sześciu kart na wartości z katalogu, w każdym miejscu z listy wyżej. Nie dotyka produktu.

### Changes Required:

#### 1. Testy jednostkowe

**File**: `src/lib/card-settings.test.ts`, `src/lib/card-summary.test.ts`, `src/lib/cards.test.ts`, `src/lib/card-summary.ts` (komentarz)

**Intent**: Test pilnuje spójności katalogu, a nie liczby. `CARD_SETTINGS_IDS` ma te same id co `CARD_KINDS`, każde id ma domyślne ustawienia; kolejność katalogu to kopia tytułów posortowana `localeCompare(…, "pl")`; pierwszy w `CARD_KINDS` zostaje labirynt, wpis o ostatniej karcie znika. Komentarz „six cards” i tytuł testu mówią „every card”.

**Contract**: Brak wpisanych liczb 6 ani tytułów ostatniej karty; test zielony po dodaniu dowolnej karty z wpisem w `CARD_KINDS`, `CARD_SETTINGS_IDS` i `DEFAULTS`.

#### 2. Testy e2e

**File**: `tests/e2e/catalog.spec.ts`, `tests/e2e/phone-layout.spec.ts`, `tests/e2e/how-it-works.spec.ts`

**Intent**: Kolejność i lista stron biorą karty z katalogu (`a[data-card-title]`: tytuł i adres), a każda strona jest sprawdzana pętlą po nich. Kolejność z DOM jest porównywana z tytułami z tego samego DOM posortowanymi `localeCompare(…, "pl")`, nie z własną kopią. `how-it-works.spec.ts` bierze tytuły z katalogu na `/`. Komentarze o trzech miniaturach (`catalog.spec.ts:2-3`) mówią „karty katalogu”. Dodatkowo przegląd `card-settings.spec.ts` (tabela kart ok. linii 50): jeśli wylicza karty na sztywno, też z katalogu. W `phone-layout` oczekiwana liczba plakietek wynika ze stałej seedu (liczba kart w seedzie plus labirynt), a seed zostaje listą najszerszych plakietek, nie wszystkich kart; komentarz mówi to wprost.

**Contract**: Literał `6` i tablice tytułów znikają; nowa karta nie wymaga edycji obu plików.

#### 3. Sprawdzian HTTP

**File**: `scripts/smoke.mjs`

**Intent**: Dodatkowy krok pobiera `/`, wyciąga adresy kart z katalogu i dla każdego sprawdza `200` oraz zdanie „i wydrukuj”; istniejące kroki ze zdaniami zostają.

**Contract**: Skrypt zostaje bez zależności; wyciąganie adresów ma zabezpieczenie na pusty wynik (krok pada, gdy katalog nie zawiera żadnej karty).

### Success Criteria:

#### Automated Verification:

- Testy jednostkowe przechodzą: `npm test`
- Lint przechodzi: `npm run lint`
- Sprawdzenie typów przechodzi: `npx astro check`
- Żaden z plików z listy nie zawiera już wpisanej liczby sześciu kart ani tablicy tytułów: `rg -n "IDS.length, 6|toHaveCount\(6\)|six cards|\"Dyktando graficzne\", \"Labirynt\"" src tests scripts` nie zwraca nic
- E2E katalogu i plakietek przechodzi: `npx playwright test tests/e2e/catalog.spec.ts tests/e2e/phone-layout.spec.ts --project=chromium`
- E2E stron opisu przechodzi: `npx playwright test tests/e2e/how-it-works.spec.ts --project=chromium`

#### Manual Verification:

- Przegląd diffu: żaden test nie stracił sprawdzanego zachowania (kolejność alfabetyczna, brak nachodzenia plakietek na telefonie).

**Implementation Note**: Po fazie 1 i zielonych testach zatrzymaj się na potwierdzenie przed fazą 2.

---

## Faza 2: Makieta monety, banknotu i kupki (bramka)

### Overview

Rysunek karty z prawdziwych stałych i prawdziwego układu, do wydruku na A4 przy 100%. Faza kończy się decyzją użytkownika po wydruku; fazy 3–4 czekają na nią.

### Changes Required:

#### 1. Stałe rysunku i układ kupki

**File**: `src/lib/money/sheet.ts`, `src/lib/money/layout.ts`

**Intent**: Stałe rysunku w mm (strona, margines 10 mm, polecenie, wysokość rzędu, moneta: koło o stałej średnicy z grubą liczbą, banknot: prostokąt o stałym rozmiarze z grubą liczbą i wewnętrzną ramką, pole na znak, odstępy) oraz funkcja układu kupki w polu rzędu (zawijanie w wierszach, wysokość kupki). Do tego `MAX_PIECES` na poziom (wartości startowe: łatwy 5, średni 8, trudny 10; potwierdza wydruk), żeby bramka sprawdzała największą kupkę, jaką faza 3 może wylosować. Czyta je strona, `levels.ts` (faza 3) i skrypty makiety i miniatury.

**Contract**: `layoutPile(items, width)` zwraca pozycje i wysokość kupki; wszystkie monety mają tę samą wielkość, wszystkie banknoty tę samą (wielkość nie zdradza wartości); kupka o `MAX_PIECES` sztukach (ręcznie wpisana najgorsza kupka poziomu) mieści się w polu rzędu na każdym poziomie. Pole na znak ma co najmniej 12×12 mm (do potwierdzenia wydrukiem).

#### 2. Skrypt makiety

**File**: `scripts/money-mockup.mjs`

**Intent**: Pisze do `context/changes/coins-who-has-more/` plik SVG na poziom (łatwy, średni, trudny) z rzędami wybranymi stałym ziarnem, w tym najgorszy przypadek (największe kupki trudnego). Wzorzec: `scripts/sudoku-mockup.mjs`.

**Contract**: `node --experimental-strip-types scripts/money-mockup.mjs` tworzy trzy pliki do druku na A4 w 100%, czarno-białe. Ponieważ generator powstaje dopiero w fazie 3, makieta bierze rzędy z ręcznie wpisanego zestawu przykładów, a po fazie 3 przechodzi na prawdziwy generator.

#### 3. Test układu

**File**: `src/lib/money/layout.test.ts`, `package.json` (lista `test`)

**Intent**: Najgorsza kupka każdego poziomu mieści się w polu rzędu, a pięć rzędów z poleceniem mieści się w marginesie 10 mm.

**Contract**: Oracle ręczny, bez przepisywania wzoru układu.

### Success Criteria:

#### Automated Verification:

- Test układu przechodzi: `node --experimental-strip-types --test src/lib/money/layout.test.ts`
- Makieta powstaje: `node --experimental-strip-types scripts/money-mockup.mjs`
- Lint i typy przechodzą: `npm run lint` i `npx astro check`

#### Manual Verification:

- Użytkownik drukuje trzy pliki na A4 w 100% i potwierdza, że nominał monety i banknotu jest czytelny na czarnym druku
- Użytkownik potwierdza (albo poprawia) wartości startowe: `MAX_PIECES` na poziom, rozmiar monety i banknotu, wysokość rzędu, pole na znak (co najmniej 12×12 mm) dość duże do wpisania „<”, „>” lub „=”
- Bramka to wydruk z komputera na A4 w 100%; Safari, Chrome iOS i Brave iOS są mierzone osobno w fazie 4
- Użytkownik zapisuje decyzję: idziemy dalej / zmieniamy rysunek / karta odpada

**Implementation Note**: Po fazie 2 zatrzymaj się. Bez potwierdzenia wydruku nie zaczynaj fazy 3. Jeśli rysunek wymaga zmiany, popraw `sheet.ts` i `layout.ts` w tej fazie.

---

## Faza 3: Poziomy i generator z regułami

### Overview

Czysta logika bez UI: poziomy, kupki, wartość, reguły rzędu i karty, generator.

### Changes Required:

#### 1. Poziomy

**File**: `src/lib/money/levels.ts`

**Intent**: `MONEY_LEVELS` (`latwy`, `sredni`, `trudny`) z etykietą, `barLabel`, opisem (pół zdania o tym, co się zmienia, bez wieku), nominałami, limitem sumy kupki, zakresem sztuk (górna granica to `MAX_PIECES` z `sheet.ts`), liczbą rzędów (5) i liczbą rzędów „myli” (łatwy 0, średni dokładnie 2, trudny co najmniej 3). Domyślny `sredni`; `moneyLevelById`.

**Contract**: Kształt jak `NonogramSize` (`src/lib/nonogram/sizes.ts`): `id`, `label`, `barLabel`, `description`; brak `typicalAge`.

#### 2. Generator i reguły

**File**: `src/lib/money/generate.ts`, `src/lib/money/rules.ts`

**Intent**: `pileValue`, `pieceCount`, reguły rzędu (kupki różne albo remis, `misleads`), reguły karty (liczba rzędów „myli”, remis zero lub jeden, rząd bez powtórzeń także z zamienionymi stronami, odpowiedź każdego rzędu: `left` / `right` / `equal`) i `generateMoneyCard(random, previousKey, level)`, które zwraca `null` po wyczerpaniu prób. Lewa i prawa strona losowane.

**Contract**:

```ts
interface MoneyRow {
  left: readonly number[];
  right: readonly number[];
  answer: "left" | "right" | "equal";
}
interface MoneyCard {
  levelId: MoneyLevelId;
  rows: readonly MoneyRow[];
  key: string;
}
```

`key` nazywa wszystkie rzędy; dwie karty z jednym `key` pokazują to samo. Łatwy: monety 1, 2 i 5 zł mieszane w kupce, 1–5 sztuk, suma do 10 zł, żaden rząd nie myli.

Definicje, bez dwuznaczności: rząd „myli” tylko gdy kupka z ściśle mniejszą liczbą sztuk ma ściśle większą wartość. Równa liczba sztuk przy różnej wartości oraz remis przy różnej liczbie sztuk nie „mylą”. Odpowiedź `left` znaczy, że lewa kupka jest większa, czyli dziecko wpisuje „>” (kupka po lewej większa od prawej); `right` to „<”; `equal` to „=”. Każda kupka ma od 1 do `MAX_PIECES` sztuk.

#### 3. Testy

**File**: `src/lib/money/levels.test.ts`, `src/lib/money/rules.test.ts`, `src/lib/money/generate.test.ts`, `package.json` (lista `test`)

**Intent**: Tabela poziomów (ręczny oracle z tego planu); reguły rzędu i karty na ręcznych przypadkach brzegowych (remis, wartość równa przy różnej liczbie sztuk, dokładnie 2 „myli” na średnim, co najmniej 3 na trudnym, suma na granicy limitu); generator na wielu ziarnach: każda karta spełnia reguły swojego poziomu, odpowiedź zgadza się z niezależnym przeliczeniem, kolejne Generuj daje inny `key`, remis nie więcej niż w jednym rzędzie, czas jednej karty poniżej 5 s.

**Contract**: Nowe pliki testów dopisane do skryptu `test` w `package.json`.

### Success Criteria:

#### Automated Verification:

- Testy poziomów, reguł i generatora przechodzą: `node --experimental-strip-types --test src/lib/money/levels.test.ts src/lib/money/rules.test.ts src/lib/money/generate.test.ts`
- Całość przechodzi: `npm test`
- Lint i typy przechodzą: `npm run lint` i `npx astro check`
- Skrypt makiety bierze rzędy z prawdziwego generatora (zamiast ręcznego zestawu z fazy 2): `node --experimental-strip-types scripts/money-mockup.mjs`

#### Manual Verification:

- Przegląd 10 kart z każdego poziomu (wydruk skryptu makiety z kilkoma ziarnami) pokazuje, że łatwy ma małe kupki bez mylących rzędów, a średni i trudny mają mylące rzędy

**Implementation Note**: Po fazie 3 zatrzymaj się na potwierdzenie.

---

## Faza 4: Strona, katalog, profil, miniatura i testy e2e

### Overview

Karta widoczna dla rodzica: strona `/money`, wpis w katalogu, pamięć ustawień, podsumowanie profilu, miniatura, opis, testy.

### Changes Required:

#### 1. Katalog, ustawienia i podsumowanie

**File**: `src/lib/cards.ts`, `src/lib/card-settings.ts`, `src/lib/card-summary.ts`

**Intent**: Wpis `pieniadze` w `CARD_KINDS` (tytuł „Kto ma więcej?”, `/money`, miniatura, opis w 2–3 zdaniach: co dziecko robi i co jest na kartce); `MoneySettings { level }` w `CardSettingsMap`, `CARD_SETTINGS_IDS`, `DEFAULTS` i `levelIds`; `summaryParts` dla `pieniadze` (plakietka = etykieta poziomu; poziomy nazwane).

**Contract**: Brak zmian w kształcie zapisanych danych: karta, której profil nie używał, startuje z domyślnym poziomem.

#### 2. Strona i generator

**File**: `src/pages/money.astro`, `src/components/MoneyGenerator.tsx`

**Intent**: Strona na `GeneratorShell` z opisem „Wygeneruj kartę „Kto ma więcej?” i wydrukuj ją na kartce A4.”; generator na `CardPage` / `useCardPage` / `useCardSettings("pieniadze", …)` jak `SequenceGenerator`, z paskiem Postać i Poziom, bez kolorów. Karta SVG z poleceniem i postacią w dymku (`CharacterInstruction`), pięć rzędów, pole „=”. Zmiana poziomu przy pokazanej karcie generuje nową kartę; przełączenie profilu z innym poziomem też. Karta: `aria-label` „Kto ma więcej?”, klasy druku jak sekwencje (`print:h-[297mm]`, `print:w-[210mm]`).

**Contract**: Stałe z `sheet.ts`; polecenie „Gdzie jest więcej pieniędzy? Wskaż <, > lub =.” (bez słowa „zakreśl”, bo jest niejasne dla małych dzieci); brak odpowiedzi na kartce.

#### 3. Miniatura

**File**: `scripts/build-thumbnails.mjs`, `public/thumbnails/pieniadze.svg`

**Intent**: Miniatura z prawdziwego generatora i stałych strony (jak sekwencje); skrypt miniatur ją zapisuje.

**Contract**: Plik `public/thumbnails/pieniadze.svg` wskazany przez `CARD_KINDS`.

#### 4. Testy

**File**: `src/lib/sheet/print-contract.test.ts`, `tests/e2e/money.spec.ts`, `tests/e2e/character-speaks.spec.ts`, `tests/e2e/phone-settings-rows.spec.ts`, `tests/e2e/print-margins.spec.ts` (jeśli wylicza strony), `tests/e2e/profile-summary.spec.ts`

**Intent**: Kontrakt druku: SVG 210×297 mm z overflow hidden, strona pod `/money`, wspólna powłoka. E2E: Generuj pokazuje pięć rzędów po dwie kupki i puste pole na znak, zmiana poziomu generuje nową kartę, profil pamięta poziom i plakietka katalogu go pokazuje, postać stoi przy poleceniu, Generuj i Drukuj nie nachodzą na siebie na telefonie, karta mieści się na A4 z marginesem 10 mm. Wiersze dla `/money` tam, gdzie testy wyliczają strony kart.

**Contract**: Nowa strona dochodzi do sprawdzianu HTTP przez krok generyczny z fazy 1. `card-settings.test.ts` dostaje przypadki dla `pieniadze`: nieznany poziom wraca do domyślnego, brak karty zostaje brakiem, zapisany `latwy` się wczytuje; `tests/e2e/card-settings.spec.ts` dostaje wiersz `pieniadze` tam, gdzie wylicza karty.

### Success Criteria:

#### Automated Verification:

- Testy jednostkowe przechodzą: `npm test`
- Lint, typy i build przechodzą: `npm run lint`, `npx astro check`, `npm run build`
- E2E na wszystkich projektach Chromium przechodzą: `npx playwright test --project=chromium --project=phone-360 --project=pixel-7 --project=tablet-768` (z `E2E_PORT` na wolny port)
- Sprawdzian HTTP przechodzi na uruchomionym serwerze: `npm run smoke`

#### Manual Verification:

- Karta w przeglądarce: polecenie z postacią, pięć rzędów, kupki czytelne, pole na znak dość duże do wpisania „<”, „>” lub „=”
- Wydruk na jednej stronie A4 w Safari, Chrome iOS i Brave iOS osobno (mierzone, nie przenoszone z jednej przeglądarki)
- Katalog: miniatura, plakietka po wyborze profilu, okno profilu pokazuje „Kto ma więcej? łatwy …”

**Implementation Note**: Po fazie 4 zatrzymaj się na potwierdzenie ręczne.

---

## Faza 5: PRD zgodne z decyzjami

### Overview

PRD ma opisywać to, co zbudowano: trzy decyzje z rozmowy odbiegają od tekstu.

### Changes Required:

#### 1. PRD

**File**: `context/foundation/prd.md`

**Intent**: Success Criteria (punkt o karcie „Kto ma więcej?”), US-23 (w tym AC o zakreślaniu), US-24, Business Logic „Karta „Kto ma więcej?”” (polecenie, tabela poziomów, remis, „zakreśla”), FR-033 i FR-034: łatwy poziom = sumy do 10 zł, tylko monety, 1–5 sztuk; odpowiedź wpisywana jako „<”, „>” lub „=” w polu między kupkami (zamiast zakreślania kupki); remis zero lub jeden rząd; średni dokładnie 2 z 5 rzędów „myli”, trudny co najmniej 3 z 5. Open Questions 14: zapisać ustalenie o prawach (uproszczone rysunki, które nie uchodzą za prawdziwy pieniądz) i to, co potwierdził wydruk.

**Contract**: Zmieniają się tylko te zdania; numeracja US i FR zostaje.

### Success Criteria:

#### Automated Verification:

- Formatowanie przechodzi: `npx prettier --check context/foundation/prd.md`
- Żadne zdanie o tej karcie nie każe już zakreślać kupki: `rg -n "zakreśl" context/foundation/prd.md` pokazuje tylko inne karty

#### Manual Verification:

- Użytkownik przegląda zmiany w PRD i potwierdza, że opisują decyzje z 2026-11-01

---

## Testing Strategy

### Unit Tests:

- Wartość kupki, liczba sztuk, „myli”, remis; granice sum; łatwy bez mylących rzędów
- Generator na wielu ziarnach: reguły poziomu, odpowiedź zgodna z niezależnym przeliczeniem, inny `key` niż poprzednia karta, `null` obsłużone

### Integration Tests:

- E2E `money.spec.ts` i rozszerzone specy kart (katalog, profil, telefon, druk)

### Manual Testing Steps:

1. Wydruk makiety na A4 w 100% (faza 2)
2. Wydruk wygenerowanej karty w Safari, Chrome iOS i Brave iOS (faza 4)
3. Dziecko 6 lat na poziomie łatwym: czy radzi sobie z małymi kupkami mieszanych monet (Open Questions 14)

## Performance Considerations

Generowanie do 5 s (NFR); generator losuje i sprawdza reguły, więc limit prób i zwrot `null` jak w sekwencjach.

## Migration Notes

Brak migracji: karta bez zapisu startuje z domyślnym poziomem (`parseCardSettings` pomija brakującą kartę).

## References

- Frame: `context/changes/coins-who-has-more/frame.md`
- Issue: https://github.com/drpc1/printo-kids/issues/264
- Wzorzec: `src/components/SequenceGenerator.tsx`, `src/lib/sequence/generate.ts`, `scripts/sudoku-mockup.mjs`
- PRD: US-23, US-24, FR-033, FR-034, Business Logic „Karta „Kto ma więcej?””
- `context/foundation/lessons.md` (druk na iOS osobno w każdej przeglądarce)

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Liczba kart z katalogu w testach i skryptach

#### Automated

- [x] 1.1 Testy jednostkowe przechodzą: `npm test` — fd11071
- [x] 1.2 Lint przechodzi: `npm run lint` — fd11071
- [x] 1.3 Sprawdzenie typów przechodzi: `npx astro check` — fd11071
- [x] 1.4 Żaden z plików z listy nie zawiera już wpisanej liczby sześciu kart — fd11071
- [x] 1.5 E2E katalogu i plakietek przechodzi — fd11071
- [x] 1.6 E2E stron opisu przechodzi — fd11071

#### Manual

- [x] 1.7 Przegląd diffu: żaden test nie stracił sprawdzanego zachowania — fd11071

### Phase 2: Makieta monety, banknotu i kupki (bramka)

#### Automated

- [x] 2.1 Test układu przechodzi — d4d8e6b
- [x] 2.2 Makieta powstaje — d4d8e6b
- [x] 2.3 Lint i typy przechodzą — d4d8e6b

#### Manual

- [x] 2.4 Użytkownik drukuje trzy pliki i potwierdza czytelność nominału na czarnym druku — d4d8e6b
- [x] 2.5 Użytkownik potwierdza lub poprawia wartości startowe rysunku — d4d8e6b
- [x] 2.6 Użytkownik zapisuje decyzję: idziemy dalej / zmieniamy rysunek / karta odpada — d4d8e6b

### Phase 3: Poziomy i generator z regułami

#### Automated

- [x] 3.1 Testy poziomów, reguł i generatora przechodzą — 20825d7
- [x] 3.2 Całość przechodzi: `npm test` — 20825d7
- [x] 3.3 Lint i typy przechodzą — 20825d7
- [x] 3.4 Skrypt makiety bierze rzędy z prawdziwego generatora — 20825d7

#### Manual

- [x] 3.5 Przegląd 10 kart z każdego poziomu — 20825d7

### Phase 4: Strona, katalog, profil, miniatura i testy e2e

#### Automated

- [x] 4.1 Testy jednostkowe przechodzą: `npm test` — 518602f
- [x] 4.2 Lint, typy i build przechodzą — 518602f
- [x] 4.3 E2E na wszystkich projektach Chromium przechodzą — 518602f
- [x] 4.4 Sprawdzian HTTP przechodzi — 518602f

#### Manual

- [x] 4.5 Karta w przeglądarce: polecenie z postacią, pięć rzędów, kupki czytelne — 518602f
- [x] 4.6 Wydruk na jednej stronie A4 w Safari, Chrome iOS i Brave iOS osobno — 518602f
- [x] 4.7 Katalog: miniatura, plakietka po wyborze profilu, okno profilu — 518602f

### Phase 5: PRD zgodne z decyzjami

#### Automated

- [x] 5.1 Formatowanie PRD przechodzi — e2ada17
- [x] 5.2 Żadne zdanie o tej karcie nie każe już zakreślać kupki — e2ada17

#### Manual

- [x] 5.3 Użytkownik potwierdza zmiany w PRD — e2ada17
