---
project: PrintoKids
version: 1
status: draft
created: 2026-09-18
context_type: greenfield
product_type: web-app
target_scale:
  users: small
timeline_budget:
  mvp_weeks: 6
  hard_deadline: null
  after_hours_only: true
---

## Vision & Problem Statement

Rodzic przedszkolaka ściągnął już wszystkie darmowe labirynty z internetu, które odpowiadały skalą trudności, a dziecku wciąż mało. Inne karty, które znajduje, są za łatwe albo za trudne; dalsze szukanie i ściąganie z wielu stron nie daje nowej karty na właściwym poziomie.

Brakuje sposobu na wygenerowanie nowej karty na właściwym poziomie, gdy skończy się dopasowana gotowa biblioteka. Osobny wgląd — czemu gotowe paczki tego nie rozwiązują poza skończoną biblioteką — nie został jeszcze ustalony.

# TODO: insight — see Open Questions

## User & Persona

Primary persona: rodzic dziecka w wieku przedszkolnym, w tym twórca produktu. Sięga po produkt, gdy dziecko chce kolejną kartę, a dopasowany darmowy zestaw labiryntów jest już wyczerpany.

### Secondary persona

Wielu rodziców / opiekunów — kierunek produktu, nie warunek pierwszej wersji.

## Success Criteria

### Primary

- Rodzic może ręcznie wybrać poziom, wygenerować rozwiązywalny labirynt, zobaczyć jego podgląd i wydrukować go jako jedną stronę A4.

### Secondary

- Rodzic może wybrać ulubioną postać dziecka do labiryntu.

### Guardrails

- Drukowanie nie wymaga utworzenia profilu dziecka.
- Wygenerowanie labiryntu trwa nie dłużej niż 5 sekund.

## User Stories

### US-01: Rodzic generuje labirynt do wydruku

- **Given** rodzic może wybrać postać i poziom trudności labiryntu
- **When** wybierze te parametry i uruchomi generowanie
- **Then** otrzymuje gotowy do wydruku labirynt A4 o wybranym poziomie trudności i z wybraną postacią

#### Acceptance Criteria

- Labirynt zajmuje większą część strony A4.
- Labirynt nie przekracza wąskich marginesów strony.
- Istnieje dokładnie jedna prawidłowa ścieżka prowadząca od startu do mety.
- Przy starcie znajduje się wybrana postać.
- Przy końcu labiryntu znajduje się napis „Meta”.

### US-02: Rodzic wstawia własny obrazek — poza MVP

- **Given** rodzic ma własny plik obrazka, na przykład zdjęcie dziecka
- **When** wskaże ten plik przed generowaniem labiryntu
- **Then** obrazek staje przy starcie na karcie, a plik zostaje w przeglądarce i nie jest wysyłany na serwer

#### Acceptance Criteria

- Ta historyjka jest poza MVP. Jest zapisana, żeby do niej wrócić po katalogu dostarczonych postaci.
- Plik nie trafia na serwer, także na czas generowania.
- Po złożeniu karty usługa nie przechowuje kopii pliku.

### US-03: Lista postaci przy profilu — do ustalenia

- **Given** rodzic tworzy profil dziecka albo ogląda zapisany profil
- **When** wskazuje ulubioną postać
- **Then** lista postaci w tych dwóch miejscach jest przerobiona; dokładny wygląd zostaje do ustalenia

#### Acceptance Criteria

- Dotyczy tworzenia profilu i podglądu profilu.
- Pasek „Postać” na kartce zostaje bez zmian.
- Dokładny sposób wyboru postaci nie jest ustalony w tej historyjce.
- Do czasu zaplanowania tej historyjki formularz profilu zostaje przy czterech otwartych wierszach.
- Własny obrazek rodzica zostaje przy US-02.

## Functional Requirements

### Generator i druk

- FR-001: Rodzic może wybrać jeden z dostarczonych poziomów trudności. Priority: must-have
  > Socrates: Counter-argument considered: nazwy poziomów mogą wprowadzać w błąd bez mierzalnych reguł. Resolution: kept; reguły poziomów muszą zostać zdefiniowane przed walidacją wymagania.
- FR-002: Rodzic może wybrać postać z dostarczonego zestawu. Priority: must-have
  > Socrates: Counter-argument considered: przygotowanie i prawa do postaci mogą opóźnić podstawowy przepływ. Resolution: kept; źródło postaci i prawa pozostają otwartym pytaniem.
- FR-003: Rodzic może wygenerować strukturalnie poprawny labirynt zgodny z wybranymi parametrami. Priority: must-have
  > Socrates: Counter-argument considered: poprawność i trudność mogą być niemożliwe do potwierdzenia bez ludzkiego oka. Resolution: kept; połączenie start–meta, unikalność rozwiązania, zakręty, długość i punkty wyboru mają być sprawdzalne według jawnych reguł.
- FR-004: Rodzic może zobaczyć kartę A4 przed uruchomieniem standardowego drukowania. Priority: must-have
  > Socrates: Counter-argument considered: osobny podgląd może dublować standardowe okno drukowania. Resolution: revised; karta ma być widoczna przed drukiem, ale nie wymaga osobnego dodatkowego ekranu.
- FR-005: Rodzic może wydrukować kartę jako jedną stronę A4. Priority: must-have
  > Socrates: Counter-argument considered: przeglądarki i drukarki różnie stosują marginesy oraz skalowanie. Resolution: kept; obsługiwane środowiska i mierzalne granice wydruku wymagają doprecyzowania.
