---
project: PrintoKids
version: 1
status: draft
created: 2026-09-27
updated: 2026-10-22
prd_version: 2
main_goal: low-complexity
top_blocker: capacity
milestone_id: symmetry-card-a4
milestone_seq: 2
milestone_status: open
---

# Roadmap: PrintoKids

> Derived from `context/foundation/prd.md` (v2) + auto-researched codebase baseline.
> Edit-in-place; archive when superseded.
> Slices below are listed in dependency order. The "At a glance" table is the index.

## Milestone

**M-2: Karta symetrii na A4** — Status: open

- **Intent:** Pokazać, że produkt unosi drugi rodzaj karty. Strona główna staje się katalogiem z miniaturami, a każdy rodzaj karty ma własną stronę generatora. Rodzic generuje kartę symetrii (dziecko dorysowuje drugą połowę wzoru na kratce, wiek około 4–7 lat), widzi podgląd i drukuje ją jako jedną stronę A4, także z telefonu. Potem poziomy symetrii, potem wspólny wiek w profilu i poziomy osobno dla każdego rodzaju karty.
- **Source materials:** `context/foundation/prd.md` (v2)
- **Done when:** every F-NN and S-NN in „At a glance” is `done`. Sekcja „Po tym kamieniu” nie wlicza się.
- **Scope anchors:** US-05–US-08, FR-014–FR-017, NFR „Karta symetrii spełnia te same granice co labirynt”, Business Logic „Karta symetrii”. Labirynt zostaje bez zmian.

## Vision recap

Rodzic przedszkolaka wyczerpał darmowe labirynty o właściwej skali trudności, a dziecko wciąż chce kolejną kartę. Szukanie i ściąganie z wielu stron nie daje nowej karty na tym samym poziomie. Brakuje sposobu, żeby wygenerować nową kartę, gdy skończy się dopasowana gotowa biblioteka. M-2 dokłada drugi rodzaj karty na tych samych zasadach: algorytm, jedna sprawdzalna odpowiedź, wiek, jedna strona A4, czarny druk.

## North star

**S-12: Rodzic może wygenerować kartę symetrii, zobaczyć podgląd i wydrukować ją jako jedną stronę A4, także na telefonie** — to najmniejszy kompletny przepływ, który dowodzi, że druga karta działa w całym łańcuchu (katalog, generowanie, podgląd, druk) na własnej stronie. Poziomy i pamięć dochodzą dopiero po nim.

> North star — tu: najmniejszy kompletny przepływ, którego udane dowiezienie pokazuje, że kamień ma sens. Stoi możliwie wcześnie, bo reszta ma sens tylko jeśli ten przepływ działa.

## At a glance

| ID   | Change ID                  | Outcome (user can …)                                                                                                                                              | Prerequisites | PRD refs      | Status      |
| ---- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------- | ----------- |
| F-03 | card-catalog-home          | (foundation) Strona główna to katalog kart z miniaturą labiryntu; labirynt działa bez zmian pod własnym adresem, ze wspólną powłoką strony generatora             | —             | US-05, FR-014 | in-progress |
| S-12 | symmetry-first-printable   | Rodzic może wejść z katalogu na stronę symetrii, wygenerować kartę z jedną odpowiedzią, zobaczyć podgląd i wydrukować ją jako jedną stronę A4, także na telefonie | F-03          | US-06, FR-015 | proposed    |
| S-13 | symmetry-difficulty-levels | Rodzic może wybrać poziom symetrii nazwany wiekiem (kratka, gęstość, oś) na pasku strony symetrii                                                                 | S-12          | US-07, FR-016 | proposed    |
| S-14 | profile-age-and-levels     | Rodzic może zapamiętać w profilu wspólny wiek i osobny poziom każdego rodzaju karty; ostatnie parametry są osobne dla każdego rodzaju; stare dane działają        | S-13          | US-08, FR-017 | proposed    |

## Baseline

What's already in place in the codebase as of `2026-10-22` (z kodu i z `tech-stack.md`, M-1 zamknięty).
Foundations below assume these are present and do NOT re-scaffold them.

