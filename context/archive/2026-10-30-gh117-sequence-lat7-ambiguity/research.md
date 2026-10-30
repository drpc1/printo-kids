---
date: 2026-10-30
researcher: Claude (Sonnet 5.5)
git_commit: 678b1dcc1cbf6cb6baad64520a7f599116b2d2fb
branch: claude/gh117-sequence-lat7
repository: printo-kids
topic: "gh117: sekwencje lat7 (Poziom 4), wiersze z więcej niż jedną odpowiedzią widzianą przez dziecko"
tags: [research, sequence, rules, generate, levels]
status: complete
last_updated: 2026-10-30
last_updated_by: Claude (Opus 5.5)
last_updated_note: "Dopisek 2: decyzja ABB zamiast groups na lat7; ABB wymaga szerszego sprawdzenia"
---

# Research: gh117 sekwencje lat7, niejednoznaczne wiersze

## Research Question

Które wiersze `lat7` przechodzą dziś `sequenceAnswers`, a dla dziecka mają więcej niż jedną sensowną odpowiedź? Czy poprawić generator, czy sprawdzenie? Poziomy lat4–lat6 przejrzeć tak samo.

## Summary

- **Potwierdzona dziura (lat7, reguła `mixed`):** wiersz „kształt na przemian z liczbą" z jedną widoczną liczbą przechodzi sprawdzenie, choć krok liczb nie jest widoczny. Przykład z generatora: `3 kolo _ kolo _ kolo _ kolo` (luki na polach 2, 4, 6; dziecko widzi jedną liczbę). Odpowiedź według PRD to 4-5-6, ale 4-6-8 i 5-8-11 pasują tak samo. Powód: `ruleSequences("mixed")` zna tylko krok +1 ([rules.ts:138-149](src/lib/sequence/rules.ts)), więc oracle widzi jedną odpowiedź.
- Skala w próbie 1000 kart lat7 (seed 7, 7000 wierszy): 2361 wierszy `mixed`; widoczne liczby: 1 w 44, 2 w 708, 3 w 1287, 4 w 322. Czyli 44 wiersze (1,9% wierszy `mixed`), każdy na innej karcie: 44 z 1000 kart (4,4%) ma taki wiersz.
- Przy dwóch i więcej widocznych liczbach krok wynika z danych: w próbie 300 kart lat7 szersza rodzina arytmetyczna (kroki ±1..±3, także z kształtem na przemian) dała dodatkowe odpowiedzi tylko w 15 wierszach `mixed`, a wiersze `down1` nie dały żadnej. Te 15 to ten sam przypadek jednej liczby.
- `groups` na lat7 jest jednoznaczny względem reguł z listy i okresów ≤ n/2 (zgodnie z sprawdzeniem). Dopiero przyjęcie okresu 5 daje alternatywy (521 wierszy `groups` z 300 kart), np. `strzalka strzalka trojkat strzalka trojkat _ _ trojkat` pasuje do grup (B, A) i do okresu 5 (A, A). To granica uznaniowa, nie błąd kodu: okres 5 w ośmiu polach ma tylko trzy pola powtórzenia. Decyzja produktowa, nie naprawa.
- lat4–lat6: poziomy kształtowe (AB, AAB, ABC) używają `periodicSequences` do okresu n/2 i nie mają luk liczbowych. Znalazłem tylko wąskie przypadki zależne od przyjętych „dziwnych" reguł (np. lat5 `AAB` z dwiema końcowymi lukami, 297 z 1800 wierszy w próbie 300 kart, pasuje też do „rosnących grup A": AAB AAAB). Uważam to za mało prawdopodobne w oczach dziecka, więc zostawić; lat6 i lat4 nie mają dziur w rodzajach reguł z listy.

## Detailed Findings

### Jak działa sprawdzenie

- `sequenceRowProblems` liczy odpowiedzi z samych widocznych pól i odrzuca wiersz z `answers.length !== 1` ([generate.ts:166-222](src/lib/sequence/generate.ts)).
- `sequenceAnswers` filtruje `hypotheses(n)` po widocznych polach ([generate.ts:145-160](src/lib/sequence/generate.ts)).
- `hypotheses(n)` = wszystkie okresowe ciągi kształtów z okresem 1..n/2 plus `ruleSequences` dla ośmiu reguł ([rules.ts:178-190](src/lib/sequence/rules.ts)). Dla liczb są to tylko `up1`, `up2`, `down1` (pełne ciągi) i `mixed` z krokiem +1 po alternatywnych polach.

