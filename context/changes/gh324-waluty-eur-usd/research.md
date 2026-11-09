---
date: 2026-11-09
researcher: Claude
git_commit: ecd5b886dd5f29ac97f871a7ac57465a49fbf1c5
branch: claude/gh324-waluty-5d7f26
repository: printo-kids
topic: "Waluty EUR i USD na karcie „Kto ma więcej?” (GitHub #324)"
tags: [research, codebase, money, card-settings, currency]
status: complete
last_updated: 2026-11-09
last_updated_by: Claude
---

# Research: waluty EUR i USD na karcie „Kto ma więcej?”

## Research Question

Jak dziś działa karta `pieniadze` (silnik, poziomy, rysowanie, obrazki, ustawienia, profil), co zmienia dodanie EUR i USD, i co z trzech otwartych decyzji z issue #324: (1) waluta jako ustawienie paska czy osobna karta, (2) nominały i sumy poziomów, (3) obrazki USD z portretami a wymóg „nie uchodzi za prawdziwy pieniądz”.

## Summary

Karta zakłada złotówki w czterech miejscach: lista nominałów i opisy poziomów (`src/lib/money/levels.ts:25-60`), podział moneta/banknot po wartości `>= 10` (`src/lib/money/layout.ts:3-6`), nazwa pliku obrazka `/money/${value}zl.png` (`src/lib/money/colors.ts:7-9`) i teksty „zł” w opisach. Reszta (reguły, generator, układ, silnik) liczy na liczbach całkowitych i jest od waluty niezależna. Dodanie waluty to więc nie nowy silnik, tylko parametr nominałów i wyglądu; osobna karta powielałaby całość i dotykałaby `CARD_KINDS`, `CardSettingsMap` i katalogu. Rekomendacja: pole `currency` w `MoneySettings` (pamiętane w profilu jak poziom i kolory), z zestawem nominałów per waluta i zmianą waluty układającą nową kartę, jak zmiana poziomu. Największe ryzyko to nie kod, tylko (a) USD: banknot 1 $ i moneta 1 $ mają tę samą wartość, a centy i część monet nie mają cyfry, (b) portrety na obrazkach USD, (c) wycięcie ~10–15 obrazków z dwóch JPG-ów.

## Detailed Findings

### Silnik, reguły, generator (niezależne od waluty)

- Kupka to `readonly number[]` wartości; `pileValue`, `compareRow`, `isMisleading`, `rowKey`, `pairKey` liczą na sumach i liczbie sztuk (`src/lib/money/rules.ts:24-62`). Dwie sztuki o tej samej wartości są nierozróżnialne w `pileKey` (posortowane wartości, `rules.ts:42`).
- `moneyCardProblems` sprawdza nominały względem `level.nominals` i sumę względem `level.maxSum` (`rules.ts:64-110`); generator losuje kupki z `level.nominals` (`src/lib/money/generate.ts:25-39`). Generator i reguły nie znają waluty, dostają `MoneyLevel`.
- `moneyEngine.generate(settings, random, previousKey)` bierze `moneyLevelById(settings.level)` (`src/lib/money/engine.ts:67`); `contentKey` to `settings.level` (`engine.ts:60`). Zmiana tego klucza decyduje, czy zmiana ustawienia układa nową kartę (poziom tak, kolory nie; `MoneyGenerator.tsx:45,60-65,94-101`).
- Testy `knownBad` budują kartę z `level: "sredni"` (`engine.ts:30-33`); testy poziomów/reguł/generatora/układu to cztery pliki `*.test.ts` w `src/lib/money/`.

### Miejsca zależne od złotówki (do uogólnienia)

- `MoneyLevel.nominals`, `description` („monety 1, 2 i 5 zł…”) i `maxSum` w złotych: `levels.ts:25-60`. Poziomy mają stałe `maxPieces` z `sheet.ts` (`MAX_PIECES`: 5/8/10).
- `pieceKind(value)`: moneta poniżej 10, banknot od 10 (`layout.ts:3-6`); `layoutPile` układa najpierw banknoty, potem monety (`layout.ts:28-58`). Dla EUR (monety 1, 2; banknoty od 5) i USD (moneta 1 $, banknoty od 1 $) ten podział przestaje działać.
- `moneyImage(value, colors)` zwraca `/money/${value}zl.png`, `moneyImagePaths()` to `[1,2,5,10,20]` (`colors.ts:7-13`); `MoneyGenerator.tsx:47-54` ładuje je wcześniej, `Pile` rysuje `<image>` skalowany do pudełka kawałka (`MoneyGenerator.tsx:247-265`), więc rozmiar monety/banknotu jest stały bez względu na obrazek.
- Opis na stronie „Jak to działa”: `CARD_KINDS` `pieniadze.description` (`src/lib/cards.ts:60-66`) — „nominał to liczba na każdej monecie i banknocie”.

