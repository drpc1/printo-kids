---
project: PrintoKids
version: 1
status: draft
created: 2026-09-27
updated: 2026-10-24
prd_version: 3
main_goal: low-complexity
top_blocker: capacity
milestone_id: sequences-and-sudoku-cards
milestone_seq: 3
milestone_status: open
---

# Roadmap: PrintoKids

> Derived from `context/foundation/prd.md` (v3) + auto-researched codebase baseline.
> Edit-in-place; archive when superseded.
> Slices below are listed in dependency order. The "At a glance" table is the index.

## Milestone

**M-3: Sekwencje i sudoku obrazkowe** — Status: open

- **Intent:** Pokazać, że katalog kart rośnie o dwa rodzaje naraz bez przebudowy: karta sekwencji (dziecko uzupełnia brakujące elementy ciągu liczb i kształtów) i karta sudoku 4×4, 6×6 i 9×9 z prostymi kształtami albo cyframi (przebudowane 2026-10-24). Każda ma własną stronę, własne poziomy (sekwencje nazwane wiekiem; sudoku: osobne paski „Rozmiar” i „Poziom”), podgląd i druk jako jedna strona A4, także z telefonu. Dwa strumienie idą równolegle. Profil z wiekiem i poziomami per rodzaj karty (S-14) zostaje poza tym kamieniem.
- **Source materials:** `context/foundation/prd.md` (v3)
- **Done when:** every F-NN and S-NN in „At a glance” is `done`. Sekcje „Po tym kamieniu” i „Parked” nie wliczają się.
- **Scope anchors:** US-10–US-14, FR-019–FR-023, NFR „Karty sekwencji i sudoku spełniają te same granice co labirynt”, Business Logic „Karta sekwencji” i „Karta sudoku”. Labirynt i symetria zostają bez zmian.

## Vision recap

Rodzic przedszkolaka wyczerpał darmowe labirynty o właściwej skali trudności, a dziecko wciąż chce kolejną kartę. Szukanie i ściąganie z wielu stron nie daje nowej karty na tym samym poziomie. Brakuje sposobu, żeby wygenerować nową kartę, gdy skończy się dopasowana gotowa biblioteka. M-3 dokłada dwa kolejne rodzaje kart na tych samych zasadach: algorytm, jedna sprawdzalna odpowiedź, wiek, jedna strona A4.

## North star

**S-16: Rodzic może wygenerować kartę sekwencji, zobaczyć podgląd i wydrukować ją jako jedną stronę A4, także na telefonie** — najmniejszy kompletny przepływ, który dowodzi, że trzeci rodzaj karty przechodzi cały łańcuch (katalog, generowanie z jawną regułą jednej odpowiedzi, podgląd, druk) na własnej stronie. Ryzykiem jest sprawdzenie, że do pustego pola pasuje dokładnie jedna reguła; sudoku powtarza ten wzorzec z innym sprawdzeniem (jedno rozwiązanie).

> North star — tu: najmniejszy kompletny przepływ, którego udane dowiezienie pokazuje, że kamień ma sens. Stoi możliwie wcześnie, bo reszta ma sens tylko jeśli ten przepływ działa.

## At a glance

| ID   | Change ID                      | Outcome (user can …)                                                                                                                                                                                                             | Prerequisites | PRD refs      | Status   |
| ---- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------- | -------- |
| S-16 | sequences-first-printable      | Rodzic może wejść z katalogu na stronę sekwencji, wygenerować kartę z kilkoma ciągami liczb i kształtów z brakującymi elementami i jedną odpowiedzią, zobaczyć podgląd i wydrukować ją jako jedną stronę A4, także na telefonie  | —             | US-10, FR-019 | ready    |
| S-18 | picture-sudoku-first-printable | Rodzic może wejść z katalogu na stronę sudoku, wygenerować planszę 4×4 z czarnymi kształtami (w każdym wierszu brakuje jednego) i jednym rozwiązaniem, zobaczyć podgląd i wydrukować ją jako jedną stronę A4, także na telefonie | —             | US-12, FR-021 | ready    |
| S-17 | sequence-difficulty-levels     | Rodzic może wybrać poziom sekwencji nazwany wiekiem (długość ciągu, rodzaj reguł, liczba pustych pól) na pasku strony sekwencji                                                                                                  | S-16          | US-11, FR-020 | proposed |
| S-19 | picture-sudoku-levels          | Rodzic może wybrać rozmiar sudoku (4×4, 6×6, 9×9) i poziom (łatwy, średni, trudny: liczba pustych pól), a przy 6×6 kształty albo cyfry                                                                                           | S-18          | US-13, FR-022 | proposed |
| S-20 | picture-sudoku-colors          | Rodzic może włączyć kolory kształtów na karcie sudoku; każdy kształt ma stały kolor kredki, domyślnie czarne kontury                                                                                                             | S-18          | US-14, FR-023 | proposed |