### Dziura w `mixed`

- `mixedRow` zwiększa liczbę o 1 co drugie pole ([rules.ts:89-102](src/lib/sequence/rules.ts)); `ruleSequences("mixed")` generuje to samo dla każdego startu ([rules.ts:138-149](src/lib/sequence/rules.ts)). Brak kroków innych niż +1 w hipotezach.
- lat7: `gaps: 2`, `extraGapRows: 3`, `gapPlacement: "free"` ([levels.ts:80-95](src/lib/sequence/levels.ts)); wiersz 3-lukowy ma 4 pola liczbowe w ośmiu, więc przy trzech lukach w polach liczbowych zostaje jedna liczba. `SHOWN_BEFORE.mixed = 2` zabrania luk tylko w pierwszych dwóch polach ([rules.ts:18-32](src/lib/sequence/rules.ts)), co nie wymusza dwóch widocznych liczb.
- Testy nie pokrywają tego: `generate.test.ts` sprawdza `mixed` tylko przykładem z gap-ami, które dają dwie liczby, i oracle zgodny z walidatorem ([generate.test.ts:425-440, 474-498](src/lib/sequence/generate.test.ts)); oracle używa tych samych hipotez, więc nie wykryje reguł spoza listy.

### Wniosek: generator czy sprawdzenie?

Poprawka w sprawdzeniu bez zmiany hipotez nie wystarczy, bo luka siedzi w tym, że lista hipotez jest węższa niż to, co widzi dziecko. Dwie spójne drogi (do wyboru w planie):

