---

## project: PrintoKids
version: 1
status: draft
created: 2026-09-27
updated: 2026-09-27
prd_version: 1
main_goal: low-complexity
top_blocker: capacity
milestone_id: first-printable-a4-maze
milestone_seq: 1
milestone_status: open

# Roadmap: PrintoKids

> Derived from `context/foundation/prd.md` (v1) + auto-researched codebase baseline.
> Edit-in-place; archive when superseded.
> Slices below are listed in dependency order. The "At a glance" table is the index.

## Milestone

**M-1: Pierwsza drukowalna karta A4** — Status: open

- **Intent:** Pokazać, że rodzic może wygenerować jakikolwiek rozwiązywalny labirynt, zobaczyć kartę i wydrukować jedną stronę A4. Potem dodać postać, zapamiętane parametry i opcjonalne profile dzieci. Poziomy trudności są poza aktywną sekwencją — wrócimy do nich osobną rozmową.
- **Source materials:** `context/f]oundation/prd.md` (v1)
- **Done when:** every F-NN and S-NN below is `done`.
- **Scope anchors:** US-01, FR-002–FR-010 (FR-001 zaparkowane; FR-011 poza zakresem tego kamienia).



## Vision recap

Rodzic przedszkolaka wyczerpał darmowe labirynty o właściwej skali trudności, a dziecko wciąż chce kolejną kartę. Szukanie i ściąganie z wielu stron nie daje nowej karty na tym samym poziomie. Brakuje sposobu, żeby wygenerować nową kartę, gdy skończy się dopasowana gotowa biblioteka.

## North star

**S-01: Rodzic może wygenerować rozwiązywalny labirynt, zobaczyć kartę A4 i wydrukować ją jako jedną stronę** — bez wyboru poziomu i bez postaci. To jest najcieńszy przepływ, który pokazuje, że generator i druk w ogóle działają; przy celu „niska złożoność” nic innego nie idzie przed nim.

> North star — tu: najmniejszy kompletny przepływ od wygenerowania do wydruku, którego udane dowiezienie pokazuje, że produkt w ogóle działa. Stoi możliwie wcześnie, bo reszta ma sens tylko jeśli ten przepływ działa.



## At a glance


| ID   | Change ID                   | Outcome (user can …)                                                                                                                   | Prerequisites | PRD refs                      | Status   |
| ---- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ----------------------------- | -------- |
| S-01 | first-printable-maze        | Rodzic może wygenerować rozwiązywalny labirynt, zobaczyć kartę A4 i wydrukować jedną stronę                                            | —             | US-01, FR-003, FR-004, FR-005 | ready    |
| S-02 | maze-character-choice       | Rodzic może wybrać postać z dostarczonego zestawu; postać stoi przy starcie labiryntu                                                  | S-01          | US-01, FR-002                 | proposed |
| S-03 | last-used-print-params      | Rodzic bez profilu dziecka dostaje ostatnio użyte parametry jako widoczne, edytowalne wartości domyślne                                | S-02          | FR-006                        | proposed |
| S-04 | child-profile-create-select | Rodzic może utworzyć opcjonalny lokalny profil dziecka z ulubioną postacią oraz wybrać zapisany profil, gdy istnieje rzeczywisty wybór | S-02          | FR-007, FR-008                | proposed |
| S-05 | child-profile-save-delete   | Rodzic może jawnie zapisać zmienione ustawienia profilu dziecka i usunąć profil po potwierdzeniu                                       | S-04          | FR-009, FR-010                | proposed |




## Streams

Navigation aid — groups items that share a Prerequisites chain. Canonical ordering still lives in the dependency graph below; this table is the proposed reading order across parallel tracks.


| Stream | Theme                  | Chain                    | Note                                                                                                   |
| ------ | ---------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------ |
| A      | Karta A4, potem postać | `S-01` → `S-02` → `S-03` | Najpierw jakikolwiek wydruk, potem postać, potem powrót z zapamiętanymi parametrami.                   |
| B      | Profile dziecka        | `S-04` → `S-05`          | Dołącza do strumienia A przy `S-02`. Wydruk nie wymaga profilu; limitem jest jedna osoba po godzinach. |




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