- **Frontend:** present — jedna strona `/` z generatorem labiryntu w dużym komponencie React (`src/components/WorksheetGenerator.tsx`, ~455 linii: stan labiryntu, profili, paska, okien dialogowych), układ i `@page` w `WorksheetHome.astro`, kit `src/components/ui`. Brak katalogu kart i osobnych stron generatorów.
- **Backend / API:** absent by design — strona renderowana po stronie serwera, bez endpointu generowania; generowanie działa w przeglądarce.
- **Data:** present — tylko na urządzeniu: ostatnio użyte parametry (`src/lib/last-used.ts`) i profile dzieci (`src/lib/child-profiles.ts`). Oba pamiętają dziś postać i poziom labiryntu; nie ma wspólnego wieku ani poziomów osobnych dla rodzajów kart.
- **Auth:** absent by design — konta usunięte w F-02; PRD: jeden lokalny rodzic.
- **Deploy / infra:** present — CI (lint, test, check, build, smoke). `npm test` wylicza pliki testów jawnie, więc nowe pliki testów trzeba dopisać do skryptu.
- **Observability:** partial — dzienniki platformy, bez śledzenia błędów aplikacji.

Do ponownego użycia bez zmian: druk A4 (`@page`, 210×297, margines 10 mm), profile i ostatnie parametry, katalog postaci (dla labiryntu), `src/components/ui`. Specyficzne dla labiryntu: `src/lib/maze/` (`generate.ts`, `levels.ts`) i `src/lib/sheet/layout.ts`.

## Foundations

### F-03: Katalog kart na stronie głównej

- **Outcome:** (foundation) Strona główna to katalog kart z miniaturą labiryntu; labirynt działa bez zmian pod własnym adresem (`/labirynt`), ze wspólną powłoką strony generatora (profil w rogu, link „Wszystkie karty”, druk).
- **Change ID:** card-catalog-home
- **PRD refs:** US-05, FR-014
- **Unlocks:** S-12
- **Prerequisites:** —
- **Parallel with:** —
- **Blockers:** —
- **Unknowns:**
  - Skąd miniatury? Rekomendacja: statyczne SVG na rodzaj karty, wygenerowane z prawdziwego generatora przy budowaniu, żeby miniatura nie rozjechała się z wyglądem karty. — Owner: team. Block: no.
  - Co z adresem `/` po zmianie? Dziś to labirynt, a sprawdzian HTTP (`npm run smoke`) i CI sprawdzają `/`. Rekomendacja: `/` to katalog, a sprawdzian dostaje też `/labirynt`. — Owner: team. Block: no.
- **Risk:** Najtrudniejsze miejsce kamienia. Strona labiryntu przenosi się z `/` pod `/labirynt`, więc razem z nią muszą pójść `@page` i reguły druku (dziś w `WorksheetHome.astro`), profil w rogu i sprawdzian HTTP. Duży komponent `WorksheetGenerator.tsx` zostaje cały na stronie labiryntu; nie rozbijamy go warunkami, bo drugi rodzaj dostaje własną stronę. Wspólna jest tylko powłoka (profil, link powrotu, układ). Profil wybrany w katalogu musi zostać na stronie generatora (wspólny `localStorage`). Nie zmieniamy ani druku, ani marginesu, ani zapisanych danych; naprawiały je S-09 i S-11. Katalog z jedną miniaturą jest celowo skromny: drugą dokłada S-12. Jeśli plan okaże się za duży, rozdzielić na „labirynt pod własnym adresem” i „katalog”.
- **Status:** in-progress

## Slices

### S-12: Karta symetrii na A4

- **Outcome:** Rodzic może wejść z katalogu na stronę symetrii (`/symetria`), wygenerować kartę z jedną odpowiedzią, zobaczyć podgląd i wydrukować ją jako jedną stronę A4, także na telefonie.
- **Change ID:** symmetry-first-printable
- **PRD refs:** US-06, FR-015
- **Prerequisites:** F-03
- **Parallel with:** —
- **Blockers:** —
- **Unknowns:**
  - Jak wygląda zamalowana kratka i oś na czarnym druku? Rekomendacja: czarne wypełnione kratki, przerywana linia osi, cienka siatka w obu połowach. — Owner: user. Block: no.
  - Które ustawienie dostaje pierwsza wersja? Rekomendacja: jedno stałe, wiersz „5 lat” z tabeli PRD (kratka około 15 mm, 12×16, pionowa oś); poziomy dochodzą w S-13. — Owner: team. Block: no.
