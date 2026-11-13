---
project: PrintoKids
version: 1
status: draft
created: 2026-09-27
updated: 2026-11-13
prd_version: 6
main_goal: speed
top_blocker: decisions
milestone_id: seasonal-cards-and-catalog-filter
milestone_seq: 6
milestone_status: open
---

# Roadmap: PrintoKids

> Derived from the user's description of M-6 (anchors `MS-01`…`MS-04` below) + `context/foundation/prd.md` (v6) as the contract for inherited behavior + codebase baseline.
> Edit-in-place; archive when superseded.
> Slices below are listed in dependency order. The "At a glance" table is the index.
> M-6 is deliberately under-specified: the user decides it piece by piece. Slices with `blocked` status are placeholders whose first Unknown is "which one?"; they become `ready` as decisions land.

## Milestone

**M-6: Sezonowe postacie i obiekty, filtr kart w katalogu i kolejne karty** — Status: open

- **Intent:** Katalog ma dziesięć rodzajów kart i zaczyna być w nim trudno znaleźć właściwą. M-6 daje rodzicowi pierwszy sezon (Boże Narodzenie) w postaci świątecznych obiektów na kartach z szablonów i świątecznych postaci przy poleceniu, nowe rodzaje kart (krzyżówkę matematyczną, która ma powstać szybko, i dwa lub trzy rodzaje do ustalenia) oraz tagi i filtr w katalogu, które obejmą wszystkie karty naraz. Kolejność wynika z terminu: świąteczna zawartość ma zdążyć na wydruk przed grudniem.
- **Source materials:** opis użytkownika z 2026-11-13 (anchors niżej); odziedziczone zasady z `context/foundation/prd.md` (v6).
- **Done when:** every F-NN and S-NN in „At a glance” is `done`. Sekcje „Po tym kamieniu” i „Parked” nie wliczają się.
- **User description (verbatim):** „zaczynamy definiować nowy milestone. Chcę żeby zawierał 3-4 karty, do tego sezonowe postaci i obiekty na kartach gdzie ma to sens. I chyba czas pomyśleć o jakimś filtrowaniu/tagowaniu kart, bo zaczyna być ich dużo. Nic nie jest na ten moment wyraźnie określone. wszystko trzeba ustalić kawałek po kawałku”. Doprecyzowania z rozmowy: jedna karta do zrobienia szybko to krzyżówka matematyczna; pierwszy sezon to Boże Narodzenie; filtr to tagi na kartach i filtr na stronie głównej, wchodzą po kartach i przed „Jak to działa”; rodzaje pozostałych nowych kart zostają do ustalenia; cel sekwencjonowania to szybkość (święta przed grudniem); pierwszy kawałek to świąteczne obiekty; przed końcem kamienia Stryker dla nowych kart i aktualizacja test-plan.md.
- **Scope anchors:**
  - MS-01: 3–4 nowe rodzaje kart: krzyżówka matematyczna (ustalona, ma iść szybko) i pozostałe do ustalenia (kandydaci z „Po tym kamieniu”).
  - MS-02: Sezonowe postacie wybierane przy poleceniu na kartach; pierwszy sezon Boże Narodzenie.
  - MS-03: Sezonowe obiekty na kartach, na których obiekty mają sens (katalog szablonów: symetria, nonogram, dyktando, „Skopiuj obrazek”); pierwszy sezon Boże Narodzenie.
  - MS-04: Tagowanie i filtrowanie rodzajów kart w katalogu na stronie głównej.
  - Dziedziczone bez zmian: FR-014 (katalog), FR-017 (pamięć paska), FR-028–FR-029 (katalog obiektów i kategorie), FR-012 (katalog postaci), FR-030 (postać przy poleceniu), FR-031, US-05, US-08, US-19–US-22.

## Vision recap

Rodzic przedszkolaka wyczerpał darmowe karty o właściwej skali trudności, a dziecko wciąż chce kolejną. Brakuje sposobu, żeby wygenerować nową kartę na właściwym poziomie, gdy skończy się dopasowana gotowa biblioteka. Po pięciu kamieniach jest dziesięć rodzajów kart, poziomy bez wieku i profil pamiętający pasek każdej karty; M-6 dokłada świeżość (sezon i nowe karty) oraz sposób, żeby przy tylu kartach nadal szybko trafić na właściwą.

## North star

**S-38: Rodzic wybiera świąteczne obiekty na kartach z szablonów i drukuje kartę z bombką, choinką albo Mikołajem** — to najmniejszy kompletny kawałek, którego dowiezienie pokazuje, że sezonowa zawartość działa na istniejących kartach bez nowego rodzaju karty; stoi pierwszy, bo cel to szybkość, a święta mają zdążyć przed grudniem.

> Gwiazda przewodnia (north star) — tu: najmniejszy kompletny kawałek, którego dowiezienie pokazuje, że kamień ma sens; stoi możliwie wcześnie, bo reszta ma sens tylko wtedy, gdy ten działa.

## At a glance

