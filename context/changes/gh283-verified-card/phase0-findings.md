# gh283 faza 1: znaleziska inwentaryzacji niezmiennika

Źródło: `src/lib/card-engines.test.ts` (lokalna tabela adapterów dla 7 rodzajów kart, ziarna `mulberry32`). Każdy wiersz poniżej to jeden przypadek `todo` w teście; kod w kolumnie „Kod” jest tym samym napisem, który stoi w `todo:` w teście. Asercja przypadku to ta, którą zachowa przyszły silnik (`problems` zawiera `expectedCode`).

## Wynik w skrócie

- Legalność (5 ziaren na każde ustawienie, wszystkie 7 rodzajów), różnorodność (`previousKey`, łańcuch 4 kart) i czas (średnio < 5 s na ustawienie; cały test czasu każdego rodzaju trwa poniżej pół sekundy) przechodzą bez znalezisk. Czas domyka D01 R-10 dla symetrii i dyktanda. Test czasu idzie pierwszy w każdym rodzaju i liczy też zimne pierwsze wywołanie, więc leniwa budowa katalogu dyktanda (ok. 1,8 s na wszystkie ustawienia) jest w pomiarze.
- Różnorodność nie dotyczy labiryntu: generator nie używa `previousKey` (plan: poza zakresem).
- Wszystkie 13 znalezisk to **luki strażnika**, żadne nie jest defektem generatora: karta z generatora jest zawsze poprawna, a strażnik przepuszcza też karty z wadą. Test pilnuje, że każdy mutant naprawdę przechodzi dzisiejszy strażnik (`problems` zwraca `[]`), więc `todo` nie pada z innej przyczyny.
- Dla labiryntu dzisiejszy strażnik to `mazeForSheet`, który mówi tylko tak/nie. W teście jego odpowiedź to zastępczy kod `gate-rejected`; kody `expectedCode` pochodzą z D02 4.8. Te same mutanty odrzuca lokalny sprawdzacz referencyjny w teście (dowód, że przypadki są poprawne), a ten sprawdzacz potwierdza też legalność kart z generatora.
- Nie pokryte (świadomie): N13 „odcięta grupa z własną pętlą, która nie tworzy drugiej drogi” (D02 6.2). Fabryka mutantów buduje odciętą komórkę i odciętą dwukomórkową grupę; pętla wymaga grupy co najmniej 2×2 i jest dopisana do testu `mazeSpec` w fazie 4.

## Znaleziska

| Kod    | Karta           | Co padło                                                                                                                                       | Typ            | Zamyka fazę |
| ------ | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ----------- |
| M-N3   | labirynt        | zamknięta północna ściana wejścia; bramka przepuszcza (oczekiwane `entrance-sealed`)                                                           | luka strażnika | 4           |
| M-N5   | labirynt        | zamknięta południowa ściana wyjścia (`exit-sealed`)                                                                                            | luka strażnika | 4           |
| M-N6a  | labirynt        | otwarta zachodnia ściana kolumny 0 (`outer-wall-open`)                                                                                         | luka strażnika | 4           |
| M-N6b  | labirynt        | otwarta wschodnia ściana ostatniej kolumny (`outer-wall-open`)                                                                                 | luka strażnika | 4           |
| M-N6c  | labirynt        | otwarta północna ściana rzędu 0 poza wejściem (`outer-wall-open`)                                                                              | luka strażnika | 4           |
| M-N6d  | labirynt        | otwarta południowa ściana ostatniego rzędu poza wyjściem (`outer-wall-open`)                                                                   | luka strażnika | 4           |
| M-N7a  | labirynt        | `A.east` otwarte, `B.west` zamknięte (`wall-mismatch`)                                                                                         | luka strażnika | 4           |
| M-N7b  | labirynt        | `B.west` otwarte, `A.east` zamknięte (`wall-mismatch`)                                                                                         | luka strażnika | 4           |
| M-N7c  | labirynt        | `A.south` otwarte, `B.north` zamknięte (`wall-mismatch`)                                                                                       | luka strażnika | 4           |
| M-N13a | labirynt        | komórka odcięta ścianami z każdej strony, droga wejście→wyjście legalna (`unreachable-cells`)                                                  | luka strażnika | 4           |
| M-N13b | labirynt        | dwukomórkowa grupa odcięta od reszty (`unreachable-cells`)                                                                                     | luka strażnika | 4           |
| A5-a   | nonogram, łatwy | wiersz krótszy niż siatka (suma znaczków < 8) przechodzi `simpleNonogramProblems`; kod docelowy `runs-mismatch` (nazwa do ustalenia w fazie 9) | luka strażnika | 9           |
| A5-b   | nonogram, łatwy | dwa sąsiednie znaczki tego samego tonu w jednym wierszu (opis niekanoniczny) przechodzą; kod docelowy `runs-mismatch`                          | luka strażnika | 9           |

