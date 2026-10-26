---
project: PrintoKids
version: 1
status: draft
created: 2026-09-27
updated: 2026-10-26
prd_version: 5
main_goal: low-complexity
top_blocker: capacity
milestone_id: profile-levels-and-character
milestone_seq: 4
milestone_status: open
---

# Roadmap: PrintoKids

> Derived from `context/foundation/prd.md` (v5) + auto-researched codebase baseline.
> Edit-in-place; archive when superseded.
> Slices below are listed in dependency order. The "At a glance" table is the index.

## Milestone

**M-4: Poziomy bez wieku, profil pamiętający karty i postać na każdej karcie** — Status: open

- **Intent:** Sześć rodzajów kart działa, ale poziomy są nazwane wiekiem, a profil pamięta tylko postać i poziom labiryntu. M-4 pokazuje, że rodzic wybiera poziom bez oceniania dziecka wiekiem, profil sam pamięta pasek każdej karty, ulubiona postać pojawia się przy poleceniu na każdej karcie, a zasady tłumaczą krótkie podpowiedzi w miejscu wyboru. Nowych rodzajów kart nie ma.
- **Source materials:** `context/foundation/prd.md` (v5)
- **Done when:** every F-NN and S-NN in „At a glance” is `done`. Sekcje „Po tym kamieniu” i „Parked” nie wliczają się.
- **Scope anchors:** FR-001, FR-006, FR-007, FR-009, FR-016, FR-017, FR-020, FR-027, FR-030, FR-031; US-03, US-05, US-07, US-08, US-11, US-18, US-21, US-22; Business Logic „Poziomy”, „Profil i zapamiętane ustawienia”, „Postać na kartach”. Zadania kart (generatory, reguły jednej odpowiedzi, druk) zostają bez zmian.

## Vision recap

Rodzic przedszkolaka wyczerpał darmowe labirynty o właściwej skali trudności, a dziecko wciąż chce kolejną kartę. Brakuje sposobu, żeby wygenerować nową kartę na właściwym poziomie, gdy skończy się dopasowana gotowa biblioteka. Po trzech kamieniach jest sześć rodzajów kart; M-4 skraca drogę do właściwej karty dla konkretnego dziecka: poziom bez nazwy wieku, ustawienia zapamiętane w profilu, ta sama ulubiona postać na każdej karcie.

## North star

**S-27: Rodzic wybiera poziom każdej karty bez nazw wieku, z krótkim opisem tego, co poziom zmienia** — najmniejszy kawałek, który od razu zmienia każdą kartę z poziomami nazwanymi wiekiem i nie dotyka zapisanych danych. Pokazuje, czy numerowane poziomy i łatwy / średni / trudny z opisem są dla rodzica czytelne, zanim profil zacznie je zapamiętywać.

> Gwiazda przewodnia (north star) — tu: pierwszy kompletny kawałek, którego dowiezienie pokazuje, że kamień ma sens. Stoi możliwie wcześnie, bo reszta (pamięć profilu, podsumowania, podpowiedzi) pokazuje te same etykiety.

## At a glance

| ID   | Change ID                    | Outcome (user can …)                                                                                                                                                               | Prerequisites    | PRD refs                                            | Status   |
| ---- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | --------------------------------------------------- | -------- |
| S-27 | level-labels-without-age     | Rodzic wybiera Poziom 1…N w labiryncie, symetrii i sekwencjach oraz łatwy / średni / trudny w dyktandzie, a każdy poziom na liście ma pół zdania o tym, co zmienia                 | —                | FR-001, FR-016, FR-020, FR-027, US-07, US-11, US-18 | ready    |
| S-28 | card-settings-memory         | Rodzic wraca na stronę dowolnej karty i ma na pasku ustawienia, które ostatnio wybrał dla tej karty: w aktywnym profilu (zapis od razu, „Zapamiętane dla {imię}”) albo bez profilu | —                | US-08, FR-017, FR-006                               | ready    |
| S-29 | profile-window-summary       | Rodzic tworzy profil z samym imieniem i postacią, widzi w oknie profilu podsumowanie ustawień kart tylko do odczytu, a w katalogu plakietki z poziomem przy miniaturach            | S-28             | FR-007, FR-017, US-05, US-08                        | proposed |
| S-30 | character-speaks-instruction | Rodzic wybiera postać na pasku każdej karty, a na symetrii, sekwencjach, sudoku, nonogramie i dyktandzie postać w kolorze stoi przy poleceniu i mówi je w dymku                    | —                | US-21, FR-030, US-03                                | ready    |
| S-31 | favorite-character-explicit  | Rodzic przy aktywnym profilu zmienia postać tylko na tę wizytę albo jednym wyborem „Ustaw jako ulubioną”; bez profilu ostatnia postać jest wspólna dla wszystkich kart             | S-28, S-30       | FR-009, US-03, US-08, US-22                         | proposed |
| S-32 | how-it-works-page            | Rodzic otwiera ze stopki krótką stronę „Jak to działa” z zasadą poziomów, profilu i postaci                                                                                        | S-27, S-29, S-31 | US-22, FR-031                                       | proposed |