No `F-NN` items. The UI shell, hosting target, and unused account scaffold are already in the baseline. Generation, A4 preview, and print rules enter in `S-01`. Character assets enter in `S-02`. On-device last-used parameters enter in `S-03`. Child-profile storage enters in `S-04`. Difficulty rules stay parked until the later conversation.

## Slices



### S-01: Pierwsza drukowalna karta A4

- **Outcome:** Rodzic może wygenerować rozwiązywalny labirynt, zobaczyć kartę A4 i wydrukować jedną stronę.
- **Change ID:** first-printable-maze
- **PRD refs:** US-01, FR-003, FR-004, FR-005
- **Prerequisites:** —
- **Parallel with:** —
- **Blockers:** —
- **Unknowns:** —
- **Risk:** Stoi pierwszy, bo bez jednego rozwiązywalnego wydruku reszta nic nie udowadnia. Karta bez wyboru poziomu nie spełnia jeszcze pełnego kryterium sukcesu z PRD — poziomy są zaparkowane, nie należą do tej historyjki. Osobne ryzyko: brak znajomości technologii w projekcie; ten plasterek jest pierwszym realnym kontaktem ze stosem, więc tarcia narzędziowe wyjdą tu, nie przy postaciach czy profilach.
- **Status:** ready



### S-02: Postać przy starcie labiryntu

- **Outcome:** Rodzic może wybrać postać z dostarczonego zestawu; postać stoi przy starcie labiryntu.
- **Change ID:** maze-character-choice
- **PRD refs:** US-01, FR-002
- **Prerequisites:** S-01
- **Parallel with:** —
- **Blockers:** —
- **Unknowns:**
  - Jakie jest źródło dostarczonych postaci (zestaw do narysowania / licencji)? Prawa nie blokują tej historyjki — decyzja użytkownika z wywiadu. — Owner: user. Block: no.
- **Risk:** Świadomie po wygenerowanym labiryncie: karta bez postaci już dowodzi produktu. Ryzyko: profil dziecka ma ulubioną postać, więc `S-04` czeka na ten plasterek. Brak znajomości technologii w projekcie nadal obowiązuje, ale generator i druk są już za nami.
- **Status:** proposed



### S-03: Ostatnio użyte parametry bez profilu

- **Outcome:** Rodzic bez profilu dziecka dostaje ostatnio użyte parametry jako widoczne, edytowalne wartości domyślne.
- **Change ID:** last-used-print-params
- **PRD refs:** FR-006
- **Prerequisites:** S-02
- **Parallel with:** S-04, S-05
- **Blockers:** —
- **Unknowns:**
  - Zapamiętany poziom trudności wraca, gdy odparkujemy poziomy. Do tego czasu parametr to postać. — Owner: user. Block: no.
- **Risk:** Czeka, aż jest parametr do zapamiętania (postać). Ryzyko: wspólne urządzenie pokaże parametry poprzedniego dziecka — PRD wymaga, by wartości zawsze dało się zmienić przed generowaniem.
- **Status:** proposed



### S-04: Utworzenie i wybór profilu dziecka

- **Outcome:** Rodzic może utworzyć opcjonalny lokalny profil dziecka z ulubioną postacią oraz wybrać zapisany profil, gdy istnieje rzeczywisty wybór.
- **Change ID:** child-profile-create-select
- **PRD refs:** FR-007, FR-008
- **Prerequisites:** S-02
- **Parallel with:** S-03
- **Blockers:** —
- **Unknowns:**
  - Domyślna trudność w profilu wraca, gdy odparkujemy poziomy. Ten plasterek dowozi profil i postać. — Owner: user. Block: no.
