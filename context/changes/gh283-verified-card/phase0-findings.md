# gh283 faza 1: znaleziska inwentaryzacji niezmiennika

Źródło: `src/lib/card-engines.test.ts` (lokalna tabela adapterów dla 7 rodzajów kart, ziarna `mulberry32`). Każdy wiersz poniżej to jeden przypadek `todo` w teście; kod w kolumnie „Kod” jest tym samym napisem, który stoi w `todo:` w teście. Asercja przypadku to ta, którą zachowa przyszły silnik (`problems` zawiera `expectedCode`).

## Wynik w skrócie

- Legalność (5 ziaren na każde ustawienie, wszystkie 7 rodzajów), różnorodność (`previousKey`, łańcuch 4 kart) i czas (średnio < 5 s na ustawienie; cały test czasu każdego rodzaju trwa poniżej pół sekundy) przechodzą bez znalezisk. Czas domyka D01 R-10 dla symetrii i dyktanda. Uwaga: katalog dyktanda buduje się leniwie przy pierwszym użyciu, więc w tym pliku jego koszt (ok. 1,8 s na wszystkie ustawienia) wpada w test legalności, który idzie pierwszy; pomiar czasu dyktanda z budową katalogu przejmuje faza 10.
- Różnorodność nie dotyczy labiryntu: generator nie używa `previousKey` (plan: poza zakresem).
- Wszystkie 14 znalezisk to **luki strażnika**, żadne nie jest defektem generatora: karta z generatora jest zawsze poprawna, a strażnik przepuszcza też karty z wadą. Test pilnuje, że każdy mutant naprawdę przechodzi dzisiejszy strażnik (`problems` zwraca `[]`), więc `todo` nie pada z innej przyczyny.
- Dla labiryntu dzisiejszy strażnik to `mazeForSheet`, który mówi tylko tak/nie. W teście jego odpowiedź to zastępczy kod `gate-rejected`; kody `expectedCode` pochodzą z D02 4.8. Te same mutanty odrzuca lokalny sprawdzacz referencyjny w teście (dowód, że przypadki są poprawne), a ten sprawdzacz potwierdza też legalność kart z generatora.
- Nie pokryte (świadomie): N13 „odcięta grupa z własną pętlą, która nie tworzy drugiej drogi” (D02 6.2). Fabryka mutantów buduje odciętą komórkę i odciętą dwukomórkową grupę; pętla wymaga grupy co najmniej 2×2 i jest dopisana do testu `mazeSpec` w fazie 4.

## Znaleziska

| Kod    | Karta           | Co padło                                                                                                                                                            | Typ            | Zamyka fazę |
| ------ | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ----------- |
| M-N3   | labirynt        | zamknięta północna ściana wejścia; bramka przepuszcza (oczekiwane `entrance-sealed`)                                                                                | luka strażnika | 4           |
| M-N5   | labirynt        | zamknięta południowa ściana wyjścia (`exit-sealed`)                                                                                                                 | luka strażnika | 4           |
| M-N6a  | labirynt        | otwarta zachodnia ściana kolumny 0 (`outer-wall-open`)                                                                                                              | luka strażnika | 4           |
| M-N6b  | labirynt        | otwarta wschodnia ściana ostatniej kolumny (`outer-wall-open`)                                                                                                      | luka strażnika | 4           |
| M-N6c  | labirynt        | otwarta północna ściana rzędu 0 poza wejściem (`outer-wall-open`)                                                                                                   | luka strażnika | 4           |
| M-N6d  | labirynt        | otwarta południowa ściana ostatniego rzędu poza wyjściem (`outer-wall-open`)                                                                                        | luka strażnika | 4           |
| M-N7a  | labirynt        | `A.east` otwarte, `B.west` zamknięte (`wall-mismatch`)                                                                                                              | luka strażnika | 4           |
| M-N7b  | labirynt        | `B.west` otwarte, `A.east` zamknięte (`wall-mismatch`)                                                                                                              | luka strażnika | 4           |
| M-N7c  | labirynt        | `A.south` otwarte, `B.north` zamknięte (`wall-mismatch`)                                                                                                            | luka strażnika | 4           |
| M-N13a | labirynt        | komórka odcięta ścianami z każdej strony, droga wejście→wyjście legalna (`unreachable-cells`)                                                                       | luka strażnika | 4           |
| M-N13b | labirynt        | dwukomórkowa grupa odcięta od reszty (`unreachable-cells`)                                                                                                          | luka strażnika | 4           |
| A5-a   | nonogram, łatwy | wiersz krótszy niż siatka (suma znaczków < 8) przechodzi `simpleNonogramProblems`; kod docelowy `runs-mismatch` (nazwa do ustalenia w fazie 9)                      | luka strażnika | 9           |
| A5-b   | nonogram, łatwy | dwa sąsiednie znaczki tego samego tonu w jednym wierszu (opis niekanoniczny) przechodzą; kod docelowy `runs-mismatch`                                               | luka strażnika | 9           |
| R-9    | dyktando        | ta sama sylwetka obiegana od następnego wierzchołka: strażnik porównuje zbiór przejść, nie punkt startu, więc przepuszcza; kod docelowy `start-not-top-left` (nowy) | luka strażnika | 10          |

Przy kodach, których dziś nie ma w żadnej unii `*Problem` (`start-not-top-left`, a w A5 rozbicie `runs-mismatch`), kod w teście to propozycja; faza zamykająca może go zmienić, zmieniając test i ten plik razem.

## Pytania do właścicielki (krok ręczny 1.5)

Niczego tu nie rozstrzygam; odpowiedzi wpisać pod pytaniem przed fazą 9 (A5) i 10 (R-9).

### R-9: punkt startu dyktanda

PRD (US-17 i „Karta dyktanda graficznego”) mówi, że punkt startu leży na obrysie, w lewym górnym rogu sylwetki. Dziś pilnuje tego tylko budowa obrysu (`traceOutline`), a strażnik (`dictationCardProblems`) tego nie sprawdza: karta z tym samym obrysem, ale ze startem w innym wierzchołku, przechodzi.

- Opcja A: dodać sprawdzenie startu do `dictationSpec.problems` (nowy kod, przypadek R-9 w teście przechodzi, zmiana w fazie 10).
- Opcja B: usunąć zdanie o lewym górnym rogu z PRD (PRD:794 i odpowiednik w US-17); przypadek R-9 znika z listy `todo`.
- Skutek dla dziecka: żaden dziś, bo generator zawsze startuje w rogu. Ryzyko pojawia się dopiero przy ręcznie dodanym kształcie albo zmianie generatora.

**Rozstrzygnięcie właścicielki:** _(do uzupełnienia)_

### A5: łatwy nonogram

PRD mówi, że rozwiązanie łatwego poziomu jest jedno „z samej konstrukcji”. Strażnik (`simpleNonogramProblems`) sprawdza tylko: jest zamalowana kratka, wiersz ma najwyżej 7 znaczków, znaczki odtwarzają tony. Nie sprawdza, że suma znaczków wiersza daje szerokość siatki (A5-a) ani że sąsiednie znaczki mają różne tony (A5-b). Karta z generatora tego nie łamie, bo znaczki powstają z tonów; luka dotyczy tylko kart składanych inaczej niż dziś.

- Opcja A: dodać oba sprawdzenia jako nowe kody w `nonogramSpec.problems` (faza 9).
- Opcja B: uznać „jednoznaczność z konstrukcji” za wystarczającą; przypadki A5-a i A5-b zamieniają się w test dokumentujący tę zasadę i znikają z `todo`.

**Rozstrzygnięcie właścicielki:** _(do uzupełnienia)_
