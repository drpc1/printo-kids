---
project: PrintoKids
version: 1
status: draft
created: 2026-09-27
updated: 2026-10-01
prd_version: 1
main_goal: low-complexity
top_blocker: capacity
milestone_id: first-printable-a4-maze
milestone_seq: 1
milestone_status: open
---

# Roadmap: PrintoKids

> Derived from `context/foundation/prd.md` (v1) + auto-researched codebase baseline.
> Edit-in-place; archive when superseded.
> Slices below are listed in dependency order. The "At a glance" table is the index.

## Milestone

**M-1: Pierwsza drukowalna karta A4** — Status: open

- **Intent:** Pokazać, że rodzic może wygenerować jakikolwiek rozwiązywalny labirynt, zobaczyć kartę A4 na stronie i wydrukować ją jako jedną stronę. Potem dodać postać, zapamiętane parametry i opcjonalne profile dzieci. Poziomy trudności są poza aktywną sekwencją — wrócimy do nich osobną rozmową.
- **Source materials:** `context/foundation/prd.md` (v1)
- **Done when:** every F-NN and S-NN below is `done`.
- **Scope anchors:** US-01, FR-002–FR-010 (FR-001 zaparkowane; FR-011 poza zakresem tego kamienia).

## Vision recap

Rodzic przedszkolaka wyczerpał darmowe labirynty o właściwej skali trudności, a dziecko wciąż chce kolejną kartę. Szukanie i ściąganie z wielu stron nie daje nowej karty na tym samym poziomie. Brakuje sposobu, żeby wygenerować nową kartę, gdy skończy się dopasowana gotowa biblioteka.

## North star

**S-02: Rodzic może wydrukować kartę A4 jako jedną stronę** — to jest najwcześniejszy plasterek, który dowozi kartę na kredkę. Najpierw `F-01` (strona), potem `S-01` (labirynt na karcie); sam podgląd jeszcze nie udowadnia produktu.

> North star — tu: najmniejszy kompletny przepływ od wygenerowania do wydruku, którego udane dowiezienie pokazuje, że produkt w ogóle działa. Stoi możliwie wcześnie, bo reszta ma sens tylko jeśli ten przepływ działa.

## At a glance

| ID    | Change ID                    | Outcome (user can …)                                                                 | Prerequisites | PRD refs                         | Status   |
| ----- | ---------------------------- | ------------------------------------------------------------------------------------ | ------------- | -------------------------------- | -------- |
| F-01  | worksheet-page-shell         | (foundation) Wejście na stronę główną pokazuje, do czego jest narzędzie, i przycisk generowania labiryntu (na razie nie działa) | —             | US-01                            | done |
| S-01  | first-printable-maze         | Rodzic może wygenerować rozwiązywalny labirynt i zobaczyć go jako kartę A4 na stronie | F-01          | US-01, FR-003, FR-004            | done |
| S-02  | print-a4-maze                | Rodzic może wydrukować tę kartę jako jedną stronę A4                                 | S-01          | FR-005                           | proposed |
| S-03  | maze-character-choice        | Rodzic może wybrać postać z dostarczonego zestawu; postać stoi przy starcie labiryntu | S-01          | US-01, FR-002                    | proposed |
| S-04  | last-used-print-params       | Rodzic bez profilu dziecka dostaje ostatnio użyte parametry jako widoczne, edytowalne wartości domyślne | S-03          | FR-006                           | proposed |
| S-05  | child-profile-create-select  | Rodzic może utworzyć opcjonalny lokalny profil dziecka z ulubioną postacią oraz wybrać zapisany profil, gdy istnieje rzeczywisty wybór | S-03          | FR-007, FR-008                   | proposed |
| S-06  | child-profile-save-delete    | Rodzic może jawnie zapisać zmienione ustawienia profilu dziecka i usunąć profil po potwierdzeniu | S-05          | FR-009, FR-010                   | proposed |

## Streams

Navigation aid — groups items that share a Prerequisites chain. Canonical ordering still lives in the dependency graph below; this table is the proposed reading order across parallel tracks.