- **Risk:** Na końcu, bo wydruk nie wymaga profilu, a limitem jest jedna osoba po godzinach. Czeka na postać. Ryzyko: selektor przy jednym profilu zaśmieci ekran — PRD każe go ukryć, gdy nie ma rzeczywistego wyboru. Brak znajomości technologii w projekcie: lokalny zapis profilu to drugi nieznany kawałek stosu po generatorze.
- **Status:** proposed



### S-05: Zapis i usunięcie profilu dziecka

- **Outcome:** Rodzic może jawnie zapisać zmienione ustawienia profilu dziecka i usunąć profil po potwierdzeniu.
- **Change ID:** child-profile-save-delete
- **PRD refs:** FR-009, FR-010
- **Prerequisites:** S-04
- **Parallel with:** S-03
- **Blockers:** —
- **Unknowns:** —
- **Risk:** Osobno od tworzenia, żeby jednorazowa zmiana karty nie mieszała się z trwałą zmianą profilu. Ryzyko: usunięcie bez potwierdzenia jest nieodwracalne na urządzeniu.
- **Status:** proposed



## Backlog Handoff


| Roadmap ID | Change ID                   | Suggested issue title                                                | Ready for `/10x-plan` | Notes                                                    |
| ---------- | --------------------------- | -------------------------------------------------------------------- | --------------------- | -------------------------------------------------------- |
| S-01       | first-printable-maze        | Rodzic generuje rozwiązywalny labirynt i drukuje jedną stronę A4     | yes                   | Run `/10x-plan first-printable-maze`                     |
| S-02       | maze-character-choice       | Wybór postaci z zestawu przy starcie labiryntu                       | no                    | Czeka na S-01                                            |
| S-03       | last-used-print-params      | Ostatnio użyte parametry jako widoczne, edytowalne wartości domyślne | no                    | Czeka na S-02; poziom dołączy po odparkowaniu trudności  |
| S-04       | child-profile-create-select | Opcjonalny profil dziecka: utworzenie i wybór                        | no                    | Czeka na S-02; domyślna trudność dołączy po odparkowaniu |
| S-05       | child-profile-save-delete   | Zapis zmian profilu i usunięcie po potwierdzeniu                     | no                    | Czeka na S-04                                            |




## Open Roadmap Questions

1. **Insight — czemu gotowe paczki PDF nie rozwiązują tego poza skończoną biblioteką?** — Owner: user. Block: no.
2. **Jakie jest źródło dostarczonych postaci i jakie prawa pozwalają użyć ich w produkcie?** — Owner: user. Block: no (`S-02` nie czeka na prawa — decyzja z wywiadu; źródło zestawu wciąż do wskazania przy planowaniu `S-02`).



## Parked

- **Poziomy trudności (FR-001; zgodność labiryntu z poziomem z FR-003)** — Why parked: rozmowa odłożona świadomie na później. Nie stoi na ścieżce `S-01`–`S-05`. Change ID do odblokowania: `maze-difficulty-levels`. Do rozstrzygnięcia wtedy: ile poziomów; czym się różnią; czy wielkość i kształt labiryntu są zawsze takie same. PRD zapisuje trzy poziomy (łatwy / średni / trudny) i różnicowanie przez rozgałęzienia, ślepe uliczki i zakręty przy stałym rozmiarze przejść — to punkt startu tamtej rozmowy, nie decyzja na teraz.
- **Sudoku, karty kodowania i inne typy zadań** — Why parked: PRD §Non-Goals; MVP tylko labirynty.
- **Generowanie albo ocena labiryntu modelem językowym** — Why parked: PRD §Non-Goals; rezultat ma wynikać z jawnych reguł algorytmicznych.
- **Konta rodziców i synchronizacja między urządzeniami** — Why parked: PRD §Non-Goals; ustawienia i profile zostają na urządzeniu.
- **Zapis i archiwum wygenerowanych kart** — Why parked: PRD §Non-Goals; cykl życia karty kończy się po wydruku.
- **Biblioteka gotowych kart (FR-011)** — Why parked: PRD §Non-Goals; nice-to-have poza MVP.



## Milestone History



## Done