- **Risk:** Gwiazda przewodnia. Karta musi mieć odpowiedź wyliczoną i sprawdzoną tą samą funkcją w testach i przed pokazaniem (połowa pusta, nic na osi, wzór ani pusty, ani pełny). Kryteria z US-04 wchodzą do tego plasterka, nie są doklejane później: bez nachodzących się przycisków, jedna strona A4 w szerokości i w długości, margines 10 mm, Brave razem z resztą przeglądarek. Strona symetrii nie ma paska „Postać”. Do katalogu dochodzi miniatura symetrii i link do strony. Profil i ostatnie parametry na tej stronie jeszcze nie pamiętają niczego własnego (S-14). Nowe pliki testów trzeba dopisać do skryptu `npm test`. Wzór nie może wyglądać na losowy szum: gęstość i skupienie kratek decydują, czy dziecko ma co dorysować.
- **Status:** proposed

### S-13: Poziomy symetrii

- **Outcome:** Rodzic może wybrać poziom symetrii nazwany wiekiem (kratka, gęstość, oś) na pasku strony symetrii.
- **Change ID:** symmetry-difficulty-levels
- **PRD refs:** US-07, FR-016
- **Prerequisites:** S-12
- **Parallel with:** —
- **Blockers:** —
- **Unknowns:**
  - Czy startowe wartości z tabeli PRD pasują dziecku? — Owner: user. Block: no. Potwierdza je wydruk, nie planowanie (PRD Open Questions 5).
- **Risk:** Każdy z czterech poziomów musi się mieścić na jednej stronie A4 z marginesem 10 mm, także gdy oś jest pozioma. To to samo ryzyko, które przy labiryncie rozjeżdżała zmiana siatki. Poziom żyje tylko na pasku strony; do profilu trafia dopiero w S-14.
- **Status:** proposed

### S-14: Wiek w profilu i poziomy osobno dla każdego rodzaju karty

- **Outcome:** Rodzic może zapamiętać w profilu dziecka wspólny wiek i osobny poziom każdego rodzaju karty (labirynt, symetria), a ostatnie parametry są pamiętane osobno dla każdego rodzaju; zapisane wcześniej profile i parametry nadal się wczytują.
- **Change ID:** profile-age-and-levels
- **PRD refs:** US-08, FR-017
- **Prerequisites:** S-13
- **Parallel with:** —
- **Blockers:** —
- **Unknowns:**
  - Co dokładnie znaczy „wiek” dla labiryntu, który ma 6 poziomów (od 3 lat do nastolatka), i dla symetrii, która zaczyna się od 4 lat? Rekomendacja: wiek ustawia poziom na starcie na najbliższy dostępny, a rodzic może go zmienić i zapisać osobno. — Owner: user. Block: no.
  - Czy dawny poziom labiryntu w profilu zostaje poziomem labiryntu, a wiek jest wyliczany z niego? Rekomendacja: tak, bez gubienia zapisanych danych. — Owner: team. Block: no.
- **Risk:** Jedyny plasterek, który zmienia kształt danych zapisanych u rodzica, i dotyka też okien profilu (tworzenie, edycja, zapis, usunięcie). Stare wpisy muszą się wczytywać i nie wolno ich gubić. Profil zmienia się tylko po wyraźnym zapisie (FR-009), tak samo jak dotąd. Wspólne pola (wiek, postać) nie mogą wymuszać zmian w poziomach, a poziom rodzaju karty musi dać się wybrać niezależnie od wieku.
- **Status:** proposed

## Backlog Handoff

Issues na GitHubie z etykietą `roadmap-slice` idą za „At a glance” i „Done”. Zmiana statusu plasterka wymaga tej samej zmiany w issue: zamknąć zrobione, otworzyć nowe z aktywnego kamienia, `status:ready` tylko gdy wiersz poniżej mówi yes. Sekcja „Po tym kamieniu” nie dostaje issue, dopóki kamień nie jest otwarty.

| Roadmap ID | Change ID                  | Suggested issue title                                     | Ready for `/10x-plan` | Notes                                               |
| ---------- | -------------------------- | --------------------------------------------------------- | --------------------- | --------------------------------------------------- |
| F-03       | card-catalog-home          | Katalog kart na stronie głównej; labirynt pod `/labirynt` | yes                   | Run `/10x-new card-catalog-home`, potem `/10x-plan` |
| S-12       | symmetry-first-printable   | Karta symetrii: strona, generowanie, podgląd i druk A4    | no                    | Czeka na F-03. Gwiazda przewodnia kamienia          |
| S-13       | symmetry-difficulty-levels | Poziomy symetrii: kratka, gęstość, oś                     | no                    | Czeka na S-12                                       |
| S-14       | profile-age-and-levels     | Wiek w profilu i poziomy osobno dla każdego rodzaju karty | no                    | Czeka na S-13. Zmienia kształt zapisanych danych    |

