# Karta sekwencji na A4 (S-16) — Plan Brief

> Full plan: `context/changes/sequences-first-printable/plan.md`

## What & Why

Trzeci rodzaj karty w katalogu. Rodzic wchodzi na `/sekwencje`, klika Generuj i drukuje kartę A4 z sześcioma ciągami kształtów, w których brakuje jednego albo dwóch elementów. Dziecko dorysowuje je w pustych polach. To gwiazda przewodnia M-3: dowodzi, że trzecia karta przechodzi cały łańcuch od katalogu przez generowanie z jedną sprawdzalną odpowiedzią do druku, na własnej stronie.

## Starting Point

Symetria (S-12) dała gotowy wzór: czystą logikę w `src/lib/<rodzaj>/` ze wstrzykniętą losowością, wyspę React w `GeneratorShell`, wspólny hook profilu, rejestr `CARD_KINDS`, miniatury ze skryptu, kontrakt druku, smoke i e2e. Logiki sekwencji, strony i miniatury nie ma.

## Desired End State

Katalog ma miniaturę „Sekwencje”. Na `/sekwencje` duży Generuj daje kartę z poleceniem „Co pasuje w puste pole? Uzupełnij.” i 6 wierszami po 7 pól (około 23 mm), bez numerów. Wypełnione pola mają obrys kształtu, a puste mają przerywaną ramkę i mały „?” w rogu. Każde Generuj daje inną kartę, a każdy ciąg ma dokładnie jedną odpowiedź. Karta drukuje się jako jedna strona A4 z marginesem 10 mm, także z telefonu.

## Key Decisions Made

| Decision          | Choice                                                                          | Why (1 sentence)                                               | Source         |
| ----------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------- | -------------- |
| Ustawienie        | Jedno stałe „5 lat”: 6 ciągów po 7 pól, AB/AAB/ABC z kształtami                 | Poziomy to S-17                                                | Roadmapa       |
| Wygląd pola       | Cienka ramka; puste: ramka przerywana + mały „?” w rogu                         | Ustalone na makiecie; „?” nie przeszkadza w rysowaniu          | change.md      |
| Kształty          | Obrysy koła, kwadratu, trójkąta, gwiazdki                                       | Łatwiej odwzorować niż pełne figury                            | change.md      |
| Polecenie         | „Co pasuje w puste pole? Uzupełnij.”                                            | Słowa użytkownika                                              | change.md      |
| Wielkość pola     | Pola wypełniają szerokość wiersza                                               | Krótszy ciąg daje większe pole (4 lata: 5 pól w S-17)          | PRD            |
| Położenie luk     | Luka zawsze w polu 7; druga w polu 5 albo 6; wzór widoczny przed luką           | Dziecko najpierw widzi wzór; przyjęte po makiecie              | PRD, change.md |
| Miks wzorów       | Losowo, każdy z AB, AAB, ABC co najmniej raz, kolejność przemieszana            | Wybór użytkownika: mniej przewidywalnie niż stałe 2/2/2        | Plan           |
| Liczba luk        | Dokładnie 3 wiersze z jedną luką, 3 z dwiema (wiersze losowe)                   | Każda karta tak samo trudna                                    | Plan           |
| Jednoznaczność    | Sprawdzane wszystkie okresy od 1 do połowy ciągu (przy 7 polach: 1–3)           | Łapie też wzory, które zobaczy rodzic, a nie tylko te losowane | Plan           |
| Różnorodność      | Dowolne kształty z 4; dwa identyczne wiersze na karcie odrzucane                | Prosta reguła, łatwa do testu                                  | Plan           |
| Numery wierszy    | Bez numerów                                                                     | Wybór użytkownika: szersze pola, czystszy wygląd               | Plan           |
| Pasek strony      | Tylko Generuj i Drukuj                                                          | Żadnej martwej kontrolki do S-17                               | Plan           |
| Współpraca z S-18 | Fazy 1–2 tylko nowe pliki; wspólne pliki w fazie 3; drugi scalający robi rebase | Konflikty to dopisane linie obok siebie                        | Plan           |
| E2E               | Katalog → Sekwencje i układ telefonu                                            | Ten sam wzorzec co symetria, kryteria US-04 i US-05            | Plan           |

## Scope

**In scope:**

- Logika w `src/lib/sequence/`: poziom „5 lat”, kształty, generator, walidator jednej odpowiedzi, układ A4, stałe rysunku, testy z niezależną wyrocznią
- `SequenceGenerator.tsx`, `src/pages/sekwencje.astro` i wspólny `src/components/GenerateButton.tsx` (na razie tylko dla sekwencji; labirynt i symetria przepinane później)
- Wpis w katalogu, miniatura, smoke, kontrakt druku, skrypt `test`, ryzyko w `test-plan.md`, e2e katalogu i telefonu

**Out of scope:**

- Poziomy, liczby, ciągi rosnące i malejące, rosnące grupy, ciągi mieszane (S-17)
- Ostatnie parametry i pola profilu sekwencji (S-14)
- Numery wierszy, wzory przesunięte w fazie, odpowiedzi na kartce, pasek „Postać”

## Architecture / Approach

Czysta logika (`generateSequenceCard`, `sequenceRowProblems`, `sequenceCardProblems`, `sequenceAnswers`, `layoutSequenceSheet`, `sequenceShapeOutline`) dostaje źródło losowości, więc ta sama funkcja zasila stronę, testy i miniaturę ze stałym ziarnem. Walidator liczy odpowiedź tylko z widocznych pól i odrzuca wiersz, gdy do luk pasuje zero albo więcej niż jedna odpowiedź. Wyspa `SequenceGenerator` rysuje kartę jako SVG 210×297 w `GeneratorShell`. Profil idzie z `useChildProfileVisit`.

## Phases at a Glance

| Phase                           | What it delivers                                                   | Key risk                                                  |
| ------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------- |
| 1. Logika karty sekwencji       | Generator, walidator, układ i testy z wyrocznią przeszukującą luki | Niejednoznaczny wiersz przechodzi walidator               |
| 2. Strona `/sekwencje`          | Przepływ Generuj → karta → Drukuj pod adresem                      | „?” albo kształty nieczytelne w polu 23 mm                |
| 3. Katalog, wspólne pliki i e2e | Miniatura, smoke, kontrakt druku, `npm test`, e2e, ręczny druk     | Konflikty z S-18; różnice przeglądarek, w tym Brave i iOS |

**Prerequisites:** M-2 zamknięte; PRD i roadmapa z M-3 na `main`; decyzje z makiety zacommitowane (`18eb998`).
**Estimated effort:** około 2–3 sesji w 3 fazach.

## Open Risks & Assumptions

- Zakładam, że pole około 23 mm wystarcza 5-latkowi na dorysowanie kształtu. Potwierdza to wydruk w fazie 3 (PRD Open Questions 9).
- Okno profilu na `/sekwencje` pokazuje postać i poziom labiryntu, tak jak na `/symetria`. To świadomie odłożone do S-14.
- S-17 musi rozszerzyć walidator o reguły liczbowe; S-16 sprawdza tylko wzory powtarzane.

## Success Criteria (Summary)

- Rodzic przechodzi z katalogu na `/sekwencje`, generuje kolejne różne karty i drukuje każdą jako jedną stronę A4 z marginesem 10 mm, także z telefonu.
- Każdy ciąg na każdej pokazanej karcie ma dokładnie jedną odpowiedź, sprawdzaną w testach przeszukaniem wszystkich wypełnień luk.
- Labirynt i symetria działają tak jak przed zmianą.