## Streams

Navigation aid — groups items that share a Prerequisites chain. Canonical ordering still lives in the dependency graph below; this table is the proposed reading order across parallel tracks.

| Stream | Theme   | Chain                    | Note                                                                                              |
| ------ | ------- | ------------------------ | ------------------------------------------------------------------------------------------------- |
| A      | Poziomy | `S-27`                   | Gwiazda przewodnia; najmniejsza zmiana, bez zapisanych danych.                                    |
| B      | Profil  | `S-28` → `S-29` → `S-32` | Pamięć ustawień, potem jej pokazanie; strona „Jak to działa” łączy strumienie A, B i C na końcu.  |
| C      | Postać  | `S-30` → `S-31`          | Postać przy poleceniu niezależnie od profilu; jawna ulubiona dołącza do strumienia B przy `S-28`. |

## Baseline

What's already in place in the codebase as of `2026-10-26` (z kodu na main po M-3 i z `tech-stack.md`).
Foundations below assume these are present and do NOT re-scaffold them.

- **Frontend:** present — katalog sześciu kart na `/` (`src/lib/cards.ts`), wspólna powłoka `GeneratorShell.astro`, strony labiryntu, symetrii, sekwencji, sudoku, nonogramu i dyktanda (`*Generator.tsx`), róg profilu `ProfileCorner.tsx` na każdej stronie. Etykiety poziomów nazwane wiekiem siedzą w `src/lib/{maze,symmetry,sequence,dictation}/levels.ts`; sudoku i nonogram mają już łatwy / średni / trudny.
- **Backend / API:** absent by design — generowanie działa w przeglądarce, bez endpointu.
- **Data:** partial — tylko na urządzeniu: `src/lib/last-used.ts` i `src/lib/child-profiles.ts` pamiętają postać i poziom labiryntu. Ustawienia pozostałych kart (poziom, kolory, kategoria, rozmiar, „Kształty / Cyfry”) żyją w stanie strony. Odczyt jest tolerancyjny (zły wpis → wartość domyślna), więc nowe pola dochodzą bez migracji.
- **Auth:** absent by design — PRD: jeden lokalny rodzic.
- **Deploy / infra:** present — CI (lint, test, check, build, smoke) i Playwright e2e. `npm test` wylicza pliki testów jawnie, więc nowe pliki testów trzeba dopisać do skryptu.
- **Observability:** partial — dzienniki platformy, bez śledzenia błędów aplikacji.

## Foundations

Brak. Zapis na urządzeniu już istnieje (Baseline: Data), a każda karta ma pasek i róg profilu. Kształt zapisu ustawień per karta powstaje w pierwszym kawałku, który go używa (S-28).

## Slices

### S-27: Poziomy bez wieku

- **Outcome:** Rodzic wybiera Poziom 1–6 w labiryncie, Poziom 1–4 w symetrii i sekwencjach oraz łatwy / średni / trudny w dyktandzie; każdy wiersz listy poziomów (także w sudoku i nonogramie) ma pół zdania o tym, co zmienia poziom. Zapisane identyfikatory poziomów zostają, więc profile i ostatnie parametry wczytują się bez zmian.
- **Change ID:** level-labels-without-age
- **PRD refs:** FR-001, FR-016, FR-020, FR-027, US-07, US-11, US-18
- **Prerequisites:** —
- **Parallel with:** S-28, S-29, S-30, S-31
- **Blockers:** —
- **Unknowns:**
  - Jak brzmią opisy poziomów (pół zdania na poziom, sześć kart)? Rozstrzyga makieta listy przed planem. — Owner: user. Block: no.
  - Czy lista ma pokazywać obok opisu typowy wiek? PRD Open Questions 12; dziś: nie. — Owner: user. Block: no.
