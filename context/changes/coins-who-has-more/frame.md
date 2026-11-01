# Frame Brief: S-33 Karta „Kto ma więcej?”

> Framing step before /10x-plan. Captures what is actually at issue, separated from what was assumed.

## Reported Observation

Karta „Kto ma więcej?” (roadmap S-33, GitHub drpc1/printo-kids#264, PRD US-23, US-24, FR-033, FR-034) nie istnieje. Issue zaleca makietę monety i banknotu czytelną na czarnym druku przed planem. Testy i skrypty mają na sztywno wpisaną liczbę sześciu kart.

## Initial Framing (preserved)

- **User's stated cause or approach**: S-33 to jedna zmiana: nowa karta plus zamiana wpisanej liczby kart na liczbę z katalogu. Makieta wchodzi przed planem.
- **User's proposed direction**: Jeden plan (`/10x-plan coins-who-has-more`), potem implementacja.
- **Pre-dispatch narrowing**: Nic nie drukowano (czytelność monety i banknotu na czarnym druku jest nieznana). Główne ryzyko: wygląd i czytelność kupek. Podział „karta” / „zamiana liczby kart w testach”: „nie wiem / nie rozdzieliłem(am)”.

## Dimension Map

1. **Wygląd i czytelność kupek** — nominał odczytany bez koloru, ile sztuk mieści się w polu rzędu na A4, trudny poziom do 50 zł. ← główne ryzyko według użytkownika
2. **Reguły generatora** — remis (najwyżej w jednym rzędzie), „liczba sztuk myli”, jedna odpowiedź na rząd.
3. **Wspólny kod i katalog** — `CARD_KINDS`, `CardSettingsMap`, podsumowanie profilu, plakietki, strona, miniatura, „Jak to działa”.
4. **Wpisana liczba kart w testach** ← ramowanie „jedna zmiana z kartą”.

## Hypothesis Investigation

| Hypothesis                                              | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                            | Verdict                                           |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Czytelność kupek jest nieznana i blokuje sens karty     | Nic nie drukowano (odpowiedź użytkownika). Wzorzec makiet istnieje: `scripts/sudoku-mockup.mjs` pisze plik do `context/changes/<id>/` z prawdziwego generatora i stałych strony, do wydruku 100% A4. Rząd ma ok. 190 mm szerokości na dwie kupki i „=”, wysokość ok. 45–50 mm na rząd przy pięciu rzędach. Pojemność wygląda na wykonalną, ale rozstrzyga ją tylko wydruk.                                                          | STRONG (ryzyko), wynik nieznany                   |
| Reguły generatora są trudne                             | Wzorzec gotowy: sekwencje liczą dwuznaczność względem całej listy reguł (`src/lib/sequence/rules.ts`, `generate.ts`). Reguły z PRD są jawne. Jedna luka: „remis najwyżej w jednym rzędzie” nie mówi, czy remis jest obowiązkowy.                                                                                                                                                                                                    | WEAK (ryzyko), jedna decyzja do podjęcia w planie |
| Wspólny kod jest ryzykiem                               | Dodanie karty dotyka: `cards.ts`, `card-settings.ts` (typ, `CARD_SETTINGS_IDS`, `DEFAULTS`, `levelIds`), `card-summary.ts` (`summaryParts`), strony `.astro`, `Generator.tsx` na `CardPage`/`useCardSettings`, miniatury (`build-thumbnails.mjs`), `astro.config.mjs`, `package.json` (lista testów). Wszystko jednym wzorcem sekwencji.                                                                                            | WEAK                                              |
| Liczba kart wpisana na sztywno jest większa niż w issue | Dodatkowe miejsce poza listą z issue: `src/lib/cards.test.ts:9-14` (kolejność tytułów, ostatni element `CARD_KINDS`). Poza tym `card-settings.test.ts:21`, `card-summary.test.ts:21`, `phone-layout.spec.ts:546` (seed ma 5 kart plus labirynt), `catalog.spec.ts:17` i `:471`, `smoke.mjs` (krok na stronę). Pliki `phone-toggle-align`, `character-speaks`, `phone-settings-rows` mają tabele per strona; to wiersze, nie liczba. | STRONG                                            |

## Narrowing Signals

- Użytkownik nie drukował monety i banknotu. Makieta jest więc bramką, której ta sesja nie zamknie sama: wydruk robi użytkownik.
- Główne ryzyko według użytkownika leży w rysunku kupek, nie w regułach ani we wspólnym kodzie.
- Podział „karta” / „testy” nie jest rozstrzygnięty przez użytkownika, więc zostaje domyślne ustawienie z issue (jedna zmiana).

## Cross-System Convention

W repozytorium karta wchodzi jednym wzorcem (strona, generator na `CardPage`, `cards.ts`, `card-settings.ts`, `card-summary.ts`, miniatura). Makiety przed zmianą żyją jako skrypt w `scripts/` i plik w folderze zmiany (`sudoku-mockup.mjs`, `nonogram-simple-mockup.mjs`). Rozwiązanie z issue (jedna zmiana, liczba z katalogu) zgadza się z konwencją.

## Reframed (or Confirmed) Problem Statement

> **The actual problem to plan around is**: czy kupka monet i banknotów jest czytelna na czarnym druku A4 przy pięciu rzędach, a dopiero potem wszystko inne; zamiana liczby kart w testach jest osobnym, mechanicznym kawałkiem, który nie zależy od makiety.

Pierwotne ramowanie w większości się utrzymało: jedna zmiana z kartą jest zgodna z issue i z konwencją. Dwa doprecyzowania: (1) makieta wymaga wydruku użytkownika, więc plan musi mieć ją jako pierwszą fazę z ręczną bramką, a fazy karty zależą od jej wyniku; (2) lista miejsc z wpisaną liczbą kart w issue jest niepełna (`cards.test.ts`), więc plan ma zlecić przejście po wszystkich, nie tylko po liście.

## Confidence

**MEDIUM** — dowody dla miejsc z liczbą kart są mocne (z kodu); wynik makiety jest nieznany do czasu wydruku, a decyzja o remisie obowiązkowym lub nie czeka na plan.

## What Changes for /10x-plan

Plan ma dwa niezależne tory w jednej zmianie: (A) faza makiety ze skryptem i ręczną bramką wydruku, od której zależy karta; (B) uogólnienie testów i skryptów na liczbę z katalogu, wykonalne od razu i niezależne od makiety. Do rozstrzygnięcia w planie: remis obowiązkowy czy najwyżej jeden, nazwa karty i adres strony.

## References

- Source files: `src/lib/cards.ts:10`, `src/lib/card-settings.ts:52-84`, `src/lib/card-summary.ts:27-99`, `src/components/SequenceGenerator.tsx`, `src/lib/cards.test.ts:9-14`, `src/lib/card-settings.test.ts:21`, `src/lib/card-summary.test.ts:21`, `tests/e2e/phone-layout.spec.ts:546`, `tests/e2e/catalog.spec.ts:17,471`, `scripts/smoke.mjs`, `scripts/sudoku-mockup.mjs`
- PRD: US-23, US-24, FR-033, FR-034, Business Logic „Karta „Kto ma więcej?””, Open Questions 14
- Investigation: czytanie kodu w sesji, bez sub-agentów (powierzchnia mała)