| Stream | Theme                    | Chain                         | Note                                                                 |
| ------ | ------------------------ | ----------------------------- | -------------------------------------------------------------------- |
| A      | Strona, karta, potem druk | `F-01` → `S-01` → `S-02`     | Najpierw po co jest strona i przycisk, potem labirynt na kartce, potem wydruk. Wydruk jest gwiazdą przewodnią kamienia. |
| B      | Postać, potem parametry  | `S-03` → `S-04`               | Dołącza do strumienia A przy `S-01`. Postać nie czeka na druk.       |
| C      | Profile dziecka          | `S-05` → `S-06`               | Dołącza do strumienia B przy `S-03`. Wydruk nie wymaga profilu.      |

## Baseline

What's already in place in the codebase as of `2026-09-27` (auto-researched + user-confirmed).
Foundations below assume these are present and do NOT re-scaffold them.

- **Frontend:** present — UI shell, routing, and component kit are in the repo (`package.json`, `astro.config.mjs`).
- **Backend / API:** partial — page-serving runtime is in place; only starter account endpoints exist. No maze-generation endpoint and no background jobs. Product flow does not need a maze API for this milestone.
- **Data:** partial — starter account client only. No product schema, no migrations, no on-device storage for last-used parameters or child profiles.
- **Auth:** present — starter account scaffold is wired, including a gated example page. Product does not use accounts (PRD: jeden lokalny rodzic, bez logowania).
- **Deploy / infra:** partial — hosting target and CI (lint, check, build, smoke) are in the repo (`wrangler.jsonc`, `.github/workflows/ci.yml`). Auto-deploy on merge is declared in the stack note but not present.
- **Observability:** partial — platform request logs are on. No app-level error tracking or metrics.

## Foundations

The starter Welcome screen (auth, marketing, cosmic layout) is what a visitor sees today; it is not the product. `F-01` replaces that first paint with a short purpose line and a generate control so `S-01` only makes the button produce an A4 maze on the same page and `S-02` only prints it. Character assets enter in `S-03`. On-device last-used parameters enter in `S-04`. Child-profile storage enters in `S-05`. Difficulty rules stay parked until the later conversation.

### F-01: Strona główna narzędzia

- **Outcome:** (foundation) Wejście na stronę główną pokazuje, do czego jest narzędzie, i przycisk generowania labiryntu (na razie nie działa).
- **Change ID:** worksheet-page-shell
- **PRD refs:** US-01
- **Unlocks:** S-01, S-02
- **Prerequisites:** —
- **Parallel with:** —
- **Blockers:** —
- **Unknowns:** —
- **Risk:** Świadomie bez pustej kartki A4 na starcie: rodzic ma wiedzieć po co tu jest i co kliknąć. Przycisk jest widoczny, ale nic nie generuje — to tymczasowe, `S-01` podłącza go na tym samym ekranie. Znika chrome startera (logowanie, baner o braku konfiguracji, hero). Brak znajomości technologii w projekcie ma wyjść tutaj. Układ kartki (start góra, „Meta” dół) wchodzi z labiryntem w `S-01`.
- **Status:** done

## Slices

### S-01: Labirynt na karcie A4

- **Outcome:** Rodzic może wygenerować rozwiązywalny labirynt i zobaczyć go jako kartę A4 na stronie.
- **Change ID:** first-printable-maze
- **PRD refs:** US-01, FR-003, FR-004
- **Prerequisites:** F-01
- **Parallel with:** —
- **Blockers:** —
- **Unknowns:**
  - Jak wygląda znacznik startu bez postaci? Rekomendacja: przerwa w zewnętrznej ścianie na środku góry, bez słowa „Start”; na dole analogiczna przerwa i napis „Meta”. Postać z `S-03` wstawi się w to samo miejsce. — Owner: user. Block: no.
  - Jaka stała siatka (liczba komórek, szerokość korytarza) na pierwszy labirynt, skoro poziomy są zaparkowane? — Owner: team. Block: no.
- **Risk:** Wchodzi na stronę z `F-01`: ten sam przycisk zaczyna działać, na tej samej stronie pojawia się kartka A4 z labiryntem. Zobaczenie karty jest zatwierdzeniem. Layout treści karty: tylko labirynt + start + „Meta”. Poprawność generatora weryfikujemy w kodzie (niewidoczne dla rodzica): dokładnie jedna ścieżka od wejścia do wyjścia; ta sama funkcja w testach i przed pokazaniem karty. Druk jest `S-02`.
- **Status:** done