1. Dodać do `ruleSequences("mixed")` (i ewentualnie do arytmetycznych) kroki ±2, ±3, żeby `sequenceAnswers` odrzucał wiersze z jedną widoczną liczbą. Skutek: odrzuca dokładnie 44/2361 wierszy; koszt: większy zbiór hipotez i dopasowanie do PRD (reguły wymienione jawnie).
2. Reguła konstrukcyjna dla `mixed`: co najmniej dwie widoczne liczby (np. ograniczenie luk w `drawGaps`) plus test. Najprostsze, ale to reguła „z boku" względem „jedna odpowiedź według jawnej listy".
   Kierunek zgodny z PRD („Dwuznaczność liczy się względem całej listy reguł"): opcja 1 przez dopisanie kroków do listy hipotez i do PRD, albo opcja 2 jako dodatkowa reguła wiersza. Wybór należy do planu.

## Code References

- `src/lib/sequence/rules.ts:178-190` - `hypotheses`, lista okresów i reguł
- `src/lib/sequence/rules.ts:89-149` - `mixedRow`, `ruleSequences("mixed")` tylko +1
- `src/lib/sequence/generate.ts:145-160` - `sequenceAnswers`
- `src/lib/sequence/generate.ts:166-222` - odrzucanie `ambiguous`
- `src/lib/sequence/levels.ts:80-95` - definicja lat7
- `src/lib/sequence/generate.test.ts:474-498` - oracle zgodny z walidatorem (te same hipotezy)

## Architecture Insights

Walidacja jest „zamknięta" na liście hipotez: dwuznaczność dla dziecka spoza listy jest niewidoczna dla kodu i dla testu oracle. Każda nowa reguła w `rowFromRule` powinna dostać odpowiedniki „sąsiednich" reguł (inny krok) w `hypotheses`.

## Historical Context (from prior changes)

- `context/archive/2026-10-24-sequence-difficulty-levels` - wprowadzenie poziomów i `mixed` (PRD „Doprecyzowanie z planu poziomów": mixed = kształt z liczbą rosnącą o 1; dwuznaczność względem całej listy reguł). Nie czytałem szczegółów planów w pełni; ustalenia powyżej pochodzą z kodu i PRD.
- Inne archiwa sekwencji: `2026-10-23-sequences-first-printable`, `2026-10-26-sequence-age6-shapes-only`, `2026-10-26-sequence-easy-shapes`, `2026-10-28-sequence-shape-colors` (nieprzeczytane).

## Related Research

Nie dotyczy (nie sprawdzano research.md archiwów).

## Open Questions

- Opcja 1 czy 2 (patrz wyżej), i czy `groups` na lat7 ma być chroniony przed okresem 5 (decyzja produktowa; dziś nie).
- Metoda: próbki generatora (seedy 1 i 7, LCG), nie pełne wyliczenie wszystkich kombinacji luk; liczby to oszacowania na próbie, nie dowód zbioru. Skrypty były tymczasowe poza repozytorium.
- Nie weryfikowałem zawartości issue #117 (`gh issue view` nie zwrócił treści); przykłady reporterki nieznane.

## Dopisek 2026-10-30: pełne wyliczenie układów luk (kształty i liczby)

Pytanie użytkowniczki: czy kształty też są niejednoznaczne i czy przy 8 polach w ogóle da się sensownie dać 3 luki.

Metoda: dla każdego poziomu, reguły i liczby luk wyliczyłem wszystkie dozwolone układy luk (`gapPlacement`, `shownBefore`) na jednym wierszu wzorcowym (kształty A, B, C; liczby od 15 w dół, `mixed` od 5), czyli pełne wyliczenie, a nie próbę. Każdy układ przeszedł przez `sequenceRowProblems`, a potem przez szerszy zbiór odczytań: kroki ±1..±3 (także z kształtem na przemian), warianty rosnących grup (z innym początkiem, rosnące A zamiast B) i okresy 5–6. Okres 5–6 liczy się tylko wtedy, gdy dziecko widzi go w całości: każde pole jednostki jest widoczne i jedno co najmniej dwa razy. Wcześniejsza próba liczyła okresy 5–6 bez tego warunku i przez to zawyżała liczby.

| Poziom | Reguła   | Luki  | Układy  | Przechodzi walidator | Jednoznaczne przy szerszych odczytaniach                |
| ------ | -------- | ----- | ------- | -------------------- | ------------------------------------------------------- |
| lat4   | AB       | 1     | 1       | 1                    | 1                                                       |
| lat5   | AB / ABC | 1–2   | 1 + 2   | wszystkie            | wszystkie                                               |
| lat5   | AAB      | 2     | 2       | 1                    | 0 (`A A B A A _ _`: także AAB AAAB)                     |
| lat6   | AB       | 2     | 15      | 13                   | 13                                                      |
| lat6   | AAB      | 2     | 10      | 8                    | 7 (`A A B A A _ A _`: także okres 5)                    |
| lat6   | ABC      | 2     | 10      | 10                   | 10                                                      |
| lat7   | down1    | 2 / 3 | 15 / 20 | 15 / 20              | 15 / 20                                                 |
| lat7   | mixed    | 2 / 3 | 15 / 20 | 15 / 20              | 15 / 19 (`A 5 A _ A _ A _`)                             |
| lat7   | groups   | 2     | 10      | 9                    | 7 (`A A B A B _ _ B`, `A A B A B _ A _`: także okres 5) |
| lat7   | groups   | 3     | 10      | 7                    | 7                                                       |

Wnioski:

- **Liczby przy 3 lukach działają.** `down1`: wszystkie 20 układów jest jednoznacznych także przy szerszych odczytaniach. `mixed`: 19 z 20; jedyny zły układ to ten z jedną widoczną liczbą (Summary).
- **`groups` na lat7 to główny problem z kształtami, ale nie z powodu liczby luk.** Wszystkie 7 układów 3-lukowych przechodzi oba sprawdzenia, ale tylko dlatego, że lista hipotez nie zna innych odczytań, np. `A A B _ _ _ A B` → ABB albo `A A B _ B _ _ B` → ABA. To wniosek z oglądu, nie z obliczeń: dziecko nie wyczyta z tych pól reguły „A, AB, ABB”. Przy 8 polach wiersz to bloki A | AB | ABB | AB (ucięty), a wzrost widać dopiero w trzecim bloku (pola 3–5). `SHOWN_BEFORE.groups = 3` ([rules.ts:18-32](src/lib/sequence/rules.ts)) pokazuje tylko „A A B”, czyli początek AAB albo czegokolwiek. Gdy reguła ma być widoczna przed luką (pola 0–5), zostają pola 6 i 7: jeden układ, `A A B A B B _ _` → AB, i żadnego miejsca na 3 luki.
- **lat5/lat6 `AAB`:** dwa przypadki pasują też do odczytań spoza listy (AAB AAAB, okres 5). Są słabsze niż `groups`; zostawić albo dopisać do hipotez, decyzja przy planie.
- Odpowiedź na pytanie o 3 luki: przy 8 polach 3 luki mają sens dla liczb (`down1`, `mixed` z dwiema widocznymi liczbami). Dla `groups` 8 pól nie wystarcza na żadną lukę wewnątrz pierwszych sześciu pól.

Możliwe kierunki dla `groups` (decyzja produktowa, do planu):

1. `groups` tylko z lukami na polach 6–7 (`shownBefore` 6), czyli zawsze z 2 lukami w tym samym miejscu; 3-lukowe wiersze lat7 idą do `down1` i `mixed`.
2. Zastąpić `groups` na lat7 inną regułą, która mieści się w 8 polach (np. `up2` albo wzór ABB / ABBC z kształtów).
3. Dłuższy wiersz dla `groups` (zmiana układu karty; pola są węższe).

## Dopisek 2 (2026-10-30): decyzja ABB zamiast `groups` na lat7

Decyzja użytkowniczki: na lat7 `groups` zastępuje wzór ABB. Rekomendacja dla `mixed` (co najmniej dwie widoczne liczby) zostaje; potwierdzić w planie.

Wyliczenie wszystkich układów luk ABB na 8 polach (pierwsza luka od pola 3), tą samą metodą co w Dopisku 1:

| Luki | Układy | Przechodzi walidator | Jednoznaczne przy szerszych odczytaniach |
| ---- | ------ | -------------------- | ---------------------------------------- |
| 2    | 10     | 10                   | 8                                        |
| 3    | 10     | 8                    | 6                                        |

Cztery układy, które przechodzą dzisiejsze sprawdzenie, a dla dziecka mają drugą odpowiedź (A, B to kształty):

- `A B B A B B _ _` → AB albo BA (rosnące grupy A BB A BBB)
- `A B B _ B B _ _` → AAB albo ABA (rosnące grupy)
- `A B B A B _ _ _` → BAB albo BBA (rosnące grupy)
- `A B B A B _ _ B` → BA albo AB (okres 5 ABBAB widoczny w całości)

Dla porównania `up2` (liczby co 2): 15 z 15 przy 2 lukach i 20 z 20 przy 3 lukach, ale tylko 4 różne ciągi przy 8 polach.

Wniosek dla planu: ABB wymaga, żeby sprawdzenie znało dwa dodatkowe odczytania:

1. warianty rosnących grup (inny początek bloku, rosnące A albo B), około 250 ciągów więcej do dzisiejszych 3049 w `hypotheses(8)` (+8%);
2. okres 5–6 widoczny w całości (każde pole jednostki widoczne, jedno co najmniej dwa razy), liczony wprost z widocznych pól w O(n), bez wyliczania 7^5 jednostek.

Pomiar szybkości dzisiejszego kodu (300 kart na poziom): lat7 mediana 1,7 ms, p99 14 ms; lat6 mediana 3,5 ms, p99 15 ms; `sequenceAnswers` około 0,1 ms na wywołanie. Oba dodatki nie zmieniają tego rzędu wielkości.

Ryzyko: szersze sprawdzenie działa na wszystkich poziomach. Na lat5 oba układy `AAB` z dwiema lukami przestają przechodzić (Dopisek 1), więc wiersz 2-lukowy z regułą AAB nie da się wylosować i karta częściej trafia na ponowne losowanie (limit `MAX_ATTEMPTS` 20). Plan musi wybrać: szersze sprawdzenie tylko dla lat7, przydział luk zależny od reguły, albo przyjąć zmianę na lat5 po pomiarze odsetka nieudanych kart.