| ID   | Change ID            | Outcome (user can …)                                                                                                                                                       | Prerequisites                            | PRD refs                                    | Status   |
| ---- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------- | -------- |
| S-38 | christmas-objects    | Rodzic wybiera świąteczne obiekty na kartach symetrii, nonogramu, dyktanda i „Skopiuj obrazek”, generuje kartę i drukuje ją jako jedną stronę A4                           | —                                        | MS-03, FR-028, FR-029, US-19, US-20         | ready    |
| S-39 | christmas-characters | Rodzic wybiera świąteczną postać (np. Mikołaj, renifer) przy poleceniu na każdej karcie i w profilu jako ulubioną                                                          | —                                        | MS-02, FR-012, FR-030, US-03, US-21         | blocked  |
| S-40 | math-crossword-card  | Rodzic otwiera z katalogu „Krzyżówkę matematyczną”, wybiera poziom, generuje kartę A4 z działaniami w krzyżującej się siatce, podgląda ją i drukuje; profil pamięta pasek   | —                                        | MS-01, FR-014, FR-017, FR-030, US-05, US-08 | ready    |
| S-41 | new-card-2           | Rodzic otwiera z katalogu kolejną nową kartę (rodzaj do ustalenia), generuje ją z poziomem i drukuje; profil pamięta pasek                                                 | —                                        | MS-01, FR-014, FR-017, FR-030, US-05, US-08 | blocked  |
| S-42 | new-card-3           | Rodzic otwiera z katalogu jeszcze jedną nową kartę (rodzaj do ustalenia), generuje ją z poziomem i drukuje; profil pamięta pasek                                           | —                                        | MS-01, FR-014, FR-017, FR-030, US-05, US-08 | blocked  |
| S-43 | card-tags-filter     | Rodzic zawęża katalog na stronie głównej do kart z wybranym tagiem i szybciej znajduje właściwy rodzaj karty                                                               | S-40, S-41, S-42                         | MS-04, FR-014, US-05                        | proposed |
| S-44 | how-it-works-m6      | Rodzic otwiera „Jak to działa” i widzi poprawny opis nowych kart, sezonowych postaci i obiektów oraz filtra w katalogu                                                     | S-38, S-39, S-40, S-41, S-42, S-43       | MS-01, MS-02, MS-03, MS-04, US-22, FR-031   | proposed |
| S-45 | stryker-m6-cards     | Rodzic dostaje nowe karty i logikę M-6 sprawdzone mutacjami Strykera na zakresach z ryzykiem (solver krzyżówki, reguły jednoznaczności nowych kart, filtr, jeśli ma logikę) | S-40, S-41, S-42, S-43                   | MS-01, MS-04                                | proposed |
| S-46 | test-plan-m6         | Zespół ma test-plan.md zgodny ze stanem po M-6: nowe karty, filtr i sezonowa zawartość w mapie ryzyk, §5 i §5a, bez nieaktualnych liczb kart                               | S-38, S-39, S-40, S-41, S-42, S-43, S-45 | MS-01, MS-02, MS-03, MS-04                  | proposed |

## Streams

Navigation aid — groups items that share a Prerequisites chain. Canonical ordering still lives in the dependency graph below.

| Stream | Theme                | Chain                                                              | Note                                                                                                                                                                                              |
| ------ | -------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A      | Święta: obiekty      | `S-38`                                                             | North star; jedyny kawałek świąteczny bez zależności od rysunków postaci.                                                                                                                         |
| B      | Święta: postacie     | `S-39`                                                             | Czeka na rysunki i prawa; równolegle z A, bo cel to szybkość.                                                                                                                                     |
| C      | Nowe karty i filtr   | `S-40`, `S-41`, `S-42` → `S-43` → `S-44`, `S-45` → `S-46`          | Krzyżówka matematyczna (`S-40`) idzie szybko, równolegle ze świętami; `S-41` i `S-42` czekają na wybór rodzaju. Tagi (`S-43`) po kartach, żeby od razu objęły wszystkie; `S-44` do `S-46` zamykają kamień. |

## Baseline

What's already in place in the codebase as of `2026-11-13` (po M-5; z kodu na main i `tech-stack.md`).
Foundations below assume these are present and do NOT re-scaffold them.

- **Frontend:** present — katalog dziesięciu kart na `/` (`src/lib/cards.ts`), wspólna powłoka `GeneratorShell.astro` i `CardPage.tsx` z `useCardPage`, strony wszystkich dziesięciu kart, wybory poziomu i kategorii (`LevelChoice`, `CategoryChoice`), róg profilu, `how-it-works.astro`. Katalog nie ma tagów ani filtra.
- **Backend / API:** absent by design — generowanie działa w przeglądarce.
- **Data:** present — tylko na urządzeniu (`card-settings.ts`, `child-profiles.ts`, `last-used.ts`, `catalog-badges.ts`, `card-summary.ts`); kategorie obiektów z `OBJECT_CATEGORIES` w `src/lib/symmetry/template-format.ts` (sześć kategorii); katalog postaci jedenaście, bez sezonowych.
- **Auth:** absent by design — PRD: jeden lokalny rodzic.
- **Deploy / infra:** present — CI (lint, test, check, build, smoke), Playwright e2e na Chromium; dwa środowiska (`main` = staging, `prod`); `npm test` wylicza pliki testów jawnie.
- **Observability:** partial — dzienniki platformy, bez śledzenia błędów aplikacji.

## Foundations

Brak. Kategorie obiektów, katalog kart, pamięć paska i postać przy poleceniu już istnieją (Baseline); tagi katalogu dochodzą jako S-43 po nowych kartach, żeby od razu objęły wszystkie, i dają użytkowi filtr, a nie samo pole w danych.

## Slices

### S-38: Świąteczne obiekty na kartach z szablonów

- **Outcome:** Rodzic wybiera świąteczne obiekty (np. bombka, choinka z ozdobami, Mikołaj, bałwanek, piernik, gwiazda betlejemska) na kartach symetrii, nonogramu, dyktanda graficznego i „Skopiuj obrazek”, generuje kartę, podgląda ją i drukuje jako jedną stronę A4 także z telefonu. Obiekty dochodzą do katalogu szablonów w trzech rozmiarach (połowa 4×12, 6×15, 9×24) i spełniają reguły każdej z czterech kart (jedno rozwiązanie nonogramu, obrys dyktanda bez styku).
- **Change ID:** christmas-objects
- **PRD refs:** MS-03, FR-028, FR-029, US-19, US-20
- **Prerequisites:** —
- **Parallel with:** S-39, S-40
- **Blockers:** —
- **Unknowns:**
  - Które obiekty (lista i liczba)? Rozstrzyga rozmowa przed planem. — Owner: user. Block: no.
  - Czy świąteczne obiekty to nowa siódma kategoria „Święta” w istniejącym wyborze kategorii, czy sezonowy tag, który ukrywa się poza sezonem? Pierwsza opcja działa od razu na istniejącym mechanizmie; druga wymaga tagów z S-43, które idą po kartach, więc nie zdążyłaby przed grudniem. — Owner: user. Block: no.
  - Czy obiekty mają być widoczne cały rok, czy tylko w sezonie? — Owner: user. Block: no.
- **Risk:** Nowy obiekt musi przejść reguły czterech kart naraz i być czytelny w połowie 4×12; obiekt, który nie daje się narysować czytelnie, zastępuje inny. Dodanie kategorii zmienia wybór kategorii na trzech kartach i ich zapamiętane ustawienia; stare wpisy muszą czytać się bez migracji. Termin: święta, więc ten kawałek idzie pierwszy.
- **Status:** ready