- **Risk:** Etykieta poziomu pojawia się też w profilu (wybór poziomu labiryntu przy tworzeniu i edycji), w testach e2e i w miniaturach; zmiana tylko na pasku zostawiłaby stare nazwy w oknie profilu. Dzieli komponenty wyboru poziomu z S-28.
- **Status:** ready

### S-28: Profil i ostatnie parametry pamiętają ustawienia każdej karty

- **Outcome:** Rodzic wraca na stronę dowolnej z sześciu kart i ma na pasku ustawienia, które ostatnio wybrał dla tej karty (tabela w PRD Business Logic „Profil i zapamiętane ustawienia”): przy aktywnym profilu każda zmiana zapisuje się w profilu od razu i potwierdza ją krótki komunikat „Zapamiętane dla {imię}”; bez profilu urządzenie pamięta je osobno dla każdej karty. Karta, której profil jeszcze nie używał, startuje z ustawieniami domyślnymi. Stare profile i ostatnie parametry nadal się wczytują, a dawny poziom zostaje poziomem labiryntu.
- **Change ID:** card-settings-memory
- **PRD refs:** US-08, FR-017, FR-006
- **Prerequisites:** —
- **Parallel with:** S-27, S-30
- **Blockers:** —
- **Unknowns:**
  - Co z folderem `context/changes/profile-age-and-levels` (badanie dawnego kształtu z wiekiem)? Rekomendacja: zarchiwizować jako zastąpiony przez ten kawałek, a jego opis dzisiejszego zapisu wykorzystać w badaniu. — Owner: team. Block: no.
  - Czy zmiana na pasku przy pokazanej karcie ma się zapisać od razu, czy dopiero przy Generuj? PRD: od razu. — Owner: team. Block: no.
- **Risk:** Największy kawałek kamienia: nowy kształt zapisu dotyka sześciu stron i dziś działającego zapisu labiryntu. Ryzykiem jest zepsucie wczytania starych profili i wyścig wczytywania profilu z pierwszym Generuj (na nonogramie był już błąd przycisku Poziom podczas wczytywania profilu). Edytuje te same strony co S-27 i S-30, więc kolejność scalania trzeba uzgodnić.
- **Status:** ready

### S-29: Okno profilu z podsumowaniem i plakietki w katalogu

- **Outcome:** Rodzic tworzy profil, podając tylko imię i postać; okno profilu nie ma już kontrolek poziomu, pokazuje jedno zdanie o zasadzie i podsumowanie ustawień kart tylko do odczytu („Labirynt: Poziom 4 · Nonogram: średni, Zwierzęta”), z których każda pozycja prowadzi do strony karty. W katalogu przy wybranym profilu każda miniatura ma plakietkę z zapamiętanym poziomem.
- **Change ID:** profile-window-summary
- **PRD refs:** FR-007, FR-017, US-05, US-08
- **Prerequisites:** S-28
- **Parallel with:** S-27, S-30
- **Blockers:** —
- **Unknowns:**
  - Jak wygląda plakietka na miniaturze na telefonie (2 kolumny) i dla sudoku („6×6 · średni”)? Rozstrzyga makieta przed planem. — Owner: user. Block: no.
- **Risk:** Usunięcie wyboru poziomu z okna profilu zmienia znany rodzicowi przepływ tworzenia profilu; dawne profile z poziomem muszą pokazać go w podsumowaniu jako poziom labiryntu. Katalog jest stroną renderowaną po stronie serwera, a profil żyje w przeglądarce, więc plakietki dochodzą po wczytaniu.
- **Status:** proposed

### S-30: Postać mówi polecenie na każdej karcie