### S-02: Druk jednej strony A4

- **Outcome:** Rodzic może wydrukować tę kartę jako jedną stronę A4.
- **Change ID:** print-a4-maze
- **PRD refs:** FR-005
- **Prerequisites:** S-01
- **Parallel with:** S-03
- **Blockers:** —
- **Unknowns:** —
- **Risk:** Gwiazda przewodnia kamienia — po S-01 widać kartę, ale to jeszcze nie jest karta na kredkę. Nie ocenia labiryntu; sprawdza jedną stronę, brak ucięcia, margines co najmniej 10 mm. Ryzyko: przeglądarki i drukarki różnie stosują marginesy.
- **Status:** proposed

### S-03: Postać przy starcie labiryntu

- **Outcome:** Rodzic może wybrać postać z dostarczonego zestawu; postać stoi przy starcie labiryntu.
- **Change ID:** maze-character-choice
- **PRD refs:** US-01, FR-002
- **Prerequisites:** S-01
- **Parallel with:** S-02
- **Blockers:** —
- **Unknowns:**
  - Jakie jest źródło dostarczonych postaci (zestaw do narysowania / licencji)? Prawa nie blokują tej historyjki — decyzja użytkownika z wywiadu. — Owner: user. Block: no.
- **Risk:** Świadomie po karcie na ekranie, bez czekania na druk. Ryzyko: profil dziecka ma ulubioną postać, więc `S-05` czeka na ten plasterek. Brak znajomości technologii w projekcie nadal obowiązuje, ale generator jest już za nami.
- **Status:** proposed

### S-04: Ostatnio użyte parametry bez profilu

- **Outcome:** Rodzic bez profilu dziecka dostaje ostatnio użyte parametry jako widoczne, edytowalne wartości domyślne.
- **Change ID:** last-used-print-params
- **PRD refs:** FR-006
- **Prerequisites:** S-03
- **Parallel with:** S-05, S-06
- **Blockers:** —
- **Unknowns:**
  - Zapamiętany poziom trudności wraca, gdy odparkujemy poziomy. Do tego czasu parametr to postać. — Owner: user. Block: no.
- **Risk:** Czeka, aż jest parametr do zapamiętania (postać). Ryzyko: wspólne urządzenie pokaże parametry poprzedniego dziecka — PRD wymaga, by wartości zawsze dało się zmienić przed generowaniem.
- **Status:** proposed

### S-05: Utworzenie i wybór profilu dziecka

- **Outcome:** Rodzic może utworzyć opcjonalny lokalny profil dziecka z ulubioną postacią oraz wybrać zapisany profil, gdy istnieje rzeczywisty wybór.
- **Change ID:** child-profile-create-select
- **PRD refs:** FR-007, FR-008
- **Prerequisites:** S-03
- **Parallel with:** S-04
- **Blockers:** —
- **Unknowns:**
  - Domyślna trudność w profilu wraca, gdy odparkujemy poziomy. Ten plasterek dowozi profil i postać. — Owner: user. Block: no.
- **Risk:** Na końcu, bo wydruk nie wymaga profilu, a limitem jest jedna osoba po godzinach. Czeka na postać. Ryzyko: selektor przy jednym profilu zaśmieci ekran — PRD każe go ukryć, gdy nie ma rzeczywistego wyboru. Brak znajomości technologii w projekcie: lokalny zapis profilu to drugi nieznany kawałek stosu po generatorze.
- **Status:** proposed

### S-06: Zapis i usunięcie profilu dziecka

- **Outcome:** Rodzic może jawnie zapisać zmienione ustawienia profilu dziecka i usunąć profil po potwierdzeniu.
- **Change ID:** child-profile-save-delete
- **PRD refs:** FR-009, FR-010
- **Prerequisites:** S-05
- **Parallel with:** S-04
- **Blockers:** —
- **Unknowns:** —
- **Risk:** Osobno od tworzenia, żeby jednorazowa zmiana karty nie mieszała się z trwałą zmianą profilu. Ryzyko: usunięcie bez potwierdzenia jest nieodwracalne na urządzeniu.
- **Status:** proposed