## Streams

Navigation aid — groups items that share a Prerequisites chain. Canonical ordering still lives in the dependency graph below; this table is the proposed reading order across parallel tracks.

| Stream | Theme     | Chain                            | Note                                                                                    |
| ------ | --------- | -------------------------------- | --------------------------------------------------------------------------------------- |
| A      | Sekwencje | `S-16` → `S-17`                  | Gwiazda przewodnia kamienia; poziomy dopiero po pierwszej drukowalnej karcie.           |
| B      | Sudoku    | `S-18` → `S-19`, `S-18` → `S-20` | Równolegle do strumienia A; obie pierwsze karty dotykają katalogu (`src/lib/cards.ts`). |

## Baseline

What's already in place in the codebase as of `2026-10-23` (z kodu i z `tech-stack.md`, M-2 zamknięty).
Foundations below assume these are present and do NOT re-scaffold them.

- **Frontend:** present — katalog kart na `/` (`src/components/CardCatalog.astro`, `src/lib/cards.ts` z rodzajami `labirynt` i `symetria`), wspólna powłoka strony generatora (`GeneratorShell.astro`), strony `/labirynt` i `/symetria`, kit `src/components/ui`. Wzorzec strony karty: `SymmetryGenerator.tsx` (Generuj, przycisk poziomu, karta SVG, Drukuj, róg profilu).
- **Backend / API:** absent by design — strona renderowana po stronie serwera, bez endpointu generowania; generowanie działa w przeglądarce.
- **Data:** present — tylko na urządzeniu: ostatnio użyte parametry (`src/lib/last-used.ts`) i profile dzieci (`src/lib/child-profiles.ts`), oba tylko dla postaci i poziomu labiryntu. Poziom symetrii i kolory żyją w stanie strony. Nowe karty trzymają poziom w stanie strony tak samo.
- **Auth:** absent by design — konta usunięte w F-02; PRD: jeden lokalny rodzic.
- **Deploy / infra:** present — CI (lint, test, check, build, smoke). `npm test` wylicza pliki testów jawnie, więc nowe pliki testów trzeba dopisać do skryptu.
- **Observability:** partial — dzienniki platformy, bez śledzenia błędów aplikacji.

Do ponownego użycia bez zmian: druk A4 (`@page`, 210×297, margines 10 mm), układ strony SVG z `src/lib/symmetry/layout.ts` i `sheet.ts` jako wzorzec, przełącznik kolorów z symetrii (dla kolorów sudoku), profil w rogu (bez zmian).

## Foundations

Brak. Katalog kart (F-03) już mieści co najmniej 10 rodzajów, a wzorzec strony karty istnieje (S-12). Każda z pierwszych kart dokłada do niego własny wpis, stronę i miniaturę.

## Slices

### S-16: Karta sekwencji: strona, generowanie, podgląd i druk A4

- **Outcome:** Rodzic może wejść z katalogu na stronę „Sekwencje” (`/sekwencje`), wygenerować kartę z kilkoma ciągami liczb i kształtów, w których brakuje elementów, i jedną odpowiedzią każdego ciągu, zobaczyć podgląd i wydrukować ją jako jedną stronę A4, także na telefonie.
- **Change ID:** sequences-first-printable
- **PRD refs:** US-10, FR-019
- **Prerequisites:** —
- **Parallel with:** S-18
- **Blockers:** —
- **Unknowns:**
  - Które ustawienie dostaje pierwsza wersja? Rekomendacja: jedno stałe, wiersz „5 lat” z tabeli PRD (ciągi 7-polowe, wzór AB/AAB/ABC z kształtami, 1–2 puste pola, 6 ciągów); poziomy dochodzą w S-17. — Owner: team. Block: no.
  - Jak wygląda puste pole do wpisania i jak wygląda liczba w polu na czarnym druku? Rozstrzyga makieta przed planem. — Owner: user. Block: no.
- **Risk:** Sprawdzenie, że do pustego pola pasuje dokładnie jedna reguła z jawnej listy, to jedyne nietrywialne miejsce. Odrzucenie ciągu zbyt często psuje szybkość generowania (limit 5 s) albo zmniejsza różnorodność kart. Pierwszy wpis w `src/lib/cards.ts` i miniatura w `public/thumbnails/` dzielą pliki ze S-18, więc strumienie nie powinny edytować ich jednocześnie bez uzgodnienia.
- **Status:** ready

### S-18: Sudoku 4×4 z kształtami: strona, generowanie, podgląd i druk A4