- **Outcome:** Rodzic widzi pasek „Postać” na stronie każdej karty. Na symetrii, sekwencjach, sudoku, nonogramie i dyktandzie wybrana postać (z katalogu albo własny obrazek) stoi w kolorze przy zdaniu polecenia, a polecenie jest w jej dymku; przy „Bez postaci” zostaje samo polecenie. Zadanie, odpowiedź, druk na jednej stronie A4 i margines 10 mm zostają bez zmian.
- **Change ID:** character-speaks-instruction
- **PRD refs:** US-21, FR-030, US-03
- **Prerequisites:** —
- **Parallel with:** S-27, S-28, S-29
- **Blockers:** —
- **Unknowns:**
  - Jak wygląda dymek i gdzie stoi postać względem polecenia na każdej z pięciu kart, także na telefonie? Rozstrzyga makieta przed planem. — Owner: user. Block: no.
  - Prawa do postaci (PRD Open Questions 3) blokują publikację szerszego katalogu, nie planowanie. — Owner: user. Block: no.
- **Risk:** Postać zabiera wysokość nad zadaniem; najciaśniejsze są trudny nonogram (kratka 7 mm) i trudne dyktando z długą listą poleceń, które dziś wypełniają stronę. Pasek „Postać” na pięciu nowych stronach dzieli pliki z S-27 i S-28.
- **Status:** ready

### S-31: Ulubiona postać zmienia się tylko jawnie

- **Outcome:** Rodzic przy aktywnym profilu wybiera inną postać na pasku tylko na bieżącą wizytę na stronie; pod listą widzi „Tylko na tę kartę” i może jednym wyborem „Ustaw jako ulubioną {imię}” zapisać ją w profilu. Przy następnym wejściu wraca ulubiona. Bez profilu ostatnio użyta postać jest wspólna dla wszystkich kart.
- **Change ID:** favorite-character-explicit
- **PRD refs:** FR-009, US-03, US-08, US-22
- **Prerequisites:** S-28, S-30
- **Parallel with:** S-27, S-29
- **Blockers:** —
- **Unknowns:** —
- **Risk:** Zmienia znaczenie dzisiejszego zapisu ulubionych w profilu (postać i poziom razem) na zapis samej postaci; dawny przycisk zapisu ulubionych musi zniknąć bez utraty możliwości zapisania własnego obrazka jako ulubionej.
- **Status:** proposed

### S-32: Strona „Jak to działa”

- **Outcome:** Rodzic otwiera ze stopki krótką stronę „Jak to działa”, która tłumaczy całą zasadę: poziomy bez wieku, profil pamiętający pasek każdej karty, ulubiona postać zmieniana jawnie i postać przy poleceniu. Bez samouczka i bez okna pomocy.
- **Change ID:** how-it-works-page
- **PRD refs:** US-22, FR-031
- **Prerequisites:** S-27, S-29, S-31
- **Parallel with:** —
- **Blockers:** —
- **Unknowns:** —
- **Risk:** Strona opisuje zachowanie z trzech wcześniejszych kawałków; pisana wcześniej rozjedzie się z tym, co rodzic widzi. Pozostałe podpowiedzi z US-22 wchodzą razem ze swoimi kawałkami (opis poziomu w S-27, „Zapamiętane dla” w S-28, zdanie w oknie profilu w S-29, „Tylko na tę kartę” w S-31).
- **Status:** proposed

## Backlog Handoff

Issues na GitHubie z etykietą `roadmap-slice` idą za „At a glance” i „Done”. Zmiana statusu plasterka wymaga tej samej zmiany w issue: zamknąć zrobione, otworzyć nowe z aktywnego kamienia, `status:ready` tylko gdy wiersz poniżej mówi yes. Sekcje „Po tym kamieniu” i „Parked” nie dostają issue, dopóki ich kamień nie jest otwarty.

| Roadmap ID | Change ID                    | Suggested issue title                                         | Ready for `/10x-plan` | Notes                                                                                      |
| ---------- | ---------------------------- | ------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------ |
| S-27       | level-labels-without-age     | Poziomy bez wieku, z opisem na liście                         | yes                   | Run `/10x-new level-labels-without-age`, potem `/10x-plan`. Gwiazda przewodnia             |
| S-28       | card-settings-memory         | Profil i ostatnie parametry pamiętają ustawienia każdej karty | yes                   | Run `/10x-new card-settings-memory`, potem `/10x-plan`. Zastępuje `profile-age-and-levels` |
| S-29       | profile-window-summary       | Okno profilu z podsumowaniem i plakietki w katalogu           | no                    | Czeka na S-28                                                                              |
| S-30       | character-speaks-instruction | Postać mówi polecenie na każdej karcie                        | yes                   | Run `/10x-new character-speaks-instruction`, potem `/10x-plan`. Najpierw makieta dymka     |
| S-31       | favorite-character-explicit  | Ulubiona postać zmienia się tylko jawnie                      | no                    | Czeka na S-28 i S-30                                                                       |
| S-32       | how-it-works-page            | Strona „Jak to działa”                                        | no                    | Czeka na S-27, S-29 i S-31                                                                 |

