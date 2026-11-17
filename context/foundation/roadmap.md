---
project: PrintoKids
version: 1
status: draft
created: 2026-09-27
updated: 2026-11-17
prd_version: 6
main_goal: speed
top_blocker: decisions
milestone_id: more-cards-and-catalog-filter
milestone_seq: 7
milestone_status: open
---

# Roadmap: PrintoKids

> Derived from the user's description of M-7 (anchors `MS-01`…`MS-07` below) + `context/foundation/prd.md` (v6) as the contract for inherited behavior + codebase baseline.
> Edit-in-place; archive when superseded.
> Slices below are listed in dependency order. The "At a glance" table is the index.
> S-47 do S-49 są miejscami na trzy karty, których rodzaj użytkowniczka dopiero wybierze; wszystkie slice'y ze statusem `blocked` czekają na decyzję z ich pierwszej niewiadomej.

## Milestone

**M-7: Karty kodowania, trzy kolejne karty, pory roku, filtr katalogu i porządek w profilu i pomocy** — Status: open

- **Intent:** Katalog ma 12 rodzajów kart (`CARD_KINDS` w `src/lib/cards.ts`) i trudniej w nim znaleźć właściwą. M-7 dokłada karty kodowania i trzy kolejne rodzaje kart, kolejny sezon (pory roku), skraca okno profilu i „Jak to działa”, które przy tylu kartach robią się za długie, na końcu daje tagi i filtr obejmujące wszystkie karty naraz, a potem Stryker i aktualizację test-plan.md.
- **Source materials:** opis użytkownika z 2026-11-16 i 2026-11-17 (w tym: „nie wiem czy nie będzie trzeba przebudować profilu, bo lista konfiguracji kart staje się zbyt długa”, „jak to działa też staje się za długa”, „pory roku muszą gdzieś wejść”) (anchors niżej); odziedziczone zasady z `context/foundation/prd.md` (v6).
- **Done when:** every F-NN and S-NN in „At a glance” is `done`. Sekcje „Po tym kamieniu” i „Parked” nie wliczają się.
- **User description (verbatim):** „w roadmapie powinny być jeszcze 3 inne niezidentyfikowane karty i S-43 (filtr katalogu) po nich”; S-42 (karty kodowania) przeszło z M-6 (zawężenie 2026-11-16).
- **Scope anchors:**
  - MS-01: Karty kodowania (S-42, przeniesione z M-6).
  - MS-02: Trzy kolejne rodzaje kart, jeszcze niewybrane.
  - MS-03: Tagowanie i filtrowanie rodzajów kart w katalogu na stronie głównej, po wszystkich czterech kartach (S-43, w M-6 jako MS-04).
  - MS-04: Okno profilu nie rośnie w nieskończoność wraz z liczbą kart (S-52; przebudowa podsumowania ustawień kart, US-08).
  - MS-05: „Jak to działa” zostaje czytelne przy 16 rodzajach kart (S-53; US-22).
  - MS-06: Pory roku jako kolejne sezonowe postacie i obiekty (S-54; mechanizm sezonu z M-6).
  - MS-07: „Skopiuj obrazek” przyjmuje też kształty niesymetryczne z katalogu kształtów dyktanda (S-55; GitHub #379).
  - Dziedziczone bez zmian: FR-014, FR-017, FR-030, US-05, US-08, US-22.

## Vision recap

Rodzic przedszkolaka wyczerpał darmowe karty o właściwej skali trudności, a dziecko wciąż chce kolejną. Brakuje sposobu, żeby wygenerować nową kartę na właściwym poziomie, gdy skończy się dopasowana gotowa biblioteka. Po sześciu kamieniach jest dwanaście rodzajów kart i sezonowe postacie z obiektami; M-7 dokłada kolejne karty i filtr, żeby przy tylu kartach nadal szybko trafić na właściwą.

## North star

**S-42: Rodzic generuje i drukuje kartę kodowania** — jedyna karta M-7 już wybrana i najmniejszy kompletny kawałek kamienia; cel to szybkość.

> Gwiazda przewodnia (north star) — tu: najmniejszy kompletny kawałek, którego dowiezienie pokazuje, że kamień ma sens; stoi możliwie wcześnie, bo reszta ma sens tylko wtedy, gdy ten działa.

## At a glance

| ID   | Change ID        | Outcome (user can …)                                                                                                       | Prerequisites                      | PRD refs                                    | Status   |
| ---- | ---------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------- | -------- |
| S-42 | coding-card      | Rodzic otwiera z katalogu karty kodowania, generuje kartę A4 z kratką, postacią, metą i strzałkami, podgląda ją i drukuje  | —                                  | MS-01, FR-014, FR-017, FR-030, US-05, US-08 | proposed |
| S-47 | m7-card-a        | Rodzic otwiera z katalogu nową kartę (rodzaj do ustalenia), generuje, podgląda i drukuje                                   | —                                  | MS-02, FR-014, FR-017, FR-030, US-05, US-08 | blocked  |
| S-48 | m7-card-b        | Rodzic otwiera z katalogu nową kartę (rodzaj do ustalenia), generuje, podgląda i drukuje                                   | —                                  | MS-02, FR-014, FR-017, FR-030, US-05, US-08 | blocked  |
| S-49 | m7-card-c        | Rodzic otwiera z katalogu nową kartę (rodzaj do ustalenia), generuje, podgląda i drukuje                                   | —                                  | MS-02, FR-014, FR-017, FR-030, US-05, US-08 | blocked  |
| S-55 | copy-drawing-asymmetric-shapes | Rodzic dostaje na „Skopiuj obrazek” także niesymetryczne kształty (np. skarpeta, ryba, dinozaur), z kategorią i kolorami jak dotąd | — | MS-07, FR-037, FR-038, US-27, US-28 | blocked |
| S-52 | profile-card-summary | Rodzic otwiera okno profilu i widzi ustawienia kart w postaci, która nie rośnie z każdą nową kartą | S-42, S-47, S-48, S-49 | MS-04, FR-017, US-08 | blocked |
| S-54 | seasons-objects-characters | Rodzic wybiera obiekty i postacie kolejnej pory roku w jej oknie dat, tak jak świąteczne | — | MS-06, FR-028, FR-029, FR-012, US-19, US-20 | blocked |
| S-43 | card-tags-filter | Rodzic zawęża katalog na stronie głównej do kart z wybranym tagiem i szybciej znajduje właściwy rodzaj karty               | S-42, S-47, S-48, S-49             | MS-03, FR-014, US-05                        | proposed |
| S-53 | how-it-works-m7 | Rodzic otwiera „Jak to działa” i szybko znajduje opis właściwej karty, choć kart jest 16 | S-42, S-47, S-48, S-49, S-43 | MS-05, US-22, FR-031 | blocked |
| S-50 | stryker-m7-cards | Zespół ma karty i logikę M-7 sprawdzone mutacjami Strykera na zakresach z ryzykiem                                         | S-42, S-47, S-48, S-49, S-43, S-54, S-55 | MS-01, MS-02, MS-03                         | proposed |
| S-51 | test-plan-m7     | Zespół ma test-plan.md zgodny ze stanem po M-7                                                                             | S-42, S-47, S-48, S-49, S-43, S-50, S-52, S-53, S-54, S-55 | MS-01, MS-02, MS-03                         | proposed |

## Streams

Navigation aid — groups items that share a Prerequisites chain. Canonical ordering still lives in the dependency graph below.

| Stream | Theme                   | Chain                                          | Note                                                                       |
| ------ | ----------------------- | ---------------------------------------------- | -------------------------------------------------------------------------- |
| A      | Kodowanie, filtr, jakość | `S-42` → `S-43` → `S-53` → `S-50` → `S-51`          | Filtr po wszystkich czterech kartach (dołączają S-47 do S-49); potem Stryker i test-plan. |
| E      | Profil                  | `S-52`                                         | Po kartach, żeby przebudowa objęła wszystkie; wchodzi do S-51.            |
| G      | Skopiuj obrazek         | `S-55`                                         | Istniejąca karta; wchodzi do S-50 i S-51.                                  |
| F      | Pory roku               | `S-54`                                         | Niezależne od kart; wchodzi do S-50 i S-51.                                |
| B      | Karta do ustalenia 1    | `S-47`                                         | Czeka na wybór rodzaju.                                                    |
| C      | Karta do ustalenia 2    | `S-48`                                         | Czeka na wybór rodzaju.                                                    |
| D      | Karta do ustalenia 3    | `S-49`                                         | Czeka na wybór rodzaju.                                                    |

## Baseline

What's already in place in the codebase as of `2026-11-17` (po M-6; z kodu na main i `tech-stack.md`).
Foundations below assume these are present and do NOT re-scaffold them.

- **Frontend:** present — katalog dwunastu kart na `/` (`CARD_KINDS` w `src/lib/cards.ts`), wspólna powłoka `GeneratorShell.astro` i `CardPage.tsx` z `useCardPage`, wybory poziomu i kategorii, róg profilu, `how-it-works.astro`. Katalog nie ma tagów ani filtra.
- **Backend / API:** absent by design — generowanie działa w przeglądarce.
- **Data:** present — tylko na urządzeniu (`card-settings.ts`, `child-profiles.ts`, `last-used.ts`, `catalog-badges.ts`, `card-summary.ts`); kategorie obiektów z `OBJECT_CATEGORIES` (w tym sezonowa „Boże Narodzenie” 15.11–6.01); katalog postaci ma sezonowych Mikołaja, renifera i bałwanka.
- **Auth:** absent by design — PRD: jeden lokalny rodzic.
- **Deploy / infra:** present — CI (lint, test, check, build, smoke), Playwright e2e na Chromium; dwa środowiska (`main` = staging, `prod`).
- **Observability:** partial — dzienniki platformy, bez śledzenia błędów aplikacji.

## Foundations

Brak. Katalog kart, pamięć paska i postać przy poleceniu już istnieją (Baseline); tagi dochodzą jako S-43 po kartach, żeby od razu objęły wszystkie.

## Slices

### S-42: Karty kodowania

- **Outcome:** Rodzic otwiera z katalogu karty kodowania, wybiera poziom, generuje kartę A4 z kratką, przeszkodami, postacią i metą, na której dziecko zapisuje strzałkami najkrótszą drogę albo wykonuje podane strzałki, podgląda ją i drukuje także z telefonu; profil pamięta pasek, a postać stoi przy poleceniu. Karta ma miniaturę i opis w „Jak to działa”; tagi dochodzą w S-43 (M-7).
- **Change ID:** coding-card
- **PRD refs:** MS-01, FR-014, FR-017, FR-030, US-05, US-08
- **Prerequisites:** —
- **Parallel with:** S-47, S-48, S-49
- **Blockers:** —
- **Unknowns:**
  - Poziomy, wielkość kratki i oba warianty (zapisz strzałki, wykonaj strzałki): przełącznik czy wynik poziomu? Rozstrzyga makieta przed US i FR w PRD (PRD „Po MVP”, „Karty kodowania”). — Owner: user. Block: yes (przed `/10x-plan`).
- **Risk:** Rodzaj wybrany 2026-11-15 (pierwszy szkic w rozmowie); kształt nieustalony. Jedna odpowiedź wymaga jednej najkrótszej drogi, więc generator odrzuca kratki z dwiema drogami tej samej długości; może użyć wyszukiwania drogi z labiryntu. Trzy kolejne karty M-7 to osobne slice'y (S-47 do S-49).
- **Status:** proposed

### S-47: Nowa karta a (rodzaj do ustalenia)

- **Outcome:** Rodzic otwiera z katalogu nowy rodzaj karty (do ustalenia), wybiera poziom, generuje kartę A4, podgląda ją i drukuje także z telefonu; profil pamięta pasek, a postać stoi przy poleceniu. Karta ma miniaturę i opis w „Jak to działa”; tag dochodzi w S-43.
- **Change ID:** m7-card-a
- **PRD refs:** MS-02, FR-014, FR-017, FR-030, US-05, US-08
- **Prerequisites:** —
- **Parallel with:** S-42, S-48, S-49
- **Blockers:** —
- **Unknowns:**
  - Jaki to rodzaj karty? Kandydaci z „Po tym kamieniu” (pieniądze ciąg dalszy; połącz kropki i znajdź różnice czekają na rysunki wektorowe). Slice zmienia nazwę i Change ID po decyzji. — Owner: user. Block: yes (przed `/10x-new`).
- **Risk:** Rodzaj nieustalony; slice jest miejscem w kamieniu, nie planem. Każda nowa karta potrzebuje US/FR w PRD, makiety i jednej sprawdzalnej odpowiedzi.
- **Status:** blocked

### S-48: Nowa karta b (rodzaj do ustalenia)

- **Outcome:** Rodzic otwiera z katalogu nowy rodzaj karty (do ustalenia), wybiera poziom, generuje kartę A4, podgląda ją i drukuje także z telefonu; profil pamięta pasek, a postać stoi przy poleceniu. Karta ma miniaturę i opis w „Jak to działa”; tag dochodzi w S-43.
- **Change ID:** m7-card-b
- **PRD refs:** MS-02, FR-014, FR-017, FR-030, US-05, US-08
- **Prerequisites:** —
- **Parallel with:** S-42, S-47, S-49
- **Blockers:** —
- **Unknowns:**
  - Jaki to rodzaj karty? Kandydaci z „Po tym kamieniu” (pieniądze ciąg dalszy; połącz kropki i znajdź różnice czekają na rysunki wektorowe). Slice zmienia nazwę i Change ID po decyzji. — Owner: user. Block: yes (przed `/10x-new`).
- **Risk:** Rodzaj nieustalony; slice jest miejscem w kamieniu, nie planem. Każda nowa karta potrzebuje US/FR w PRD, makiety i jednej sprawdzalnej odpowiedzi.
- **Status:** blocked

### S-49: Nowa karta c (rodzaj do ustalenia)

- **Outcome:** Rodzic otwiera z katalogu nowy rodzaj karty (do ustalenia), wybiera poziom, generuje kartę A4, podgląda ją i drukuje także z telefonu; profil pamięta pasek, a postać stoi przy poleceniu. Karta ma miniaturę i opis w „Jak to działa”; tag dochodzi w S-43.
- **Change ID:** m7-card-c
- **PRD refs:** MS-02, FR-014, FR-017, FR-030, US-05, US-08
- **Prerequisites:** —
- **Parallel with:** S-42, S-47, S-48
- **Blockers:** —
- **Unknowns:**
  - Jaki to rodzaj karty? Kandydaci z „Po tym kamieniu” (pieniądze ciąg dalszy; połącz kropki i znajdź różnice czekają na rysunki wektorowe). Slice zmienia nazwę i Change ID po decyzji. — Owner: user. Block: yes (przed `/10x-new`).
- **Risk:** Rodzaj nieustalony; slice jest miejscem w kamieniu, nie planem. Każda nowa karta potrzebuje US/FR w PRD, makiety i jednej sprawdzalnej odpowiedzi.
- **Status:** blocked

### S-43: Tagi i filtr kart w katalogu

- **Outcome:** Rodzic na stronie głównej widzi wszystkie rodzaje kart z tagami (np. logika, liczby, rysowanie, pisanie) i jednym wyborem zawęża katalog do kart z wybranym tagiem; „Wszystkie” jest domyślne i wybór nie zmienia stron generatorów ani profilu. Filtr jest używalny na telefonie (miniatury w dwóch kolumnach), a katalog nadal mieści wszystkie karty bez filtra.
- **Change ID:** card-tags-filter
- **PRD refs:** MS-03, FR-014, US-05
- **Prerequisites:** S-42, S-47, S-48, S-49
- **Parallel with:** —
- **Blockers:** —
- **Unknowns:**
  - Jakie tagi i która karta ma które? Rozstrzyga rozmowa przed planem; tagi dostają wszystkie karty naraz, także cztery nowe z M-7 i dwie z M-6 (krzyżówka, zegar). — Owner: user. Block: no.
  - Filtr jedno- czy wielokrotny, i czy zapamiętywany w profilu/na urządzeniu? Glosariusz (`context/domain/glossary.md`) dziś zabrania „tagów” i „filtrów” przy kategoriach obiektów, więc nazwa filtra musi się od niej odróżniać. — Owner: user. Block: no.
  - ~~Czy sezonowy tag „Święta” wchodzi do filtra?~~ Zamknięte 2026-11-17 kodem: sezon to kategoria obiektów „Boże Narodzenie” z oknem 15.11–6.01 (`src/lib/symmetry/template-format.ts:30`), nie tag, więc filtr kart nie potrzebuje tagu „Święta”.
- **Risk:** Katalog ma dziś stały kształt, a testy e2e i plakietki zakładają stałą liczbę miniatur; filtr zmienia ich widoczność. Tagi kart i kategorie obiektów to dwa różne pojęcia i trzeba je odróżnić w nazwach, żeby rodzic i kod ich nie mylił.
- **Status:** proposed

### S-55: „Skopiuj obrazek” z kształtami niesymetrycznymi

- **Outcome:** Rodzic dostaje na karcie „Skopiuj obrazek” także obrazki niesymetryczne lewo–prawo (np. skarpeta, laska cukrowa, ryba, dinozaur) z katalogu kształtów dyktanda, w wybranej kategorii i z kolorami po włączeniu kolorów; karta nadal ma jedną sprawdzalną odpowiedź i mieści się na A4.
- **Change ID:** copy-drawing-asymmetric-shapes
- **PRD refs:** MS-07, FR-037, FR-038, US-27, US-28
- **Prerequisites:** —
- **Parallel with:** S-42, S-47, S-48, S-49, S-52, S-54
- **Blockers:** —
- **Unknowns:**
  - Wchodzą wszystkie kształty dyktanda (11 istniejących i świąteczne), czy tylko wybrane? Wszystkie zmieniają losowanie „Wszystkie” i każdy potrzebuje koloru. Issue drpc1/printo-kids#379. — Owner: user. Block: yes (przed `/10x-new`).
- **Risk:** Klucz karty i sprawdzenie zakładają szablon symetrii (`src/lib/copy-drawing/card.ts`, `generate.ts`); zmiana dotyka też PRD US-27/US-28, Business Logic karty i glosariusza („kształt dyktanda”).
- **Status:** blocked

### S-52: Okno profilu przy wielu kartach

- **Outcome:** Rodzic otwiera okno profilu i widzi ustawienia kart w postaci, która nie rośnie z każdą nową kartą (np. tylko karty używane przez profil albo zwijana lista), a każda pozycja nadal prowadzi do strony karty; okno zostaje małe i używalne na telefonie.
- **Change ID:** profile-card-summary
- **PRD refs:** MS-04, FR-017, US-08
- **Prerequisites:** S-42, S-47, S-48, S-49
- **Parallel with:** S-54
- **Blockers:** —
- **Unknowns:**
  - Co to znaczy „przebudować profil”: tylko skrócić podsumowanie (US-08: „tylko do odczytu”), czy zmienić też to, co profil pamięta? — Owner: user. Block: yes (przed `/10x-new`).
- **Risk:** Podsumowanie jest dziś listą wszystkich rodzajów kart; z 16 kartami okno zajmuje ekran. Zmiana dotyka US-08 i danych zapisanych w profilach, więc stare profile muszą się czytać bez migracji.
- **Status:** blocked

### S-54: Pory roku

- **Outcome:** Rodzic wybiera obiekty i postacie kolejnej pory roku (np. wiosny) w jej oknie dat na kartach z szablonów i przy poleceniu, tak jak świąteczne z M-6, i drukuje kartę jako jedną stronę A4.
- **Change ID:** seasons-objects-characters
- **PRD refs:** MS-06, FR-028, FR-029, FR-012, US-19, US-20
- **Prerequisites:** —
- **Parallel with:** S-42, S-47, S-48, S-49, S-52
- **Blockers:** —
- **Unknowns:**
  - Który sezon jako pierwszy i ile pór roku w tym kamieniu (cztery, czy jedna na próbę)? — Owner: user. Block: yes (przed `/10x-new`).
  - Kategoria z oknem dat jak „Boże Narodzenie” (`src/lib/symmetry/template-format.ts:30`) czy jedna ciągła kategoria pory roku? Mechanizm okna istnieje (`src/lib/date-window.ts`). — Owner: user. Block: no.
- **Risk:** Każdy nowy obiekt musi przejść reguły czterech kart (jedno rozwiązanie nonogramu, obrys dyktanda bez styku) i być czytelny w połowie 4×12; postacie sezonowe potrzebują rysunków i praw.
- **Status:** blocked

### S-53: „Jak to działa” przy wielu kartach

- **Outcome:** Rodzic otwiera „Jak to działa” i szybko znajduje opis właściwej karty (np. zwijane sekcje, spis treści albo krótsze opisy), choć kart jest 16; zasada profilu, poziomów i postaci zostaje na górze.
- **Change ID:** how-it-works-m7
- **PRD refs:** MS-05, US-22, FR-031
- **Prerequisites:** S-42, S-47, S-48, S-49, S-43
- **Parallel with:** S-52, S-54
- **Blockers:** —
- **Unknowns:**
  - Jak skrócić: zwijanie, osobne strony kart, czy krótsze opisy? PRD (US-05) trzyma opis rodzaju w `CARD_KINDS`, więc zmiana może dotknąć PRD. — Owner: user. Block: yes (przed `/10x-new`).
- **Risk:** Strona opisuje każdy rodzaj i poziomy w dwóch–trzech zdaniach; skracanie nie może zgubić poprawności opisów poziomów.
- **Status:** blocked

### S-50: Stryker dla kart i filtra M-7

- **Outcome:** Zespół uruchamia Strykera na zakresach z ryzykiem z M-7 (generatory i reguły jednoznaczności kart kodowania i trzech nowych kart, a dla filtra tylko jego logikę, jeśli ją ma) i przegląda ocalałe mutanty pojedynczo (AGENTS.md, „Mutation testing”).
- **Change ID:** stryker-m7-cards
- **PRD refs:** MS-01, MS-02, MS-03
- **Prerequisites:** S-42, S-47, S-48, S-49, S-43, S-54
- **Parallel with:** —
- **Blockers:** —
- **Unknowns:**
  - Które zakresy dostają Strykera? Rozstrzyga się po zbudowaniu kart, na podstawie ryzyk z test-plan.md; zakres wąski (`--mutate "plik:od-do"`), bez ścigania 100%. — Owner: team. Block: no.
- **Risk:** Stryker idzie po kartach i filtrze, bo sprawdza gotowy kod; jak w M-6 jest osobnym slice'em, a nie częścią każdej karty.
- **Status:** proposed

### S-51: Test plan po M-7

- **Outcome:** Zespół ma `context/foundation/test-plan.md` zgodny ze stanem po M-7: nowe karty i filtr w mapie ryzyk, §5 i §5a (zakresy Strykera z S-50), bez nieaktualnych liczb kart.
- **Change ID:** test-plan-m7
- **PRD refs:** MS-01, MS-02, MS-03
- **Prerequisites:** S-42, S-47, S-48, S-49, S-43, S-50, S-52, S-53, S-54
- **Parallel with:** —
- **Blockers:** —
- **Unknowns:** —
- **Risk:** Ostatni slice kamienia: opisuje to, co zbudowały i sprawdziły poprzednie.
- **Status:** proposed

## Backlog Handoff

Issues na GitHubie z etykietą `roadmap-slice` idą za „At a glance” i „Done”. Sekcje „Po tym kamieniu” i „Parked” nie dostają issue, dopóki ich kamień nie jest otwarty. Issue S-42 (#373) i S-43 (#374) już istnieją; dla pozostałych powstaną po wyborze rodzajów kart.

| Roadmap ID | Change ID        | Suggested issue title        | Ready for `/10x-plan` | Notes                                                    |
| ---------- | ---------------- | ---------------------------- | --------------------- | -------------------------------------------------------- |
| S-42       | coding-card      | Karty kodowania              | no                    | Czeka na makietę i US/FR w PRD; potem `/10x-new coding-card` (#373) |
| S-47       | m7-card-a        | Nowa karta (do ustalenia)    | no                    | Czeka na wybór rodzaju                                   |
| S-48       | m7-card-b        | Nowa karta (do ustalenia)    | no                    | Czeka na wybór rodzaju                                   |
| S-49       | m7-card-c        | Nowa karta (do ustalenia)    | no                    | Czeka na wybór rodzaju                                   |
| S-43       | card-tags-filter | Tagi i filtr kart w katalogu | no                    | Czeka na S-42, S-47 do S-49; najpierw lista tagów (#374) |
| S-55       | copy-drawing-asymmetric-shapes | „Skopiuj obrazek” z kształtami niesymetrycznymi | no | Issue #379; czeka na decyzję, które kształty |
| S-52       | profile-card-summary | Okno profilu przy wielu kartach | no | Czeka na S-42, S-47 do S-49 i decyzję, co przebudować |
| S-54       | seasons-objects-characters | Pory roku | no | Czeka na wybór sezonu |
| S-53       | how-it-works-m7 | „Jak to działa” przy wielu kartach | no | Czeka na S-43 i decyzję, jak skrócić |
| S-50       | stryker-m7-cards | Stryker dla kart i filtra M-7 | no                   | Czeka na S-43                                            |
| S-51       | test-plan-m7     | Test plan po M-7             | no                    | Czeka na S-50                                            |

## Open Roadmap Questions

1. **Insight — czemu gotowe paczki PDF nie rozwiązują tego poza skończoną biblioteką?** — Owner: user. Block: no.
2. **Jakie prawa pozwalają pokazać rysunki świątecznych postaci?** — Owner: user. Block: no (PRD Open Questions 3). Skąd rysunki: rozstrzygnięte kodem — Mikołaj, renifer i bałwanek są w katalogu (`public/characters/mikolaj.webp`, `renifer.webp`, `balwanek.webp`; `src/lib/sheet/character.ts`), S-39 `done`; prawa zostają otwarte.
3. ~~**Które dwa (albo trzy) rodzaje kart wchodzą do M-6 obok krzyżówki matematycznej?**~~ — Zamknięte 2026-11-15: zegar (S-41) i karty kodowania (S-42). „Połącz kropki” i „Znajdź różnice” czekają na katalog rysunków wektorowych (PRD „Po MVP”). Wcześniej: Owner: user. Block: S-41, S-42. Kandydaci z „Po tym kamieniu”: karty kodowania, połącz kropki, pieniądze ciąg dalszy; nonogram i dyktando postaci czekają na obrysy postaci.
4. ~~**Czy sezonowe obiekty i postacie są widoczne cały rok, czy tylko w sezonie, i czy sezon to kategoria, czy tag?**~~ — Zamknięte 2026-11-17 kodem: sezon to kategoria „Boże Narodzenie” z oknem 15.11–6.01 (`src/lib/symmetry/template-format.ts:30`), postacie mają to samo okno (`CHRISTMAS_WINDOW` w `src/lib/sheet/character.ts`), a zapamiętana sezonowa postać nie znika poza oknem. Filtr S-43 nie musi mieć tagu „Święta”.
5. ~~**Czy czwarta nowa karta wchodzi do M-6 (obok krzyżówki, S-41 i S-42)?**~~ — Zamknięte 2026-11-17: nie. M-6 dowiózł dwie nowe karty (krzyżówka, zegar); katalog ma 12 rodzajów (`CARD_KINDS` w `src/lib/cards.ts`: dziesięć z M-5 + `krzyzowka` + `zegar`). Karty kodowania i kolejne karty przeszły do M-7.
6. **Czy poziomy „Kto ma więcej?” i „Który nie pasuje” pasują dziecku, a wygląd monety i banknotu jest czytelny bez kopiowania wzorów NBP?** — Owner: user. Block: no (PRD Open Questions 14).
9. **Które pory roku i w jakiej kolejności?** — Owner: user. Block: S-54. Rozszerza pytanie 7.
8. **Jakie trzy rodzaje kart wchodzą do M-7 obok kart kodowania?** — Owner: user. Block: S-47, S-48, S-49. Kandydaci w „Po tym kamieniu”.
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

Nie wlicza się do „Done when” M-7. Kandydaci na trzy karty M-7 (S-47 do S-49) są tu, dopóki nie zostaną wybrani; karty kodowania to S-42.

Wspólna umowa z labiryntem: algorytm, jedna sprawdzalna odpowiedź (poza wyjątkiem szlaczków), poziomy bez nazw wieku, jedna strona A4, czarny druk z kolorową postacią przy poleceniu, bez modelu językowego.

- **Obrysy postaci na kratce** — warunek dla „Połącz kropki” i „Nonogram i dyktando postaci”. Makieta z 2026-10-26: 11 stałych postaci da się narysować na kratce ok. 15×15.
- **Rysunki wektorowe do kart obrazkowych** — warunek dla „Połącz kropki” i „Znajdź różnice” (decyzja 2026-11-15): pikselowe sylwetki z szablonów są za kanciaste; potrzebny katalog prostych rysunków wektorowych albo obrysy postaci.
- **Połącz kropki** — ponumerowane kropki na obrysie rysunku. Czeka na rysunki wektorowe albo obrysy postaci.
- **Znajdź różnice** — dwa rysunki różniące się w kilku szczegółach. Czeka na rysunki wektorowe.
- **Nonogram i dyktando postaci** — rozwiązanie odsłania postać zamiast obiektu z szablonów. Czeka na obrysy.
- **Pieniądze, ciąg dalszy** — jedna kupka i cena („czy wystarczy?”), grosze, reszta.

Kolorowanki oraz działania na liczbach z dopiskiem waluty zostają poza tą listą.

## Milestone History

- **M-6: Sezonowe postacie i obiekty oraz dwie nowe karty (krzyżówka matematyczna, zegar)** (`seasonal-cards-and-catalog-filter`) — closed 2026-11-17. Rodzic wybiera świąteczne obiekty (kategoria „Boże Narodzenie”, 15.11–6.01) i świąteczne postacie, generuje i drukuje krzyżówkę matematyczną i zegar; „Jak to działa”, Stryker i test-plan są zaktualizowane; katalog ma 12 rodzajów, wydane na produkcji jako v2026.11.17. Slice'y S-38 do S-41 oraz S-44 do S-46; S-42 (karty kodowania) i S-43 (filtr katalogu) przeszły do M-7 (2026-11-16).
- **M-5: Cztery nowe rodzaje kart: pieniądze, który nie pasuje, kopiowanie rysunku i szlaczki** (`four-new-card-kinds`) — closed 2026-11-13. Rodzic generuje i drukuje cztery nowe rodzaje kart („Kto ma więcej?”, „Który nie pasuje”, „Skopiuj rysunek na kratce”, szlaczki) z własnymi poziomami bez wieku, profil pamięta pasek każdej z nich, a postać stoi przy poleceniu; katalog ma dziesięć rodzajów, wydane na produkcji jako v2026.11.13. Slice'y S-33 do S-37.
- **M-4: Poziomy bez wieku, profil pamiętający karty i postać na każdej karcie** (`profile-levels-and-character`) — closed 2026-11-01. Rodzic wybiera poziom każdej karty bez nazw wieku, profil sam pamięta pasek każdej karty i pokazuje go w katalogu, ulubiona postać stoi przy poleceniu na każdej karcie i zmienia się tylko jawnie, a strona „Jak to działa” tłumaczy zasady. Slice'y S-27 do S-32.
- **M-3: Sekwencje, sudoku, nonogram i dyktando graficzne** (`sequences-and-sudoku-cards`) — closed 2026-10-26. Rodzic generuje i drukuje cztery nowe rodzaje kart (sekwencje, sudoku 4×4/6×6/9×9 z kolorami, nonogram i dyktando graficzne) z własnymi poziomami albo rozmiarami, a symetria, nonogram i dyktando biorą obiekty z katalogu 22 szablonów w pięciu kategoriach z wyborem kategorii. S-14 (wiek w profilu) nie wrócił w M-3; zastąpiły go S-28 i S-29 w M-4.
- **M-2: Karta symetrii na A4** (`symmetry-card-a4`) — closed 2026-10-23. Rodzic wybiera rodzaj karty w katalogu, generuje kartę symetrii na poziomie nazwanym wiekiem, włącza kolory i drukuje ją jako jedną stronę A4 także z telefonu. S-14 (wiek i poziomy w profilu) wyjęty z kamienia i odłożony na prośbę użytkownika do czasu, gdy będzie więcej rodzajów kart.
- **M-1: Pierwsza drukowalna karta A4** (`first-printable-a4-maze`) — closed 2026-10-22. Rodzic generuje labirynt na wybranym poziomie, wybiera postać, korzysta z profili dzieci i drukuje kartę jako jedną stronę A4 także z telefonu.

## Done

- **S-45: Rodzic dostaje nowe karty i logikę M-6 sprawdzone mutacjami Strykera na zakresach z ryzykiem (solver krzyżówki, reguły jednoznaczności).** — Archived 2026-11-17 → `context/archive/2026-11-16-stryker-m6-cards/`. Lesson: —.

- **S-38: Rodzic wybiera świąteczne obiekty (np. bombka, choinka z ozdobami, Mikołaj, bałwanek, piernik, gwiazda betlejemska) na kartach symetrii, nonogramu, dyktanda graficznego i „Skopiuj obrazek”, generuje kartę, podgląda ją i drukuje jako jedną stronę A4 także z telefonu. Obiekty dochodzą do katalogu szablonów w trzech rozmiarach (połowa 4×12, 6×15, 9×24) i spełniają reguły każdej z czterech kart (jedno rozwiązanie nonogramu, obrys dyktanda bez styku).** — Archived 2026-11-16 → `context/archive/$C-$id/`. Lesson: —. Wydanie main → prod przed 1.12.2026 idzie osobno i nie jest kryterium zamknięcia slice'a (decyzja 2026-11-16).

- **S-39: Rodzic wybiera świąteczną postać (np. Mikołaj, renifer, bałwanek) z listy postaci przy poleceniu na każdej karcie, w oknie profilu jako ulubioną i na labiryncie przy starcie; postać drukuje się w kolorze jak pozostałe. Lista pokazuje wszystkie postacie bez ucięcia także przy niskiej rozdzielczości.** — Archived 2026-11-16 → `context/archive/$C-$id/`. Lesson: —.

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
- **S-40: Rodzic otwiera z katalogu „Krzyżówkę matematyczną”, wybiera poziom, uruchamia generowanie i dostaje kartę A4 z siatką działań, które krzyżują się we wspólnych polach; część liczb jest wpisana, reszta pusta do uzupełnienia. Widzi podgląd i drukuje kartę jako jedną stronę A4 także z telefonu. Profil pamięta pasek, postać stoi przy poleceniu, karta ma miniaturę i opis w „Jak to działa”; tagi dochodzą w S-43. Generator sprawdza, że każde puste pole ma jedno rozwiązanie.** — Archived 2026-11-14 → `context/archive/2026-11-13-math-crossword-card/`. Lesson: —.
- **S-41: Rodzic otwiera z katalogu „Zegar”, wybiera poziom (Poziom 1–5: od pełnych godzin po co minutę), tryb (Odczytaj, Dorysuj, Połącz) i zapis 24-godzinny, generuje kartę A4 z tarczami zegara ze wskazówkami, podgląda ją i drukuje także z telefonu; profil pamięta poziom, tryb i 24 h, a postać stoi przy poleceniu. Karta ma miniaturę i opis w „Jak to działa”; tagi dochodzą w S-43.** — Archived 2026-11-16 → `context/archive/2026-11-15-clock-card/`. Lesson: —.
- **S-44: Rodzic otwiera ze stopki „Jak to działa” i widzi opisy wszystkich rodzajów kart, poziomy i profil oraz krótką sekcję o świątecznych postaciach i obiektach (15.11–6.01).** — Archived 2026-11-16 → `context/archive/2026-11-16-how-it-works-m6/`. Lesson: —.
- **S-46: Zespół otwiera `context/foundation/test-plan.md` i widzi stan po M-6: nowe karty i sezonową zawartość w mapie ryzyk (§2), w tym, co jest już sprawdzone (§5), w zakresach Strykera (§5a) i w podręczniku (§6), bez nieaktualnych liczb kart.** — Archived 2026-11-17 → `context/archive/2026-11-17-test-plan-m6/`. Lesson: —.