## Open Roadmap Questions

1. **Insight — czemu gotowe paczki PDF nie rozwiązują tego poza skończoną biblioteką?** — Owner: user. Block: no.
2. **Jakie jest źródło dostarczonych postaci i jakie prawa pozwalają użyć ich w produkcie?** — Owner: user. Block: no (dotyczy katalogu postaci labiryntu; karta symetrii postaci nie używa).
3. **Czy poziom nastolatka ma pokazywać postać?** — Owner: user. Block: no. Issue #54, PRD Open Questions 4. Nie należy do M-2.
4. **Czy startowe wartości poziomów symetrii pasują dziecku?** — Owner: user. Block: no (S-13). PRD Open Questions 5.
5. **Czy karta symetrii ma kiedyś używać postaci?** — Owner: user. Block: no. PRD Open Questions 6.

## Parked

- **Inne typy kart pracy poza symetrią** — Why parked: PRD §Non-Goals: kolejne rodzaje wchodzą jako osobne kamienie, po jednym. Zarys następnej karty jest w „Po tym kamieniu”.
- **Generowanie albo ocena kart modelem językowym** — Why parked: PRD §Non-Goals; rezultat ma wynikać z jawnych reguł algorytmicznych.
- **Konta rodziców i synchronizacja między urządzeniami** — Why parked: PRD §Non-Goals; ustawienia i profile zostają na urządzeniu.
- **Zapis i archiwum wygenerowanych kart** — Why parked: PRD §Non-Goals; cykl życia karty kończy się po wydruku.
- **Biblioteka gotowych kart (FR-011)** — Why parked: PRD §Non-Goals; nice-to-have poza MVP.
- **Własny obrazek rodzica (US-02)** — Why parked: świadomie poza MVP, zapisane 2026-10-04. Change ID do odblokowania: `parent-supplied-maze-image`.

## Po tym kamieniu

Nie wlicza się do „Done when” M-2. Kamień nie jest otwarty. Stary zapis S-10 (`symmetry-worksheet`) zastąpiły F-03 i S-12–S-14; numer S-10 zostaje nieużyty.

Wspólna umowa z labiryntem: algorytm, jedna sprawdzalna odpowiedź, wiek, jedna strona A4, czarny druk, bez modelu językowego.

**Zarys trzeciej karty: Sekwencje** (bez numeru i bez Change ID; kamień M-3 powstanie z `/10x-roadmap` po zamknięciu M-2):

- **Co robi dziecko:** wskazuje, co będzie dalej w ciągu obrazków.
- **Co dostaje po M-2:** katalog kart i wspólną powłokę strony generatora z F-03, wzorzec „generator, sprawdzenie odpowiedzi, układ A4, podgląd, druk” z S-12, poziomy i pamięć w profilu z S-13 i S-14. Trzecia karta dostaje własną stronę i miniaturę w tym samym katalogu.
- **Czego brakuje:** zestawu obrazków do ciągów (z katalogu postaci czy osobny) i jawnych reguł ciągu. Kartka odpada, gdy do pustego miejsca pasują dwie reguły, więc generator musi to sprawdzać.
- **Wiek i poziomy:** do ustalenia przy otwarciu kamienia.

Bez numeru, ta sama umowa:

- **Połącz kropki** — sylwetka postaci. Czeka na obrys.
- **Który nie pasuje** — jedna złamana reguła. Kartka odpada, gdy druga reguła wskazuje inny obrazek.
- **Nonogram postaci** — rozwiązanie odsłania postać. Czeka na bitmapę.
- **Karty kodowania** — kratka, postać, meta, strzałki, jedna najkrótsza droga.
- **Sudoku obrazkowe** — 4×4 z symbolami. Układ 9×9 zostaje przy nastolatku.
- **Porównywanie kwot w złotych** — wartość kupek monet, nie liczba sztuk. „Ułóż dokładnie tę kwotę” czeka na jeden układ.

Kolorowanki oraz działania na liczbach z dopiskiem waluty zostają poza tą listą.

## Milestone History

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