## Open Roadmap Questions

1. **Insight — czemu gotowe paczki PDF nie rozwiązują tego poza skończoną biblioteką?** — Owner: user. Block: no.
2. **Jakie jest źródło dostarczonych postaci i jakie prawa pozwalają użyć ich w produkcie?** — Owner: user. Block: no dla planowania; publikacja postaci na wszystkich kartach (S-30) zwiększa skalę tego pytania (PRD Open Questions 3).
3. **Czy startowe wartości poziomów symetrii, sekwencji, sudoku, nonogramu i dyktanda pasują dziecku?** — Owner: user. Block: no. PRD Open Questions 5, 9 i 11.
4. **Czy lista poziomów ma pokazywać obok opisu typowy wiek?** — Owner: user. Block: no. PRD Open Questions 12; dotyczy S-27.

## Parked

- **„Zacznij od nowa” w oknie profilu (FR-032)** — Why parked: nice-to-have; to samo da się zrobić paskiem każdej karty. Naturalne miejsce: po S-29.
- **Postać jako treść zadania (obrysy postaci na kratce)** — Why parked: PRD Po MVP; nonogram i dyktando zostają przy obiektach z szablonów, postać jest w M-4 tylko ozdobą przy poleceniu.
- **Inne typy kart pracy poza sześcioma istniejącymi** — Why parked: PRD §Non-Goals: kolejne rodzaje wchodzą jako osobne kamienie. Lista jest w „Po tym kamieniu”.
- **Samouczek przy pierwszym wejściu i okno pomocy** — Why parked: PRD §Non-Goals; pomoc to podpowiedzi w miejscu wyboru i strona „Jak to działa”.
- **Generowanie albo ocena kart modelem językowym** — Why parked: PRD §Non-Goals; rezultat ma wynikać z jawnych reguł algorytmicznych.
- **Konta rodziców i synchronizacja między urządzeniami** — Why parked: PRD §Non-Goals; ustawienia i profile zostają na urządzeniu.
- **Zapis i archiwum wygenerowanych kart** — Why parked: PRD §Non-Goals; cykl życia karty kończy się po wydruku.
- **Biblioteka gotowych kart (FR-011)** — Why parked: PRD §Non-Goals; nice-to-have poza MVP.

## Po tym kamieniu

Nie wlicza się do „Done when” M-4. Kamień nie jest otwarty. Numery S-10 (`symmetry-worksheet`) i S-14 (`profile-age-and-levels`, zastąpiony przez S-28 i S-29) zostają nieużyte.

Wspólna umowa z labiryntem: algorytm, jedna sprawdzalna odpowiedź, poziomy bez nazw wieku, jedna strona A4, czarny druk z kolorową postacią przy poleceniu, bez modelu językowego.

Bez numeru, ta sama umowa:

- **Obrysy postaci na kratce** — wspólny warunek trzech pozycji niżej. Makieta z 2026-10-26: 11 postaci da się narysować na kratce ok. 15×15, a obrys każdej to jedna zamknięta linia.
- **Połącz kropki** — sylwetka postaci. Czeka na obrysy.
- **Nonogram i dyktando postaci** — rozwiązanie odsłania postać zamiast obiektu z szablonów. Czeka na obrysy.
- **Który nie pasuje** — jedna złamana reguła. Kartka odpada, gdy druga reguła wskazuje inny obrazek.
- **Karty kodowania** — kratka, postać, meta, strzałki, jedna najkrótsza droga.
- **Porównywanie kwot w złotych** — wartość kupek monet, nie liczba sztuk. „Ułóż dokładnie tę kwotę” czeka na jeden układ.

Kolorowanki oraz działania na liczbach z dopiskiem waluty zostają poza tą listą.

## Milestone History

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