## Backlog Handoff

| Roadmap ID | Change ID                   | Suggested issue title                                              | Ready for `/10x-plan` | Notes |
| ---------- | --------------------------- | ------------------------------------------------------------------ | --------------------- | ----- |
| F-01       | worksheet-page-shell        | Wejście na /: po co jest strona i przycisk Generuj                 | yes                   | Run `/10x-plan worksheet-page-shell` |
| S-01       | first-printable-maze        | Rodzic generuje rozwiązywalny labirynt i widzi kartę A4 na stronie | no                    | Czeka na F-01 |
| S-02       | print-a4-maze               | Druk karty jako jednej strony A4                                   | no                    | Czeka na S-01; gwiazda przewodnia kamienia |
| S-03       | maze-character-choice       | Wybór postaci z zestawu przy starcie labiryntu                     | no                    | Czeka na S-01; można planować równolegle z S-02 |
| S-04       | last-used-print-params      | Ostatnio użyte parametry jako widoczne, edytowalne wartości domyślne | no                    | Czeka na S-03; poziom dołączy po odparkowaniu trudności |
| S-05       | child-profile-create-select | Opcjonalny profil dziecka: utworzenie i wybór                      | no                    | Czeka na S-03; domyślna trudność dołączy po odparkowaniu |
| S-06       | child-profile-save-delete   | Zapis zmian profilu i usunięcie po potwierdzeniu                   | no                    | Czeka na S-05 |

## Open Roadmap Questions

1. **Insight — czemu gotowe paczki PDF nie rozwiązują tego poza skończoną biblioteką?** — Owner: user. Block: no.
2. **Jakie jest źródło dostarczonych postaci i jakie prawa pozwalają użyć ich w produkcie?** — Owner: user. Block: no (`S-03` nie czeka na prawa — decyzja z wywiadu; źródło zestawu wciąż do wskazania przy planowaniu `S-03`).

## Parked

- **Poziomy trudności (FR-001; zgodność labiryntu z poziomem z FR-003)** — Why parked: rozmowa odłożona świadomie na później. Nie stoi na ścieżce `F-01`–`S-06`. Change ID do odblokowania: `maze-difficulty-levels`. Do rozstrzygnięcia wtedy: ile poziomów; czym się różnią; czy wielkość i kształt labiryntu są zawsze takie same. PRD zapisuje trzy poziomy (łatwy / średni / trudny) i różnicowanie przez rozgałęzienia, ślepe uliczki i zakręty przy stałym rozmiarze przejść — to punkt startu tamtej rozmowy, nie decyzja na teraz. Nowe testy generatora (zgodność z poziomem) dochodzą wtedy, nie nowy ekran.
- **Sudoku, karty kodowania i inne typy zadań** — Why parked: PRD §Non-Goals; MVP tylko labirynty.
- **Generowanie albo ocena labiryntu modelem językowym** — Why parked: PRD §Non-Goals; rezultat ma wynikać z jawnych reguł algorytmicznych.
- **Konta rodziców i synchronizacja między urządzeniami** — Why parked: PRD §Non-Goals; ustawienia i profile zostają na urządzeniu.
- **Zapis i archiwum wygenerowanych kart** — Why parked: PRD §Non-Goals; cykl życia karty kończy się po wydruku.
- **Biblioteka gotowych kart (FR-011)** — Why parked: PRD §Non-Goals; nice-to-have poza MVP.

## Milestone History

## Done

- **F-01: (foundation) Wejście na stronę główną pokazuje, do czego jest narzędzie, i przycisk generowania labiryntu (na razie nie działa).** — Archived 2026-09-29 → `context/archive/2026-09-28-worksheet-page-shell/`. Lesson: —.
- **S-01: Rodzic może wygenerować rozwiązywalny labirynt i zobaczyć go jako kartę A4 na stronie.** — Archived 2026-10-01 → `context/archive/2026-09-28-first-printable-maze/`. Lesson: —.