### Ustawienia i profil

- `MoneySettings = { level, colors }` (`src/lib/card-settings.ts:39-42`), domyślne `{ level: DEFAULT_MONEY_LEVEL_ID, colors: false }` (`card-settings.ts:92`). `parseCard` przechodzi po polach domyślnych (`card-settings.ts:~165-172`), a `fieldValue` ma gałęzie dla `colors`, `category`, `size`, `symbols`, a resztę traktuje jako id poziomu (`card-settings.ts:~175-190`). Nowe pole `currency` wymaga własnej gałęzi (inaczej zostanie sprawdzone jako id poziomu i padnie do wartości domyślnej); zapisane wcześniej profile bez pola dostają wartość domyślną, więc migracja nie jest potrzebna.
- Podsumowanie profilu: `card-summary.ts:~97-103` — `extras` ma `["kolory"]` gdy kolory włączone; waluta wejdzie tam jako kolejny dodatek. Plakietka katalogu to sam poziom (`badgeOf`).
- Zapis profilu idzie przez `useCardSettings` → `updateProfiles` (`src/lib/child-profiles.ts`), bez zmian. Odłożone utwardzenia spójności między zakładkami nie dotyczą tej zmiany (pamięć projektu: deferred-profile-sync-hardening).

### Obrazki

- `public/money/` zawiera dziś 15 PNG: używane przez kartę to `1zl, 2zl, 5zl, 10zl, 20zl` (monety 310–356 px kwadrat, banknoty ok. 547–559 × 278 px, ok. 37–68 kB); nieużywane to `1gr…50gr`, `50zl`, `50zl-b`, `100zl`, `200zl` (`ls public/money`, nagłówki PNG). Odnośnik do nich w `src` jest tylko w `colors.ts`.
- Makiety: `context/ideas/waluty/makieta-eur.jpg` (≈373 kB) i `makieta-usd.jpg` (≈379 kB), obejrzane. EUR: banknoty 5, 10, 20, 50, 100, 200 (architektura, bez portretów, nominał jako duża cyfra), monety 2 €, 1 €, 50, 20 (dwa warianty), 10, 5, 2, 1 centa; każda moneta ma cyfrę. USD: banknoty 1, 5, 10, 20, 50, 100 (portrety, napis „THE UNITED STATES OF AMERICA”), monety 1 dolar (bez cyfry, napis „1 DOLLAR”), 50 centów („50 CENTS”), 25 centów („25 CENTS”), 25¢ i 10¢ z cyfrą, oraz trzy monety z samym portretem bez cyfry (od lewej w dolnym rzędzie: moneta z profilem w prawym górnym rogu, moneta z profilem Jeffersona i moneta z profilem Lincolna; z kontekstu 5¢ i 1¢/10¢ — tożsamości nie zakładam).
- Makiety to JPG z beżowym tłem i przerywanymi liniami cięcia; PNG w repo są przezroczyste (kolor typu 6 albo paleta 3). Wycięcie wymaga maski (prostokąt z zaokrągleniem dla banknotu, koło dla monety) i kwantyzacji do 256 kolorów; w repo nie ma `node_modules` ani Pythona w tej sesji, więc narzędzie do tego dobierze faza implementacji.

### Prawo i PRD (decyzja należy do użytkowniczki)

- PRD Open Questions 14: obrazek ma być stylizowany i nie uchodzić za prawdziwy pieniądz; kolorowe obrazki PLN użytkowniczki mają orła i profil władcy, ale bez zabezpieczeń, a prawa do nich ma ona.
- EUR z makiety: banknoty ze stylizowaną architekturą (nie kopia konkretnego wzoru), nominał, EURO/ΕΥΡΩ, gwiazdki UE; monety z mapą Europy. Ryzyko niskie, ale to wciąż rozpoznawalne wzory.
- USD z makiety: portrety (Waszyngton, Lincoln, Hamilton, Jackson, Grant, Franklin), napis „THE UNITED STATES OF AMERICA”, pieczęć Skarbu, na monetach portrety Kennedy’ego, Waszyngtona i Sacagawei. To najbliższe prawdziwym wzorom.
- Fakty, które stoją za „sprawdź przed użyciem” (z wiedzy ogólnej, nie z repo, do zweryfikowania u źródła): EBC i amerykańskie przepisy o reprodukcjach pieniędzy dopuszczają ilustracje pod warunkami (m.in. rozmiar znacznie mniejszy lub większy od oryginału, jedna strona, bez nabywania pozoru prawdziwego pieniądza). Banknot na karcie ma 18 × 9 mm (`sheet.ts` `noteWidth`/`noteHeight`), więc jest dużo mniejszy od prawdziwego, ale to nie jest porada prawna i nie rozstrzyga sprawy.
- Do uproszczenia bez prawnika: USD bez portretów (puste owale albo sama cyfra), bez „UNITED STATES OF AMERICA” i pieczęci, z samą cyfrą i „$”; EUR bez gwiazdek UE i napisu EURO. Tak zostają kolory i cyfra nominału, czyli to, czego karta potrzebuje.