- **Outcome:** Rodzic może wejść z katalogu na stronę „Sudoku” (`/sudoku`), wygenerować planszę 4×4 z czterema prostymi kształtami jako czarnymi konturami (w każdym wierszu brakuje jednego, miejsce losowe) i jednym rozwiązaniem, zobaczyć podgląd i wydrukować ją jako jedną stronę A4, także na telefonie. Generator i sprawdzenie jednego rozwiązania powstają od razu dla 4×4, 6×6 i 9×9 (bloki 2×2, 2×3, 3×3), ale strona pokazuje tylko 4×4.
- **Change ID:** picture-sudoku-first-printable
- **PRD refs:** US-12, FR-021
- **Prerequisites:** —
- **Parallel with:** S-16
- **Blockers:** —
- **Unknowns:**
  - Jak rysować kształty (koło, kwadrat, trójkąt, serce, gwiazdka, krzyżyk) w SVG, żeby czarny kontur był czytelny i łatwy do odrysowania? Rozstrzyga makieta przed planem. — Owner: user. Block: no.
- **Risk:** Generator musi dawać jedno rozwiązanie. Przy 4×4 z jednym pustym polem w wierszu to wynika z reguły, ale 9×9 z 52 pustymi wymaga solvera liczącego rozwiązania w granicy 5 s, więc solver jest testowany już tutaj. Dzieli z S-16 katalog kart i miniatury.
- **Status:** ready

### S-17: Poziomy sekwencji

- **Outcome:** Rodzic może wybrać poziom sekwencji nazwany wiekiem (4–7 lat: długość ciągu, rodzaj reguł, liczba pustych pól i ciągów) na pasku strony sekwencji.
- **Change ID:** sequence-difficulty-levels
- **PRD refs:** US-11, FR-020
- **Prerequisites:** S-16
- **Parallel with:** S-18, S-19
- **Blockers:** —
- **Unknowns:**
  - Czy startowe wartości z tabeli PRD pasują dziecku? — Owner: user. Block: no. Potwierdza je wydruk (PRD Open Questions 9).
- **Risk:** Każdy poziom musi mieścić się na jednej stronie A4 z marginesem 10 mm, a bogatsze reguły zwiększają szansę na odrzucone ciągi (więcej niż jedna pasująca reguła). Poziom żyje w stanie strony, jak poziom symetrii.
- **Status:** proposed

### S-19: Rozmiary i poziomy sudoku

- **Outcome:** Rodzic może wybrać na pasku strony sudoku rozmiar (4×4, 6×6, 9×9) i poziom (łatwy, średni, trudny: 6×6 — 12/18/22 pustych z 36, 9×9 — 35/45/52 z 81; 4×4 ma jeden poziom), a przy 6×6 przełącznikiem „Kształty / Cyfry” wybrać symbole.
- **Change ID:** picture-sudoku-levels
- **PRD refs:** US-13, FR-022
- **Prerequisites:** S-18
- **Parallel with:** S-16, S-17, S-20
- **Blockers:** —
- **Unknowns:**
  - Czy liczby pustych pól nie są za trudne dla dzieci? — Owner: user. Block: no. Potwierdza wydruk (PRD Open Questions 9).
- **Risk:** Przy 52 pustych z 81 jednoznaczne rozwiązanie jest trudniejsze do wylosowania; generator może potrzebować kilku prób, w granicy 5 s. Kratka 9×9 musi być dość duża, żeby dziecko wpisało cyfrę. Rozmiar i poziom żyją w stanie strony.
- **Status:** proposed

### S-20: Kolory kształtów w sudoku

- **Outcome:** Rodzic może włączyć kolory na karcie sudoku z kształtami; każdy kształt ma jeden stały kolor kredki na całej planszy, a przełącznik nie zmienia planszy. Domyślnie czarne kontury; przy cyfrach przełącznika nie ma.
- **Change ID:** picture-sudoku-colors
- **PRD refs:** US-14, FR-023
- **Prerequisites:** S-18
- **Parallel with:** S-16, S-17, S-19
- **Blockers:** —
- **Unknowns:**
  - Jakie przypisanie kolorów do kształtów? Rekomendacja: kolory kredek z symetrii (czerwony, zielony, żółty, niebieski, pomarańczowy, szary). — Owner: user. Block: no.
- **Risk:** Ukrycie przełącznika przy cyfrach wymaga S-19; jeśli S-20 idzie pierwsze, przełącznik dotyczy tylko 4×4. Pasek strony sudoku dzieli pliki z S-19.
- **Status:** proposed

## Backlog Handoff

Issues na GitHubie z etykietą `roadmap-slice` idą za „At a glance” i „Done”. Zmiana statusu plasterka wymaga tej samej zmiany w issue: zamknąć zrobione, otworzyć nowe z aktywnego kamienia, `status:ready` tylko gdy wiersz poniżej mówi yes. Sekcje „Po tym kamieniu” i „Parked” nie dostają issue, dopóki ich kamień nie jest otwarty.