### S-39: Świąteczne postacie

- **Outcome:** Rodzic wybiera świąteczną postać (np. Mikołaj, renifer, bałwanek) z listy postaci przy poleceniu na każdej karcie, w oknie profilu jako ulubioną i na labiryncie przy starcie; postać drukuje się w kolorze jak pozostałe. Lista pokazuje wszystkie postacie bez ucięcia także przy niskiej rozdzielczości.
- **Change ID:** christmas-characters
- **PRD refs:** MS-02, FR-012, FR-030, US-03, US-21
- **Prerequisites:** — (rysunki postaci)
- **Parallel with:** S-38, S-40
- **Blockers:** Rysunki świątecznych postaci w tym samym stylu co jedenaście istniejących.
- **Unknowns:**
  - Skąd rysunki i czy prawa pozwalają je pokazać w produkcie? PRD Open Questions 3. — Owner: user. Block: yes.
  - Ile postaci i które? — Owner: user. Block: yes.
  - Czy świąteczne postacie pokazują się tylko w sezonie, czy zawsze obok jedenastu stałych? Katalog ma dziś dokładnie jedenaście postaci wpisanych w PRD i testy. — Owner: user. Block: no.
- **Risk:** Zmienia liczbę postaci wpisaną na sztywno w PRD (FR-012, US-03) i w testach; lista postaci musi zostać w całości widoczna. Zależy od rysunków poza kodem, więc może zdążyć na święta albo nie, stąd osobny kawałek, który nie blokuje S-38.
- **Status:** blocked

### S-40: Krzyżówka matematyczna

- **Outcome:** Rodzic otwiera z katalogu „Krzyżówkę matematyczną”, wybiera poziom, uruchamia generowanie i dostaje kartę A4 z siatką działań, które krzyżują się we wspólnych polach; część liczb jest wpisana, reszta pusta do uzupełnienia. Widzi podgląd i drukuje kartę jako jedną stronę A4 także z telefonu. Profil pamięta pasek, postać stoi przy poleceniu, karta ma miniaturę i opis w „Jak to działa”; tagi dochodzą w S-43. Generator sprawdza, że każde puste pole ma jedno rozwiązanie.
- **Change ID:** math-crossword-card
- **PRD refs:** MS-01, FR-014, FR-017, FR-030, US-05, US-08
- **Prerequisites:** —
- **Parallel with:** S-38, S-39, S-41, S-42
- **Blockers:** —
- **Unknowns:**
  - Jakie działania i zakresy liczb na poziomach (do 10, do 20, mnożenie)? Rozstrzyga rozmowa i makieta przed planem. — Owner: user. Block: no.
  - Układ: klasyczna krzyżówka liczbowa (działania poziomo i pionowo) czy siatka z wynikami na brzegach? — Owner: user. Block: no.
  - Dla jakiego wieku? Karty nie nazywają poziomów wiekiem, ale zakres liczb wyznacza cel projektu. — Owner: user. Block: no.
- **Risk:** Jednoznaczność: układ musi mieć dokładnie jedno rozwiązanie (solver jak w sudoku i nonogramie). Nowa karta zmienia liczbę kart wpisaną na sztywno w testach (katalog, plakietki, `scripts/smoke.mjs`). „Szybko” wymaga małego zakresu: jeden układ siatki i trzy poziomy.
- **Status:** ready

### S-41: Nowa karta 2

- **Outcome:** Rodzic otwiera z katalogu kolejną nową kartę, wybiera poziom, generuje kartę A4, podgląda ją i drukuje także z telefonu; profil pamięta pasek, a postać stoi przy poleceniu. Karta ma miniaturę i opis w „Jak to działa”; tagi dochodzą w S-43.
- **Change ID:** new-card-2
- **PRD refs:** MS-01, FR-014, FR-017, FR-030, US-05, US-08
- **Prerequisites:** —
- **Parallel with:** S-40, S-42
- **Blockers:** —
- **Unknowns:**
  - Który rodzaj karty? Kandydaci: karty kodowania, połącz kropki, pieniądze ciąg dalszy, albo nowy pomysł użytkownika. — Owner: user. Block: yes.
- **Risk:** Placeholder; kształt nieznany. Przed planem trzeba ustalić rodzaj, a wtedy slice zostaje przemianowany (Change ID, wynik, PRD refs) przy aktualizacji roadmapy.
- **Status:** blocked

### S-42: Nowa karta 3

- **Outcome:** Rodzic otwiera z katalogu jeszcze jedną nową kartę, wybiera poziom, generuje kartę A4, podgląda ją i drukuje także z telefonu; profil pamięta pasek, a postać stoi przy poleceniu. Karta ma miniaturę i opis w „Jak to działa”; tagi dochodzą w S-43.
- **Change ID:** new-card-3
- **PRD refs:** MS-01, FR-014, FR-017, FR-030, US-05, US-08
- **Prerequisites:** —
- **Parallel with:** S-40, S-41
- **Blockers:** —
- **Unknowns:**
  - Który rodzaj karty? Czy będzie czwarta karta po krzyżówce, S-41 i S-42 (opis użytkownika: „3–4 karty”)? — Owner: user. Block: yes.
- **Risk:** Placeholder, jak S-41. Czwarta karta jest w Open Roadmap Questions, nie w slice'ach, dopóki nie zostanie wybrana.
- **Status:** blocked

### S-43: Tagi i filtr kart w katalogu

- **Outcome:** Rodzic na stronie głównej widzi wszystkie rodzaje kart z tagami (np. logika, liczby, rysowanie, pisanie) i jednym wyborem zawęża katalog do kart z wybranym tagiem; „Wszystkie” jest domyślne i wybór nie zmienia stron generatorów ani profilu. Filtr jest używalny na telefonie (miniatury w dwóch kolumnach), a katalog nadal mieści wszystkie karty bez filtra.
- **Change ID:** card-tags-filter
- **PRD refs:** MS-04, FR-014, US-05
- **Prerequisites:** S-40, S-41, S-42
- **Parallel with:** S-38, S-39
- **Blockers:** —
- **Unknowns:**
  - Jakie tagi i która karta ma które? Rozstrzyga rozmowa przed planem; tagi dostają wszystkie karty naraz, także trzy nowe z S-40 do S-42. — Owner: user. Block: no.
  - Filtr jedno- czy wielokrotny, i czy zapamiętywany w profilu/na urządzeniu? Glosariusz (`context/domain/glossary.md`) dziś zabrania „tagów” i „filtrów” przy kategoriach obiektów, więc nazwa filtra musi się od niej odróżniać. — Owner: user. Block: no.
  - Czy sezonowy tag „Święta” wchodzi do tego samego filtra (zależy od odpowiedzi w S-38)? — Owner: user. Block: no.