## Co zmienia dodanie waluty

1. **Model**: `MoneySettings.currency: "pln" | "eur" | "usd"`, domyślnie `pln`; parser z gałęzią dla `currency`; testy `card-settings.test.ts`.
2. **Poziomy per waluta**: `moneyLevelById(id, currency)` (lub tabela poziomów per waluta) zamiast jednej listy; opisy poziomów z nazwą waluty; `MoneyLevel` dostaje `kinds`/rodzaj kawałka per nominał.
3. **Rodzaj kawałka** (`pieceKind`) zależny od waluty: PLN 1,2,5 monety, 10,20 banknoty; EUR 1,2 monety, 5+ banknoty; USD 1 moneta, 1 banknot (kolizja wartości) i banknoty 5+. Jeśli USD ma i monetę, i banknot 1 $, kupka nie może być listą samych wartości (`pileKey` zlewa je); prościej w USD wziąć tylko monetę 1 $ i banknoty 5, 10, 20.
4. **contentKey**: waluta zmienia nominały, więc musi wejść do `contentKey` (zmiana waluty układa nową kartę), chyba że wszystkie waluty mają ten sam zbiór wartości (wtedy to byłby przełącznik wyglądu jak Kolory). EUR nie ma monety 5, a USD nie ma 2, więc zbiory różnią się.
5. **Obrazki**: ścieżka `/money/<waluta>/<nominał>.png` zamiast `zl.png`; `moneyImagePaths(currency)`; preload tylko dla wybranej waluty. Bez kolorów rysunek jest czarnym konturem z cyfrą i dla każdej waluty wygląda tak samo (zmiana tylko znaku waluty, jeśli rodzic go chce).
6. **UI**: nowa kontrolka na pasku (wybór z 3 pozycji; istnieją `LevelChoice`, `CategoryChoice`, `SettingToggle` w `src/components`), więc test układu paska na telefonie `tests/e2e/money.spec.ts:~189` i `phone-layout.spec.ts` trzeba rozszerzyć.
7. **Teksty**: „zł” w opisach poziomów (`levels.ts`), `cards.ts` description, PRD US-23/US-24/Business Logic/FR-033–034, strona „Jak to działa”.
8. **Skrypty**: `scripts/build-thumbnails.mjs` i `scripts/money-mockup.mjs` używają `moneyLevelById(DEFAULT…)` i `layoutPile`; wywołania trzeba dostosować, miniatura zostaje w PLN.
9. **Brak groszy/centów w MVP** (PRD Non-Goals M-5): EUR używa wtedy monet 1 i 2 €, a USD tylko monety 1 $; monety 25¢/10¢/5¢ i centy EUR wymagałyby liczenia w jednostkach mniejszych (centach) w całym silniku (`pileValue`, sumy, `maxSum`), co jest osobną, większą zmianą.

## Opcje (waluta jako ustawienie vs osobna karta)