- FR-006: Rodzic bez profilu dziecka otrzymuje jako widoczne, edytowalne wartości domyślne ostatnio użyte parametry. Priority: must-have
  > Socrates: Counter-argument considered: wspólne urządzenie może podstawić ustawienia innego dziecka. Resolution: revised; wartości są zawsze widoczne i można je zmienić przed generowaniem.

### Profile dzieci

- FR-007: Rodzic może utworzyć opcjonalny lokalny profil dziecka z domyślną trudnością i postacią. Priority: must-have
  > Socrates: Counter-argument considered: profile nie są potrzebne do podstawowej wartości i zwiększają zakres MVP. Resolution: kept; korzystanie z profilu pozostaje opcjonalne, ale możliwość zarządzania profilami należy do MVP.
- FR-008: Rodzic może wyświetlić i wybrać zapisany profil dziecka, gdy istnieje rzeczywisty wybór profilu. Priority: must-have
  > Socrates: Counter-argument considered: selektor jest zbędny dla rodzica jednego dziecka. Resolution: revised; wybór profilu nie jest pokazywany, gdy nie ma rzeczywistego wyboru.
- FR-009: Rodzic może jawnie zapisać zmienione ustawienia profilu dziecka. Priority: must-have
  > Socrates: Counter-argument considered: jednorazowa zmiana parametrów karty nie powinna przypadkiem zmieniać profilu. Resolution: revised; profil zmienia się wyłącznie po wyraźnym zapisie.
- FR-010: Rodzic może usunąć profil dziecka po potwierdzeniu operacji. Priority: must-have
  > Socrates: Counter-argument considered: przypadkowe usunięcie lokalnego profilu może być nieodwracalne. Resolution: revised; usunięcie wymaga potwierdzenia.

### Gotowe karty

- FR-011: Rodzic może wybrać gotowy labirynt z biblioteki, zobaczyć podgląd i wydrukować go na A4. Priority: nice-to-have
  > Socrates: Counter-argument considered: przygotowanie i utrzymywanie przykładów zabiera czas podstawowym funkcjom. Resolution: kept as nice-to-have outside MVP.

## Non-Functional Requirements

- Od uruchomienia generowania do pokazania gotowej karty upływa nie więcej niż 5 sekund.
- Karta mieści się na jednej stronie A4 i zachowuje margines co najmniej 10 mm z każdej strony.
- Generowanie, podgląd i druk działają w aktualnych desktopowych wersjach Chrome, Edge, Firefox i Safari.
- Lokalne profile dzieci i ostatnie parametry pozostają dostępne między wizytami do czasu usunięcia ich przez rodzica albo wyczyszczenia danych przeglądarki.
- Dane profili dzieci i ostatnie parametry nie opuszczają urządzenia.
- Wygenerowane karty nie są przechowywane po zakończeniu przepływu drukowania.

## Business Logic

Aplikacja zawsze tworzy labirynt z dokładnie jednym rozwiązaniem, a poziom trudności zwiększa przez liczbę rozgałęzień, ślepych uliczek i zakrętów, zachowując stały, czytelny rozmiar przejść na A4.

Rodzic wybiera jeden z trzech poziomów — łatwy, średni albo trudny — oraz postać z dostarczonego zestawu.

Wynikiem jest karta A4 z wybraną postacią przy starcie i napisem „Meta” przy końcu. Labirynt zajmuje większą część strony, zachowuje margines co najmniej 10 mm i spełnia reguły wybranego poziomu; dokładne progi złożoności poziomów pozostają do ustalenia.

# TODO: mierzalne progi złożoności poziomów trudności — see Open Questions

## Access Control

Jeden lokalny użytkownik-rodzic; bez logowania i bez podziału na role. Ustawienia pozostają na urządzeniu.

Rodzic może korzystać z generatora bez tworzenia profilu dziecka. Opcjonalne nazwane profile dzieci przechowują domyślną trudność i ulubioną postać, aby skrócić kolejne generowanie. Dzieci nie mają kont ani dostępu do aplikacji.

Wygenerowane karty nie są zapisywane; ich cykl życia kończy się po wydruku.

## Non-Goals

- MVP nie generuje sudoku, kart kodowania ani innych typów zadań — skupia się wyłącznie na labiryntach.
- MVP nie używa LLM do generowania ani oceniania labiryntów — rezultat podlega jawnym regułom algorytmicznym.
- MVP nie ma kont rodziców ani synchronizacji między urządzeniami — ustawienia i profile pozostają lokalne.
- MVP nie zapisuje ani nie archiwizuje wygenerowanych kart — ich cykl życia kończy się po wydruku.
- MVP nie dostarcza biblioteki gotowych kart — FR-011 pozostaje możliwym rozszerzeniem poza MVP.
- MVP nie przyjmuje własnego obrazka od rodzica — US-02 zostaje poza MVP. Katalog dostarczonych postaci idzie pierwszy.
- Bieżące tworzenie profilu zostaje przy otwartej liście postaci — US-03 zapisuje późniejszą przeróbkę tej listy przy tworzeniu profilu i w podglądzie profilu. Wygląd nie jest ustalony.

## Open Questions

1. **Insight — czemu gotowe paczki PDF nie rozwiązują tego poza skończoną biblioteką?** — TBD by user. Block: no (pain and missing capability are captured; the second vision paragraph is incomplete until this lands).
2. **Jakie mierzalne właściwości określają każdy poziom trudności?** — Owner: user. Block: yes for validating that the generated maze matches the selected level.
3. **Jakie jest źródło dostarczonych postaci i jakie prawa pozwalają użyć ich w produkcie?** — Owner: user. Block: yes before publishing the character-selection feature. Pierwszy nazwany zestaw (2026-10-04): samochodzik, rakieta, dinozaur, rysowane z pomocą AI. Własny plik rodzica jest US-02 i zostaje poza MVP.