- **Risk:** Katalog ma dziś stały kształt, a testy e2e i plakietki zakładają stałą liczbę miniatur; filtr zmienia ich widoczność. Tagi kart i kategorie obiektów to dwa różne pojęcia i trzeba je odróżnić w nazwach, żeby rodzic i kod ich nie mylił.
- **Status:** proposed

### S-44: „Jak to działa” po M-6

- **Outcome:** Rodzic otwiera ze stopki „Jak to działa” i widzi na liście „Rodzaje kart” wszystkie rodzaje z opisami (także nowe), poprawny akapit „Poziomy” i „Profil dziecka” oraz krótkie zdanie o filtrze i sezonowych postaciach i obiektach, bez nieaktualnych zdań o liczbie kart albo postaci.
- **Change ID:** how-it-works-m6
- **PRD refs:** MS-01, MS-02, MS-03, MS-04, US-22, FR-031
- **Prerequisites:** S-38, S-39, S-40, S-41, S-42, S-43
- **Parallel with:** S-45
- **Blockers:** —
- **Unknowns:** —
- **Risk:** Test zgodności treści z UI i PRD jest pisany na sztywno pod liczby kart i postaci; edycja przed końcem pozostałych kawałków rozjedzie się z tym, co rodzic widzi. Dlatego idzie na końcu treści, jak S-32 w M-4 i S-37 w M-5.
- **Status:** proposed

### S-45: Stryker dla nowych kart i filtra M-6

- **Outcome:** Zespół uruchamia Strykera na zakresach z ryzykiem z M-6 (przede wszystkim solver i reguły jednoznaczności krzyżówki matematycznej, a dla S-41 i S-42 tylko to, co ma solver albo reguły dwuznaczności; filtr z S-43 tylko jeśli ma nietrywialną logikę), przegląda ocalałe mutanty po jednym i dopisuje asercję tylko tam, gdzie mutant oznacza błąd widoczny dla rodzica. Wyniki są w `context/changes/<change>/reviews/stryker-results.md`, a zakresy mają własne konfiguracje w `stryker/` i skrypty `npm run mutate:<scope>`.
- **Change ID:** stryker-m6-cards
- **PRD refs:** MS-01, MS-04
- **Prerequisites:** S-40, S-41, S-42, S-43
- **Parallel with:** S-44
- **Blockers:** —
- **Unknowns:**
  - Które zakresy dostają Strykera (zależy od rodzajów kart S-41 i S-42)? Rozstrzyga się po ich zbudowaniu, na podstawie ryzyk z test-plan.md. — Owner: user. Block: no.
- **Risk:** AGENTS.md: Stryker wybiórczo i bez gonienia za 100% wyniku; każdy zakres osobno, komputer nie może usnąć. Slice idzie po kartach, bo mutuje gotowy kod. Nie obejmuje S-38 (dane szablonów, reguły pilnują istniejące zakresy) ani S-39.
- **Status:** proposed

### S-46: Test plan po M-6

- **Outcome:** Zespół otwiera `context/foundation/test-plan.md` i widzi stan po M-6: nowe karty, filtr katalogu i sezonową zawartość w mapie ryzyk (§2), w tym, co jest już sprawdzone (§5), w zakresach Strykera (§5a) i w podręczniku (§6), bez nieaktualnych liczb kart.
- **Change ID:** test-plan-m6
- **PRD refs:** MS-01, MS-02, MS-03, MS-04
- **Prerequisites:** S-38, S-39, S-40, S-41, S-42, S-43, S-45
- **Parallel with:** S-44
- **Blockers:** —
- **Unknowns:** —
- **Risk:** Dokument opisuje stan, więc idzie na końcu, po wynikach Strykera (S-45); wcześniejsza edycja rozjedzie się z kodem. Tylko dokumentacja (`context/`), więc CI jobów `ci`, `smoke` i `e2e` nie uruchomi.
- **Status:** proposed

## Backlog Handoff

Issues na GitHubie z etykietą `roadmap-slice` idą za „At a glance” i „Done”. Zmiana statusu plasterka wymaga tej samej zmiany w issue: zamknąć zrobione, otworzyć nowe z aktywnego kamienia, `status:ready` tylko gdy wiersz poniżej mówi yes. Sekcje „Po tym kamieniu” i „Parked” nie dostają issue, dopóki ich kamień nie jest otwarty.