|               | Ustawienie `currency` w karcie | Osobna karta na walutę                                                             |
| ------------- | ------------------------------ | ---------------------------------------------------------------------------------- |
| Silnik/reguły | jeden, parametr nominałów      | trzy kopie albo wspólny rdzeń z trzema wpisami `CARD_KINDS`                        |
| Katalog       | bez zmian (jedna miniatura)    | +2 miniatury, katalog robi się zbyt gęsty                                          |
| Profil        | jedno pole w `pieniadze`       | nowe karty w `CardSettingsMap` i `CARD_SETTINGS_IDS` (konflikt z równoległym #265) |
| PRD           | zmiana wąska (US-23/24)        | nowe US-ki i FR-y                                                                  |
| Czytelność    | trzeci przełącznik na pasku    | prosta, ale rozdmuchuje listę                                                      |

Rekomendacja: ustawienie `currency`.

## Propozycja nominałów (do decyzji użytkowniczki)

Zasady z PRD zostają: poziom łatwy tylko monety, najwyżej 5 sztuk, sumy do 10/20/50, wielkość kawałka nie zdradza wartości, nominał to cyfra.

| Poziom | PLN (dziś)                 | EUR (propozycja)                            | USD (propozycja)                                  |
| ------ | -------------------------- | ------------------------------------------- | ------------------------------------------------- |
| łatwy  | 1, 2, 5 zł (monety), do 10 | 1, 2 € (monety), do 10                      | 1 $ (moneta) — za mało różnorodności, patrz niżej |
| średni | 1, 2, 5 zł, do 20          | 1, 2 € monety + 5 € banknot, do 20          | 1 $ moneta + 5 $ banknot, do 20                   |
| trudny | 1, 2, 5, 10, 20 zł, do 50  | 1, 2, 5, 10, 20 € (opcjonalnie 50 €), do 50 | 1 $, 5, 10, 20 $ banknoty, do 50                  |

Problem: USD łatwy z jednym nominałem to tylko liczenie sztuk (każda kupka to n identycznych monet), a EUR łatwy ma dwa nominały. Wybory: wpuścić na łatwym w USD banknot 5 $, albo rozszerzyć o centy w osobnym kamieniu.

## Code References

- `src/lib/money/levels.ts:25-60` — poziomy, nominały, opisy w zł
- `src/lib/money/layout.ts:3-6` — moneta/banknot po wartości >= 10
- `src/lib/money/colors.ts:7-13` — ścieżki obrazków `zl.png`
- `src/lib/money/engine.ts:57-72` — `contentKey` i `generate`
- `src/lib/money/rules.ts:24-110` — wartość, mylenie, problemy karty
- `src/lib/money/sheet.ts` — wymiary monety (11 mm) i banknotu (18 × 9 mm), `MAX_PIECES`
- `src/lib/card-settings.ts:39-42, 92, 165-190` — ustawienia, wartości domyślne, parser
- `src/lib/card-summary.ts:97-103` — podsumowanie profilu
- `src/components/MoneyGenerator.tsx:44-101, 230-265` — pasek, preload obrazków, rysowanie
- `src/lib/cards.ts:60-66` — opis rodzaju karty
- `tests/e2e/money.spec.ts`, `tests/e2e/card-settings.spec.ts:69-101`, `tests/e2e/phone-layout.spec.ts:122`

## Architecture Insights

- Karta to czysta funkcja (ustawienia, losowość, poprzedni klucz) → karta; `contentKey` mówi, które ustawienia zmieniają treść. Waluta jest ustawieniem treści (nominały), kolory ustawieniem dekoracji.
- Obrazki są skalowane do stałego pudełka, więc wielkość nie zdradza wartości; ten sam mechanizm obsłuży banknoty i monety innych walut o innych proporcjach (`preserveAspectRatio="xMidYMid meet"`).
- Równoległe #265 zmienia PRD, `CARD_KINDS` i `CardSettingsMap`; zmiana `MoneySettings` jest lokalna (jedno pole), więc konflikt będzie w PRD i najwyżej w `card-settings.ts`.

## Historical Context (from prior changes)

- `context/archive/2026-11-08-coins-colors/research.md` — poprzednia zmiana (kolory, #270). Uwaga: jej opis stanu kodu jest częściowo nieaktualny: pisze, że `MoneySettings` ma tylko `level` i że banknot ma 10 mm wysokości; obecny kod ma `colors` i `noteHeight` 9 mm (`sheet.ts`). Wzorzec „ustawienie na pasku pamiętane w profilu” (`SettingToggle`, `memory.remember`) jest nadal aktualny.
- `context/archive/2026-11-01-coins-who-has-more/` — pierwotny plan karty; groszy świadomie nie ma.
- PRD Open Questions 14 — wygląd pieniędzy, prawa do obrazków (użytkowniczka ma je do PLN).

## Related Research

- `context/archive/2026-11-08-coins-colors/research.md`

## Open Questions

1. Waluta jako ustawienie paska (rekomendacja) czy osobna karta.
2. Nominały i sumy poziomów dla EUR i USD (tabela wyżej); czy USD łatwy dostaje banknot 5 $; czy 50 € w trudnym.
3. Obrazki USD: czy użytkowniczka sprawdza prawa do reprodukcji, czy uprościć (bez portretów, bez napisu państwa i pieczęci); to samo, lżej, dla gwiazdek UE.
4. Czy menu waluty ma też zmieniać znak w poleceniu karty (dziś polecenie nie wymienia waluty).
5. Czy centy/grosze zostają poza zakresem (rekomendacja: tak).