Przy kodach, których dziś nie ma w żadnej unii `*Problem` (`start-not-top-left`, a w A5 rozbicie `runs-mismatch`), kod w teście to propozycja; faza zamykająca może go zmienić, zmieniając test i ten plik razem.

## Pytania do właścicielki (krok ręczny 1.5)

Rozstrzygnięcia z 2026-11-06 wpisane niżej.

### R-9: punkt startu dyktanda

PRD (US-17 i „Karta dyktanda graficznego”) mówi, że punkt startu leży na obrysie, w lewym górnym rogu sylwetki. Dziś pilnuje tego tylko budowa obrysu (`traceOutline`), a strażnik (`dictationCardProblems`) tego nie sprawdza: karta z tym samym obrysem, ale ze startem w innym wierzchołku, przechodzi.

- Opcja A: dodać sprawdzenie startu do `dictationSpec.problems` (nowy kod, przypadek R-9 w teście przechodzi, zmiana w fazie 10).
- Opcja B: usunąć zdanie o lewym górnym rogu z PRD (PRD:794 i odpowiednik w US-17); przypadek R-9 znika z listy `todo`.
- Skutek dla dziecka: żaden dziś, bo generator zawsze startuje w rogu. Ryzyko pojawia się dopiero przy ręcznie dodanym kształcie albo zmianie generatora.

**Rozstrzygnięcie właścicielki (2026-11-06): opcja B.** Start nie musi być w rogu, „równie dobrze możemy zaczynać w środku”. Przypadek R-9 usunięty z testu (nie jest już `todo`). W fazie 10 wypada zdanie o lewym górnym rogu z PRD (PRD:794 i odpowiednik w US-17); strażnik dyktanda sprawdza dalej, że droga jest zamknięta i równa obrysowi, ale nie sprawdza, gdzie leży start.

### A5: łatwy nonogram

PRD mówi, że rozwiązanie łatwego poziomu jest jedno „z samej konstrukcji”. Strażnik (`simpleNonogramProblems`) sprawdza tylko: jest zamalowana kratka, wiersz ma najwyżej 7 znaczków, znaczki odtwarzają tony. Nie sprawdza, że suma znaczków wiersza daje szerokość siatki (A5-a) ani że sąsiednie znaczki mają różne tony (A5-b). Karta z generatora tego nie łamie, bo znaczki powstają z tonów; luka dotyczy tylko kart składanych inaczej niż dziś.

- Opcja A: dodać oba sprawdzenia jako nowe kody w `nonogramSpec.problems` (faza 9).
- Opcja B: uznać „jednoznaczność z konstrukcji” za wystarczającą; przypadki A5-a i A5-b zamieniają się w test dokumentujący tę zasadę i znikają z `todo`.

**Rozstrzygnięcie (2026-11-06): właścicielka nie ma zdania i zostawiła wybór mnie; przyjmuję opcję A.** Dwa sprawdzenia trafiają do `nonogramSpec.problems` w fazie 9, przypadki A5-a i A5-b zostają jako `todo` do tego czasu.

### Bramka kosztu `require` (faza 2, 2026-11-06)

Pomiar `VerifiedCard.require` (`structuredClone` + rekurencyjne zamrożenie, `problems` puste) na największych dzisiejszych kartach, mediana z 9 przebiegów: labirynt Poziom 6 ok. 1,7 ms, dyktando trudne ok. 0,4 ms, nonogram trudny ok. 0,05 ms, sudoku 9×9 trudny ok. 0,04 ms. Budżet to 20 ms, więc **kopię i zamrożenie zostawiamy** (C6 pozostaje „zmiana wejściowej karty po `require` nie zmienia `verified.card`"). Silniki z faz 4–10 mogą wołać `require` na każdym zwycięzcy bez przechodzenia na `check`; test bramki w `card-contract.test.ts` pilnuje budżetu.