| Roadmap ID | Change ID            | Suggested issue title                       | Ready for `/10x-plan` | Notes                                                                                                                |
| ---------- | -------------------- | ------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------- |
| S-38       | christmas-objects    | Świąteczne obiekty w katalogu szablonów     | yes                   | Run `/10x-new christmas-objects`, potem `/10x-plan`. Najpierw lista obiektów i decyzja kategoria czy tag (#369)       |
| S-39       | christmas-characters | Świąteczne postacie przy poleceniu          | no                    | Czeka na rysunki i prawa (Open Questions 3) (#370)                                                                    |
| S-40       | math-crossword-card  | Karta „Krzyżówka matematyczna” z poziomami  | yes                   | Run `/10x-new math-crossword-card`, potem `/10x-plan`. Najpierw makieta układu (#371)                                 |
| S-41       | new-card-2           | Nowa karta 2 (rodzaj do ustalenia)          | no                    | Czeka na wybór rodzaju (#372)                                                                                         |
| S-42       | new-card-3           | Nowa karta 3 (rodzaj do ustalenia)          | no                    | Czeka na wybór rodzaju (#373)                                                                                         |
| S-43       | card-tags-filter     | Tagi i filtr kart w katalogu                | no                    | Czeka na S-40 do S-42; potem `/10x-new card-tags-filter`. Najpierw lista tagów (#374)                                 |
| S-44       | how-it-works-m6      | „Jak to działa” po M-6                      | no                    | Czeka na S-38 do S-43 (#375)                                                                                          |
| S-45       | stryker-m6-cards     | Stryker dla nowych kart i filtra M-6        | no                    | Czeka na S-40 do S-43; potem `/10x-new stryker-m6-cards` (#376)                                                       |
| S-46       | test-plan-m6         | Test plan po M-6                            | no                    | Czeka na S-38 do S-43 i S-45 (#377)                                                                                   |

## Open Roadmap Questions

1. **Insight — czemu gotowe paczki PDF nie rozwiązują tego poza skończoną biblioteką?** — Owner: user. Block: no.
2. **Skąd rysunki świątecznych postaci i jakie prawa pozwalają je pokazać?** — Owner: user. Block: S-39 (PRD Open Questions 3).
3. **Które dwa (albo trzy) rodzaje kart wchodzą do M-6 obok krzyżówki matematycznej?** — Owner: user. Block: S-41, S-42. Kandydaci z „Po tym kamieniu”: karty kodowania, połącz kropki, pieniądze ciąg dalszy; nonogram i dyktando postaci czekają na obrysy postaci.
4. **Czy sezonowe obiekty i postacie są widoczne cały rok, czy tylko w sezonie, i czy sezon to kategoria, czy tag?** — Owner: user. Block: no (S-38, S-39, S-43).
5. **Czy czwarta nowa karta wchodzi do M-6 (obok krzyżówki, S-41 i S-42)?** — Owner: user. Block: no.
6. **Czy poziomy „Kto ma więcej?” i „Który nie pasuje” pasują dziecku, a wygląd monety i banknotu jest czytelny bez kopiowania wzorów NBP?** — Owner: user. Block: no (PRD Open Questions 14).
7. **Kolejne sezony** (Wielkanoc, Halloween, pory roku): wchodzą po M-6 jako osobne kawałki. — Owner: user. Block: no.

## Parked

- **„Zacznij od nowa” w oknie profilu (FR-032)** — Why parked: nice-to-have; to samo da się zrobić paskiem każdej karty.
- **Pieniądze: grosze, banknoty powyżej 20 zł, ceny, reszta i „Ułóż dokładnie tę kwotę”** — Why parked: PRD §Non-Goals (2026-11-01); ostatnie czeka na regułę z jednym układem.
- **Ocena rysunku dziecka przez aplikację** — Why parked: PRD §Non-Goals; kopiowanie i szlaczki znają wzór, nie rozpoznają rysunku.
- **Postać jako treść zadania (obrysy postaci na kratce)** — Why parked: PRD Po MVP; postać jest ozdobą przy poleceniu.
- **Kolejne sezony poza Bożym Narodzeniem** — Why parked: M-6 sprawdza mechanizm na jednym sezonie; reszta po ocenie.
- **Samouczek przy pierwszym wejściu i okno pomocy** — Why parked: PRD §Non-Goals; pomoc to podpowiedzi w miejscu wyboru i strona „Jak to działa”.
- **Generowanie albo ocena kart modelem językowym** — Why parked: PRD §Non-Goals; rezultat ma wynikać z jawnych reguł algorytmicznych.
- **Konta rodziców i synchronizacja między urządzeniami** — Why parked: PRD §Non-Goals; ustawienia i profile zostają na urządzeniu.
- **Zapis i archiwum wygenerowanych kart** — Why parked: PRD §Non-Goals; cykl życia karty kończy się po wydruku.
- **Biblioteka gotowych kart (FR-011)** — Why parked: PRD §Non-Goals; nice-to-have poza MVP.

## Po tym kamieniu

Nie wlicza się do „Done when” M-6. Kandydaci na S-41–S-42 są tu, dopóki nie zostaną wybrani.

Wspólna umowa z labiryntem: algorytm, jedna sprawdzalna odpowiedź (poza wyjątkiem szlaczków), poziomy bez nazw wieku, jedna strona A4, czarny druk z kolorową postacią przy poleceniu, bez modelu językowego.

- **Obrysy postaci na kratce** — warunek dla „Połącz kropki” i „Nonogram i dyktando postaci”. Makieta z 2026-10-26: 11 postaci da się narysować na kratce ok. 15×15.
- **Połącz kropki** — sylwetka postaci. Czeka na obrysy.
- **Nonogram i dyktando postaci** — rozwiązanie odsłania postać zamiast obiektu z szablonów. Czeka na obrysy.
- **Karty kodowania** — kratka, postać, meta, strzałki, jedna najkrótsza droga.
- **Pieniądze, ciąg dalszy** — jedna kupka i cena („czy wystarczy?”), grosze, reszta.

Kolorowanki oraz działania na liczbach z dopiskiem waluty zostają poza tą listą.

## Milestone History

- **M-5: Cztery nowe rodzaje kart: pieniądze, który nie pasuje, kopiowanie rysunku i szlaczki** (`four-new-card-kinds`) — closed 2026-11-13. Rodzic generuje i drukuje cztery nowe rodzaje kart („Kto ma więcej?”, „Który nie pasuje”, „Skopiuj rysunek na kratce”, szlaczki) z własnymi poziomami bez wieku, profil pamięta pasek każdej z nich, a postać stoi przy poleceniu; katalog ma dziesięć rodzajów, wydane na produkcji jako v2026.11.13. Slice'y S-33 do S-37.
- **M-4: Poziomy bez wieku, profil pamiętający karty i postać na każdej karcie** (`profile-levels-and-character`) — closed 2026-11-01. Rodzic wybiera poziom każdej karty bez nazw wieku, profil sam pamięta pasek każdej karty i pokazuje go w katalogu, ulubiona postać stoi przy poleceniu na każdej karcie i zmienia się tylko jawnie, a strona „Jak to działa” tłumaczy zasady. Slice'y S-27 do S-32.
- **M-3: Sekwencje, sudoku, nonogram i dyktando graficzne** (`sequences-and-sudoku-cards`) — closed 2026-10-26. Rodzic generuje i drukuje cztery nowe rodzaje kart (sekwencje, sudoku 4×4/6×6/9×9 z kolorami, nonogram i dyktando graficzne) z własnymi poziomami albo rozmiarami, a symetria, nonogram i dyktando biorą obiekty z katalogu 22 szablonów w pięciu kategoriach z wyborem kategorii. S-14 (wiek w profilu) nie wrócił w M-3; zastąpiły go S-28 i S-29 w M-4.
- **M-2: Karta symetrii na A4** (`symmetry-card-a4`) — closed 2026-10-23. Rodzic wybiera rodzaj karty w katalogu, generuje kartę symetrii na poziomie nazwanym wiekiem, włącza kolory i drukuje ją jako jedną stronę A4 także z telefonu. S-14 (wiek i poziomy w profilu) wyjęty z kamienia i odłożony na prośbę użytkownika do czasu, gdy będzie więcej rodzajów kart.
- **M-1: Pierwsza drukowalna karta A4** (`first-printable-a4-maze`) — closed 2026-10-22. Rodzic generuje labirynt na wybranym poziomie, wybiera postać, korzysta z profili dzieci i drukuje kartę jako jedną stronę A4 także z telefonu.

## Done

- **F-01: (foundation) Wejście na stronę główną pokazuje, do czego jest narzędzie, i przycisk generowania labiryntu (na razie nie działa).** — Archived 2026-09-29 → `context/archive/2026-09-28-worksheet-page-shell/`. Lesson: —.
- **S-01: Rodzic może wygenerować rozwiązywalny labirynt i zobaczyć go jako kartę A4 na stronie.** — Archived 2026-10-01 → `context/archive/2026-09-28-first-printable-maze/`. Lesson: —.
- **S-02: Rodzic może wydrukować tę kartę jako jedną stronę A4.** — Archived 2026-10-03 → `context/archive/2026-09-29-print-a4-maze/`. Lesson: —.
- **S-03: Rodzic może wybrać postać z dostarczonego zestawu; postać stoi przy starcie labiryntu.** — Archived 2026-10-04 → `context/archive/2026-10-04-maze-character-choice/`. Lesson: —.
- **S-04: Rodzic bez profilu dziecka dostaje ostatnio użyte parametry jako widoczne, edytowalne wartości domyślne.** — Archived 2026-10-05 → `context/archive/2026-10-05-last-used-print-params/`. Lesson: —.
- **S-05: Rodzic może utworzyć opcjonalny lokalny profil dziecka z ulubioną postacią oraz wybrać zapisany profil, gdy istnieje rzeczywisty wybór.** — Archived 2026-10-08 → `context/archive/2026-10-06-child-profile-create-select/`. Lesson: —.
- **S-06: Rodzic może jawnie zapisać zmienione ustawienia profilu dziecka i usunąć profil po potwierdzeniu.** — Archived 2026-10-09 → `context/archive/2026-10-08-child-profile-save-delete/`. Lesson: —.
- **F-02: (foundation) Wejście do aplikacji to kartka do druku; nie ma już ekranów logowania ani dashboardu ze startera, a automatyczny sprawdzian HTTP pilnuje strony produktu.** — Archived 2026-10-11 → `context/archive/2026-10-03-remove-starter-scaffold/`. Lesson: —.
- **S-08: Rodzic może wybrać dowolną postać z katalogu jedenastu, także przy tworzeniu profilu i przy zapisie ulubionej postaci, a pełna lista zostaje widoczna na węższym oknie.** — Archived 2026-10-11 → `context/archive/2026-10-11-full-character-catalog/`. Lesson: —.
- **S-07: Rodzic może wybrać jeden z sześciu poziomów nazwanych wiekiem i dostać labirynt A4 zgodny z szerokością alejki i długością drogi tego poziomu.** — Archived 2026-10-16 → `context/archive/2026-10-11-maze-difficulty-levels/`. Lesson: —. Wybór poziomu przy tworzeniu i edycji profilu (FR-007, FR-009) domknęło `profile-level-choice` — archived 2026-10-17 → `context/archive/2026-10-17-profile-level-choice/`.
- **S-09: Rodzic może na telefonie wygenerować labirynt i wydrukować go jako jedną stronę A4; Generuj i Drukuj nie nachodzą na siebie, a labirynt nie wychodzi poza stronę ani na szerokość, ani na długość.** — Archived 2026-10-21 → `context/archive/2026-10-13-phone-worksheet/`. Lesson: —.
- **S-11: Rodzic może wydrukować kartę, na której labirynt wraz z postacią jest odrobinę niżej, a margines górny i dolny zostają takie same także wtedy, gdy postać stoi u góry.** — Archived 2026-10-22 → `context/archive/2026-10-22-printed-maze-equal-margins/`. Lesson: —.
- **F-03: (foundation) Strona główna to katalog kart z miniaturą labiryntu; labirynt działa bez zmian pod własnym adresem, ze wspólną powłoką strony generatora** — Archived 2026-10-23 → `context/archive/2026-10-22-card-catalog-home/`. Lesson: —.
- **S-12: Rodzic może wejść z katalogu na stronę symetrii (`/symetria`), wygenerować kartę z połową obiektu (np. rakieta, robot, truskawka) i jedną odpowiedzią, zobaczyć podgląd i wydrukować ją jako jedną stronę A4, także na telefonie.** — Archived 2026-10-23 → `context/archive/2026-10-23-symmetry-first-printable/`. Lesson: —.
- **S-13: Rodzic może wybrać poziom symetrii nazwany wiekiem (kratka, obiekty, podpowiedź) na pasku strony symetrii.** — Archived 2026-10-23 → `context/archive/2026-10-23-symmetry-difficulty-levels/`. Lesson: —.
- **S-15: Rodzic może niezależnie od poziomu włączyć kolory na karcie symetrii: kratki obiektu (także okno, oczy i pestki) mają prawdziwe kolory, bez liter i bez legendy, a dziecko koloruje odbicie kredkami według wzoru. Domyślnie obiekt jest czarną sylwetką.** — Archived 2026-10-23 → `context/archive/2026-10-23-symmetry-color-codes/`. Lesson: —.
- **S-16: Rodzic może wejść z katalogu na stronę „Sekwencje” (`/sekwencje`), wygenerować kartę z kilkoma ciągami liczb i kształtów, w których brakuje elementów, i jedną odpowiedzią każdego ciągu, zobaczyć podgląd i wydrukować ją jako jedną stronę A4, także na telefonie.** — Archived 2026-10-24 → `context/archive/2026-10-23-sequences-first-printable/`. Lesson: —.
- **S-18: Rodzic może wejść z katalogu na stronę „Sudoku” (`/sudoku`), wygenerować planszę 4×4 z czterema prostymi kształtami jako czarnymi konturami (w każdym wierszu brakuje jednego, miejsce losowe) i jednym rozwiązaniem, zobaczyć podgląd i wydrukować ją jako jedną stronę A4, także na telefonie. Generator i sprawdzenie jednego rozwiązania powstają od razu dla 4×4, 6×6 i 9×9 (bloki 2×2, 2×3, 3×3), ale strona pokazuje tylko 4×4.** — Archived 2026-10-24 → `context/archive/2026-10-23-picture-sudoku-first-printable/`. Lesson: —.
- **S-17: Rodzic może wybrać poziom sekwencji nazwany wiekiem (4–7 lat: długość ciągu, rodzaj reguł, liczba pustych pól i ciągów) na pasku strony sekwencji.** — Archived 2026-10-24 → `context/archive/2026-10-24-sequence-difficulty-levels/`. Lesson: —.
- **S-19: Rodzic może wybrać na pasku strony sudoku rozmiar (4×4, 6×6, 9×9) i poziom (łatwy, średni, trudny: 6×6 — 12/18/22 pustych z 36, 9×9 — 35/45/52 z 81; 4×4 ma jeden poziom), a przy 6×6 przełącznikiem „Kształty / Cyfry” wybrać symbole.** — Archived 2026-10-24 → `context/archive/2026-10-24-picture-sudoku-levels/`. Lesson: —.
- **S-20: Rodzic może włączyć kolory na karcie sudoku z kształtami; każdy kształt ma jeden stały kolor kredki na całej planszy, a przełącznik nie zmienia planszy. Domyślnie czarne kontury; przy cyfrach przełącznika nie ma.** — Archived 2026-10-25 → `context/archive/2026-10-25-picture-sudoku-colors/`. Lesson: —.
- **S-23: Rodzic może wejść z katalogu na stronę „Dyktando graficzne”, wygenerować kartę z poleceniami (liczba kratek i strzałka) prowadzącymi od kropki startu po zewnętrznym obrysie obiektu z katalogu szablonów (poziom 6 lat, obiekty 12×15), zobaczyć podgląd i wydrukować ją jako jedną stronę A4 bez rysunku odpowiedzi, także na telefonie.** — Archived 2026-10-25 → `context/archive/2026-10-25-graphic-dictation-first-printable/`. Lesson: —.
- **S-22: Rodzic może wejść z katalogu na stronę „Nonogram”, wygenerować nonogram średni (12×15) z liczbami przy wierszach i nad kolumnami, którego jedynym rozwiązaniem jest cała sylwetka obiektu z katalogu szablonów, zobaczyć podgląd i wydrukować go jako jedną stronę A4 bez rozwiązania, także na telefonie.** — Archived 2026-10-25 → `context/archive/2026-10-25-nonogram-first-printable/`. Lesson: —.
- **S-21: Rodzic klikający Generuj na karcie symetrii widzi więcej obiektów niż rakieta, robot i truskawka. Katalog ma pięć kategorii (Zwierzęta, Jedzenie, Przyroda, Kosmos i maszyny, Domy i budowle) po co najmniej cztery obiekty, każdy w trzech rozmiarach szablonu (połowa 4×12, 6×15, 9×24), z losowanymi częściami, kolorem kredki każdej kratki i etykietą kategorii. Wyboru kategorii na pasku jeszcze nie ma (S-26); generator losuje ze wszystkich. Nonogram i dyktando biorą obiekty z tego samego katalogu.** — Archived 2026-10-25 → `context/archive/2026-10-25-template-object-catalog/`. Lesson: —.
- **S-25: Rodzic może wybrać poziom dyktanda graficznego nazwany wiekiem (5 lat: kratka około 14 mm i obiekty 8×12; 6 lat: 11 mm i 12×15; 7 lat: 8 mm i 18×24) na pasku strony dyktanda.** — Archived 2026-10-25 → `context/archive/2026-10-25-graphic-dictation-levels/`. Lesson: —.
- **S-26: Rodzic może wybrać na pasku strony symetrii, nonogramu i dyktanda graficznego „Kategoria”: Wszystkie, Zwierzęta, Jedzenie, Przyroda, Kosmos i maszyny albo Domy i budowle. Można wybrać dokładnie jedną, domyślnie „Wszystkie”; kolejne Generuj losuje obiekt tylko z niej.** — Archived 2026-10-25 → `context/archive/2026-10-25-object-category-choice/`. Lesson: —.
- **S-24: Rodzic może wybrać na pasku strony nonogramu poziom: łatwy (prosty wariant dla przedszkolaków), średni (klasyczny 12×15) albo trudny (klasyczny 18×24).** — Archived 2026-10-26 → `context/archive/2026-10-25-nonogram-sizes/`. Lesson: —.
- **S-27: Rodzic wybiera Poziom 1–6 w labiryncie, Poziom 1–4 w symetrii i sekwencjach oraz łatwy / średni / trudny w dyktandzie; każdy wiersz listy poziomów (także w sudoku i nonogramie) ma pół zdania o tym, co zmienia poziom. Zapisane identyfikatory poziomów zostają, więc profile i ostatnie parametry wczytują się bez zmian.** — Archived 2026-10-26 → `context/archive/2026-10-26-level-labels-without-age/`. Lesson: —.
- **S-28: Rodzic wraca na stronę dowolnej z sześciu kart i ma na pasku ustawienia, które ostatnio wybrał dla tej karty (tabela w PRD Business Logic „Profil i zapamiętane ustawienia”): przy aktywnym profilu każda zmiana zapisuje się w profilu od razu i potwierdza ją krótki komunikat „Zapamiętane dla {imię}”; bez profilu urządzenie pamięta je osobno dla każdej karty. Karta, której profil jeszcze nie używał, startuje z ustawieniami domyślnymi. Stare profile i ostatnie parametry nadal się wczytują, a dawny poziom zostaje poziomem labiryntu.** — Archived 2026-10-27 → `context/archive/2026-10-26-card-settings-memory/`. Lesson: —.
- **S-30: Rodzic widzi pasek „Postać” na stronie każdej karty. Na symetrii, sekwencjach, sudoku, nonogramie i dyktandzie wybrana postać (z katalogu albo własny obrazek) stoi w kolorze przy zdaniu polecenia, a polecenie jest w jej dymku; przy „Bez postaci” zostaje samo polecenie. Zadanie, odpowiedź, druk na jednej stronie A4 i margines 10 mm zostają bez zmian.** — Archived 2026-10-27 → `context/archive/2026-10-27-character-speaks-instruction/`. Lesson: —.
- **S-29: Rodzic tworzy profil, podając tylko imię i postać; okno profilu nie ma już kontrolek poziomu, pokazuje jedno zdanie o zasadzie i podsumowanie ustawień kart tylko do odczytu („Labirynt: Poziom 4 · Nonogram: średni, Zwierzęta”), z których każda pozycja prowadzi do strony karty. W katalogu przy wybranym profilu miniatura każdej karty, której profil używał, ma plakietkę z zapamiętanym poziomem.** — Archived 2026-10-27 → `context/archive/2026-10-27-profile-window-summary/`. Lesson: —.
- **S-31: Rodzic przy aktywnym profilu wybiera inną postać na pasku tylko na bieżącą wizytę na stronie; pod listą widzi „Tylko na tę kartę” i może jednym wyborem „Ustaw jako ulubioną {imię}” zapisać ją w profilu. Przy następnym wejściu wraca ulubiona. Bez profilu ostatnio użyta postać jest wspólna dla wszystkich kart.** — Archived 2026-10-27 → `context/archive/2026-10-27-favorite-character-explicit/`. Lesson: —.
- **S-32: Rodzic otwiera ze stopki krótką stronę „Jak to działa” z zasadą poziomów, profilu i postaci. Strona `/how-it-works` jest statyczna, a stopka z linkiem jest na katalogu i na stronach generatorów, ukryta w druku A4. Bez samouczka i bez okna pomocy.** — Archived 2026-10-31 → `context/archive/2026-10-31-s32-how-does-it-work/`. Lesson: —.
- **S-33: Rodzic otwiera z katalogu „Kto ma więcej?”, wybiera poziom (łatwy / średni / trudny), uruchamia generowanie i dostaje kartę A4 z pięcioma rzędami po dwie kupki monet i banknotów (1, 2, 5, 10, 20 zł) oddzielone pustym polem, w którym dziecko wpisuje „<”, „>” albo „=”. Widzi podgląd, drukuje kartę jako jedną stronę A4 także z telefonu, profil pamięta poziom, a wybrana postać stoi przy poleceniu. Karta ma własną miniaturę i wpis w katalogu na stronie głównej. Okno profilu i plakietka na miniaturze pokazują zapamiętany poziom, a opis karty trafia do listy „Rodzaje kart” na stronie „Jak to działa”. Generator liczy wartość każdej kupki i nie pokazuje kart łamiących reguły poziomu (remis najwyżej w jednym rzędzie). Jako pierwsza z czterech kart zamienia wpisaną na sztywno liczbę sześciu kart w testach (zapis ustawień, podsumowanie profilu, plakietki na telefonie, katalog) na liczbę z katalogu, żeby S-34 do S-36 dokładały karty bez zmiany tych testów.** — Archived 2026-11-01 → `context/archive/2026-11-01-coins-who-has-more/`. Lesson: —.
- **S-34: Rodzic otwiera z katalogu „Który nie pasuje”, wybiera poziom (łatwy / średni / trudny) i opcjonalnie włącza kolory, uruchamia generowanie i dostaje kartę A4 z 5–6 rzędami obrazków (4–6 w rzędzie), w których dokładnie jeden łamie regułę rzędu (kształt, rozmiar, liczba, kolor po włączeniu kolorów albo kategoria obiektu). Zakreśla ten jeden, podgląda i drukuje kartę; profil pamięta poziom i kolory, a postać stoi przy poleceniu. Karta ma własną miniaturę i wpis w katalogu na stronie głównej. Okno profilu i plakietka na miniaturze pokazują zapamiętany poziom, a opis karty trafia do „Jak to działa”. Generator nie pokazuje rzędu, w którym inna reguła wskazuje inny obrazek.** — Archived 2026-11-09 → `context/archive/2026-11-08-odd-one-out-card/`. Lesson: —.
- **S-35: Rodzic otwiera z katalogu „Skopiuj rysunek na kratce”, wybiera poziom (łatwy / średni / trudny) i kategorię obiektów, uruchamia generowanie i dostaje kartę A4 z dwiema kratkami tej samej siatki: w jednej czarna sylwetka obiektu z katalogu szablonów, druga pusta. Dziecko przerysowuje sylwetkę; rodzic podgląda i drukuje kartę, profil pamięta poziom i kategorię, a postać stoi przy poleceniu. Karta ma własną miniaturę i wpis w katalogu na stronie głównej. Okno profilu i plakietka na miniaturze pokazują zapamiętany poziom, a opis karty trafia do „Jak to działa”. Aplikacja nie ocenia rysunku dziecka.** — Archived 2026-11-10 → `context/archive/2026-11-09-copy-the-drawing-card/`. Lesson: —.
- **S-36: Rodzic otwiera z katalogu „Szlaczki”, wybiera poziom (Poziom 1–4), uruchamia generowanie i dostaje kartę A4 z 4–7 rzędami szlaczków (liczba zależy od poziomu): na Poziomach 1–2 dziecko prowadzi ołówek po kropkach, na Poziomie 3 po dwóch powtórzeniach po kropkach rysuje dalej samo, na Poziomie 4 kontynuuje wzór narysowany linią w liniaturze. Rodzic podgląda i drukuje kartę; profil pamięta poziom, a postać stoi przy poleceniu. Karta ma własną miniaturę i wpis w katalogu na stronie głównej. Okno profilu i plakietka na miniaturze pokazują zapamiętany poziom, a opis karty trafia do „Jak to działa”. Aplikacja nie ocenia rysunku dziecka.** — Archived 2026-11-10 → `context/archive/2026-11-09-pattern-lines-card/`. Lesson: —.
- **S-37: Rodzic otwiera ze stopki „Jak to działa” i znajduje opisy dziesięciu rodzajów kart, a akapit „Poziomy” mówi prawdę o wszystkich dziesięciu (trzy poziomy, numery, wiek tylko przy czterech starych kartach).** — Archived 2026-11-10 → `context/archive/2026-11-10-how-it-works-new-cards/`. Lesson: —.