| Roadmap ID | Change ID                      | Suggested issue title                                           | Ready for `/10x-plan` | Notes                                                                                |
| ---------- | ------------------------------ | --------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------ |
| S-16       | sequences-first-printable      | Karta sekwencji: strona, generowanie, podgląd i druk A4         | yes                   | Run `/10x-new sequences-first-printable`, potem `/10x-plan`. Równolegle do S-18      |
| S-18       | picture-sudoku-first-printable | Sudoku 4×4 z kształtami: strona, generowanie, podgląd i druk A4 | yes                   | Run `/10x-new picture-sudoku-first-printable`, potem `/10x-plan`. Równolegle do S-16 |
| S-17       | sequence-difficulty-levels     | Poziomy sekwencji                                               | no                    | Czeka na S-16                                                                        |
| S-19       | picture-sudoku-levels          | Rozmiary i poziomy sudoku                                       | no                    | Czeka na S-18                                                                        |
| S-20       | picture-sudoku-colors          | Kolory kształtów w sudoku                                       | no                    | Czeka na S-18                                                                        |

## Open Roadmap Questions

1. **Insight — czemu gotowe paczki PDF nie rozwiązują tego poza skończoną biblioteką?** — Owner: user. Block: no.
2. **Jakie jest źródło dostarczonych postaci i jakie prawa pozwalają użyć ich w produkcie?** — Owner: user. Block: no (od 2026-10-24 sudoku nie używa postaci; publikacja szerszego katalogu czeka).
3. **Czy poziom nastolatka ma pokazywać postać?** — Owner: user. Block: no. Issue #54, PRD Open Questions 4. Nie należy do M-3.
4. **Czy startowe wartości poziomów symetrii, sekwencji i sudoku pasują dziecku?** — Owner: user. Block: no. PRD Open Questions 5 i 9.
5. ~~**Czy sudoku obrazkowe uzupełnia się numerem z legendy, czy rysunkiem postaci?**~~ — Zamknięte 2026-10-24: kształty do narysowania albo cyfry, bez postaci (PRD Open Questions 8).
6. **Kiedy wraca S-14 (profil z wiekiem i poziomami per rodzaj karty)?** — Owner: user. Block: no. PRD Open Questions 10.

## Parked

- **S-14: Wiek w profilu i poziomy osobno dla każdego rodzaju karty** — Why parked: odłożone 2026-10-23 do czasu, gdy będzie więcej rodzajów kart i wiadomo, które ustawienia mają sens w profilu. Change ID: `profile-age-and-levels` (jest `change.md` i `research.md`, bez planu). PRD refs: US-08, FR-017; wraca jako slice następnego kamienia. Wcześniej wykluczony z M-2, który zamknięto bez niego.
- **Inne typy kart pracy poza symetrią, sekwencjami i sudoku** — Why parked: PRD §Non-Goals: kolejne rodzaje wchodzą jako osobne kamienie. Lista jest w „Po tym kamieniu”.
- **Generowanie albo ocena kart modelem językowym** — Why parked: PRD §Non-Goals; rezultat ma wynikać z jawnych reguł algorytmicznych.
- **Konta rodziców i synchronizacja między urządzeniami** — Why parked: PRD §Non-Goals; ustawienia i profile zostają na urządzeniu.
- **Zapis i archiwum wygenerowanych kart** — Why parked: PRD §Non-Goals; cykl życia karty kończy się po wydruku.
- **Biblioteka gotowych kart (FR-011)** — Why parked: PRD §Non-Goals; nice-to-have poza MVP.
- **Własny obrazek rodzica (US-02)** — Why parked: świadomie poza MVP, zapisane 2026-10-04. Change ID do odblokowania: `parent-supplied-maze-image`.

## Po tym kamieniu

Nie wlicza się do „Done when” M-3. Kamień nie jest otwarty. Numer S-10 (`symmetry-worksheet`) zostaje nieużyty.

Wspólna umowa z labiryntem: algorytm, jedna sprawdzalna odpowiedź, wiek, jedna strona A4, czarny druk, bez modelu językowego.

Bez numeru, ta sama umowa:

- **Połącz kropki** — sylwetka postaci. Czeka na obrys.
- **Który nie pasuje** — jedna złamana reguła. Kartka odpada, gdy druga reguła wskazuje inny obrazek.
- **Nonogram postaci** — rozwiązanie odsłania postać. Czeka na bitmapę.
- **Karty kodowania** — kratka, postać, meta, strzałki, jedna najkrótsza droga.
- **Porównywanie kwot w złotych** — wartość kupek monet, nie liczba sztuk. „Ułóż dokładnie tę kwotę” czeka na jeden układ.

Kolorowanki oraz działania na liczbach z dopiskiem waluty zostają poza tą listą.

## Milestone History

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
