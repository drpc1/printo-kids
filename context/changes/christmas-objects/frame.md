# Frame Brief: Świąteczne obiekty w katalogu szablonów (S-38)

> Framing step before /10x-plan. This document captures what is _actually_
> at issue, separated from what was initially assumed.

## Reported Observation

Rodzic chce przed grudniem 2026 drukować karty symetrii, nonogramu, dyktanda graficznego i „Skopiuj obrazek” ze świątecznymi obiektami. Katalog szablonów ma dziś 34 obiekty w sześciu kategoriach i żadnej świątecznej (roadmapa S-38, issue drpc1/printo-kids#369, MS-03: „pierwszy sezon Boże Narodzenie”).

## Initial Framing (preserved)

- **User's stated cause or approach**: brakuje świątecznych obiektów. Otwarte są trzy rzeczy: siódma kategoria „Święta” czy sezonowy tag, obiekty przez cały rok czy tylko w sezonie, i lista obiektów (roadmapa S-38 Unknowns).
- **User's proposed direction**: dodać do katalogu szablonów od 4 do 8 świątecznych obiektów (np. bombka, choinka z ozdobami, Mikołaj, bałwanek, piernik, gwiazda betlejemska) w trzech rozmiarach. Zakres mały, bo jest termin.
- **Pre-dispatch narrowing**: zawęża sam brief sesji nadrzędnej. Trzy decyzje są nazwane wprost, a celem jest szybkość.

## Decyzje użytkowniczki (2026-11-14)

- Pory roku mają być w produkcie, ale **nie 12 kategorii na stałe**.
- W danym momencie pasek pokazuje **jedną porę roku** (bieżącą) i **dodatkowo kategorię specjalną**, jeśli święto wypada w tym samym czasie (np. Boże Narodzenie w grudniu).

To rozstrzyga pytanie o widoczność: **kategorie pór roku i kategorie specjalne zależą od daty**. Wcześniejsza rekomendacja „cały rok, bez daty” jest nieaktualna.

## Dimension Map

1. **Mechanizm grupowania** (kategoria czy tag). ← initial framing (opcja tagu)
2. **Widoczność w czasie**: co pokazuje pasek i co losuje „Wszystkie” w danym dniu, i skąd aplikacja zna dzień.
3. **Zapamiętane ustawienia poza sezonem**: profil pamięta kategorię, której dziś nie ma na pasku.
4. **Rysowalność obiektów**: czy kandydaci spełniają reguły katalogu i czterech kart.
5. **Zakres na termin**: ile z tego musi zdążyć przed grudniem.

## Hypothesis Investigation

| Hypothesis                                                                                  | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Verdict                                   |
| ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| 1. Sezonowy tag to realna alternatywa                                                       | S-43 taguje **rodzaje kart** na stronie głównej, a nie obiekty (`roadmap.md` S-43). Glosariusz zabrania nazywać kategorię „tag” (`glossary.md:41`). PRD przewiduje już „sezonową kategorię (święta, pory roku)” (`prd.md`, Katalog szablonów obiektów). Obiekt może mieć kilka kategorii (`template-format.ts:42`).                                                                                                                                                                                                                                                                                                                                 | NONE (tag) / STRONG (kategoria)           |
| 2. Widoczność zależna od daty da się zrobić bez backendu i bez niedeterministycznych testów | Każda strona generatora to `client:only="react"` (`src/pages/*.astro`), więc datę bierze urządzenie i nie ma rozjazdu SSR. W `src` nic dziś nie czyta zegara (brak `new Date` i `Date.now` poza testami), więc to pierwszy zegar w aplikacji. Lista paska to dziś statyczne `OBJECT_CATEGORY_CHOICES` (`templates.ts:45`), czytane w `CategoryChoice.tsx:22`, trzech generatorach i `card-summary.ts:166`. „Wszystkie” zwraca cały katalog (`templates.ts:58`). Wystarczy jedna czysta funkcja „kategorie w dniu D” z datą jako argumentem: testy podają datę wprost, a e2e nie sprawdza wierszy kategorii (`phone-settings-rows.spec.ts:122-138`). | STRONG                                    |
| 3. Zapamiętana kategoria poza sezonem psuje odczyt                                          | Odczyt jest tolerancyjny tylko wobec **nieznanych** wartości (`card-settings.ts:212-213`). Kategoria znana, ale dziś niewidoczna (np. `boze-narodzenie` w lutym), przeszłaby i pasek pokazałby kategorię, której nie ma na liście. Podsumowanie profilu pokazałoby jej etykietę (`card-summary.ts:72,91,99,131`). Trzeba ustalić regułę: poza oknem pasek pokazuje „Wszystkie”.                                                                                                                                                                                                                                                                     | STRONG (do decyzji w planie, nie blokuje) |
| 4. Kandydaci dadzą się narysować                                                            | Osiem kredek bez białej (`template-format.ts:1`), dziury z `holeColor` albo białe, bez styku rogiem (`templates.test.ts:104`). Każdy obiekt nonogramu ma działający wariant (`nonogram/generate.test.ts:122,137`). Każda zdefiniowana kategoria daje ≥2 karty nonogramu i ≥2 obrysy dyktanda na każdym rozmiarze (`object-categories.test.ts:117,143`), więc nie można zdefiniować pory roku bez obiektów. Mikołaj, renifer, skarpeta i laska cukrowa odpadają (patrz lista).                                                                                                                                                                       | STRONG dla listy niżej                    |

## Narrowing Signals

- Pora roku i święto to ta sama rzecz w danych: **kategoria z oknem dat**. Pory roku dzielą rok na cztery okna bez przerw, a święto ma jedno krótkie okno, które może zachodzić na porę roku.
- Termin dotyczy tylko Bożego Narodzenia. Pory roku potrzebują decyzji, który istniejący obiekt pasuje do której pory (tulipan, biedronka i królik do Wiosny; truskawka, ananas, kotwica i latarnia do Lata; muchomor, gruszka i sowa do Jesieni, która jest najcieńsza), a Jesień i Zima potrzebują nowych rysunków.
- Dziś (2026-11-14) przypada Jesień. Przed grudniem, czyli w terminie, widoczna musi być kategoria specjalna, a nie Zima.

## Reframed Problem Statement

> **The actual problem to plan around is**: kategoria obiektów, która pojawia się na pasku tylko w swoim oknie dat (pierwszy zegar w aplikacji, jako czysta funkcja z datą w argumencie), i pierwsza taka kategoria „Boże Narodzenie” z 4–5 nowymi rysunkami oraz istniejącą choinką i gwiazdą.

Pory roku używają tego samego mechanizmu, ale nie muszą zdążyć na święta, więc idą osobnym kawałkiem.

Rekomendacje (do potwierdzenia):

- **S-38 = mechanizm okna dat + „Boże Narodzenie”.** Wiosna, Lato, Jesień i Zima wchodzą osobnym kawałkiem po świętach. Każda pora dochodzi, gdy ma ≥4 obiekty w każdym rozmiarze.
- **Okno „Bożego Narodzenia”: 15 listopada – 6 stycznia.** Pozwala drukować przed grudniem i trwa do Trzech Króli.
- **Pasek w oknie:** „Wszystkie”, potem kategoria specjalna, potem pora roku, potem sześć kategorii stałych alfabetycznie. Sezonowe idą zaraz po „Wszystkie”, bo to nowość, której rodzic szuka (zmienia to zdanie o alfabecie w US-20). Poza oknem pasek ma 7 pozycji (Wszystkie, 6 stałych i pora roku), a w oknie święta 8.
- **„Wszystkie” poza oknem** nie losuje obiektów, które mają tylko kategorie z oknem (bombka, prezent). Obiekty z kategorią stałą (choinka w Przyrodzie, gwiazda w Kształtach, pingwin) są zawsze.
- **Zapamiętana kategoria poza oknem** czyta się jako „Wszystkie”, tak jak dziś nieznana wartość. Czy zapis ma ją nadpisywać, rozstrzyga plan.
- **Granice pór roku** (do kawałka pór roku): meteorologiczne, od 1 grudnia, 1 marca, 1 czerwca i 1 września. To najprostsza reguła („pora roku = miesiąc”), a grudzień jest wtedy zimą, tak jak go widzi dziecko.

**Lista „Bożego Narodzenia” (do potwierdzenia)** — dwie istniejące drogi do kart (decyzja 2026-11-14: nie każdy obiekt musi być na każdej karcie):

- **Obiekt z szablonów** (`symmetry/objects/*.ts`) idzie na wszystkie cztery karty naraz: symetria, nonogram, dyktando, „Skopiuj obrazek”. Musi być symetryczny lewo–prawo, mieć trzy rozmiary, kolory kredek i działający wariant nonogramu średniego i trudnego (`nonogram/generate.test.ts:122,137`). Nie da się go dziś wyłączyć z jednej karty.
- **Kształt dyktanda** (`dictation/shapes.ts`) idzie tylko na dyktando. Nie musi być symetryczny, nie ma kolorów ani części, rysuje się go raz na poziom (poziom bez rysunku jest pomijany), a jego odbicie to drugi obrys. Tędy wchodzą obiekty, które nie pasują do symetrii.

A. Obiekty z szablonów (symetria, nonogram, dyktando, „Skopiuj obrazek”):

| Obiekt                       | Kolory (kredki)                                        | Ryzyko                                        |
| ---------------------------- | ------------------------------------------------------ | --------------------------------------------- |
| choinka (istnieje, Przyroda) | zielony, brąz, bombki czerwone                         | brak, dopisać kategorię                       |
| gwiazda (istnieje, Kształty) | żółty                                                  | brak, dopisać kategorię                       |
| bombka                       | czerwony, zawieszka żółta, wzór jako dziury            | prawie okrągła, ratuje ją zawieszka           |
| dzwonek                      | żółty, kokarda czerwona                                | niskie                                        |
| prezent                      | czerwony, wstążka żółta lub zielona                    | dziury muszą zostawić nonogram jednoznaczny   |
| piernik (ludzik)             | brąz, lukier jako białe dziury                         | ręce i nogi bez styku rogiem w 4×12           |
| bałwanek                     | szary (brak białej), kapelusz czarny, nos pomarańczowy | szary w kolorach; kule stykają się bokiem     |
| aniołek (opcjonalnie)        | żółty, skrzydła szare                                  | skrzydła w połowie 4×12                       |
| świeca (opcjonalnie)         | czerwony, płomień żółty i pomarańczowy                 | bardzo prosta, przez co mało warta na trudnym |

B. Kształty dyktanda (tylko dyktando, asymetryczne):

| Kształt                                       | Poziomy                                 | Ryzyko                          |
| --------------------------------------------- | --------------------------------------- | ------------------------------- |
| skarpeta                                      | łatwy, średni, trudny                   | niskie, wyraźne „L”             |
| laska cukrowa                                 | średni, trudny (na łatwym hak za wąski) | hak musi mieć 2 kratki grubości |
| rękawiczka                                    | łatwy, średni, trudny                   | niskie, kciuk z boku            |
| czapka Mikołaja (opadający czubek z pomponem) | średni, trudny                          | pompon nie może dotykać rogiem  |
| sanki (z boku)                                | średni, trudny                          | płozy bez styku rogiem          |
| renifer (z boku, opcjonalnie)                 | trudny                                  | poroże; zachodzi na S-39        |

**Decyzja użytkowniczki (2026-11-14): pełna lista, nie minimum.** A to 7 nowych obiektów (bombka, dzwonek, prezent, piernik, bałwanek, aniołek, świeca) oraz choinka i gwiazda z dopisaną kategorią, razem 9 w „Bożym Narodzeniu”. B to 6 kształtów dyktanda (skarpeta, laska cukrowa, rękawiczka, czapka Mikołaja, sanki, renifer). Kolejność rysowania, gdyby termin wymusił cięcie: najpierw bombka, dzwonek, prezent, piernik, skarpeta i laska cukrowa (dawne minimum), potem bałwanek, rękawiczka i czapka, na końcu aniołek, świeca, sanki i renifer. Obiekt, który nie przejdzie reguł kart albo jest nieczytelny w 4×12, odpada bez zastępstwa. Kształty dyktanda są tańsze (jedna bitmapa na poziom, bez części i kolorów). Odpadają: Mikołaj w całości (postać, biała broda, nieczytelny w 4×12, zachodzi na S-39) i gwiazda betlejemska jako kwiat (widziana z góry). Nowa droga „asymetryczny obiekt także na nonogram” to osobny mechanizm, poza terminem.

**Kształty asymetryczne także na „Skopiuj obrazek” (prośba użytkowniczki 2026-11-14).** Karta nie ma osi, więc kształt nie musi być symetryczny. Kod bierze jednak dziś tylko obiekty z szablonów:

- generator losuje z `symmetryTemplatesFor` (`copy-drawing/generate.ts:21`);
- klucz karty to `poziom:szablon:warianty` (`card.ts:19`), a sprawdzenie porównuje wzór z obrazem szablonu (`card.ts` `expectedPattern`);
- kolory czyta z kredek szablonu (`copy-drawing/colors.ts:14`).

Kształt dyktanda nie ma kolorów ani części. Pasuje za to szerokością do siatek karty (np. statek ma 8, 12 i 18 kolumn przy siatkach 8×12, 12×15 i 18×24), a środkowanie w pionie już jest (`centerSilhouette`). Wejście kształtów to więc zmiana mechanizmu karty: drugie źródło obrazka, klucz, sprawdzenie, jeden kolor kredki na kształt przy włączonych kolorach, środkowanie w poziomie. Do tego zdanie w US-27 („sylwetka z katalogu szablonów”) i nazwa w glosariuszu („kształt dyktanda” przestaje być tylko dyktanda).

Issue: drpc1/printo-kids#379. Rekomendacja: ostatnia faza S-38, którą można wyciąć, jeśli termin się skróci, bo obiekty z drogi A i tak trafiają na „Skopiuj obrazek”. Do decyzji: czy na kartę wchodzą wszystkie kształty (11 istniejących i nowe świąteczne), czy tylko świąteczne. Wszystkie dają więcej różnych kart, ale zmieniają losowanie „Wszystkie” na istniejącej karcie i każdy istniejący kształt potrzebuje koloru.

## Confidence

- **HIGH**: kategoria, a nie tag. Okno dat jako czysta funkcja z datą w argumencie (`client:only`, brak innego zegara).
- **MEDIUM**: lista obiektów, bo rysowalność potwierdzą testy nonogramu i dyktanda. Także termin: pierwszy zegar w aplikacji i reguła odczytu poza oknem powiększają S-38 względem samego dopisania kategorii.

## What Changes for /10x-plan

Plan obejmuje teraz dwie rzeczy. Pierwsza to mechanizm, czyli kategoria z oknem dat. Funkcja „kategorie w dniu D” daje listę paska i zakres „Wszystkie”, a odczyt ustawień zamienia kategorię spoza okna na „Wszystkie”. Druga to rysunki „Bożego Narodzenia”. Do tego PRD (US-19, US-20, FR-028, FR-029, Katalog szablonów obiektów), glosariusz (nowe pojęcia „kategoria z oknem dat”, „pora roku”, „kategoria specjalna”) i roadmapa: nowy kawałek „Pory roku” po S-38.

## References

- `src/lib/symmetry/template-format.ts:1,6-15,42`; `src/lib/symmetry/templates.ts:23-62`
- `src/lib/card-settings.ts:118-125,212-213`; `src/lib/card-summary.ts:72-167`; `src/components/CategoryChoice.tsx:22`
- `src/pages/*.astro` (`client:only="react"`)
- `src/lib/object-categories.test.ts:52-143`; `src/lib/symmetry/templates.test.ts:31,104`; `src/lib/nonogram/generate.test.ts:122,137`
- `src/lib/symmetry/objects/przyroda.ts:8-130` (choinka), `objects/ksztalty.ts:69` (gwiazda); `src/lib/odd-one-out/icons.ts:7-9` (własne kategorie, nie dotyczy)
- `context/domain/glossary.md:41,46`; `context/foundation/prd.md` US-19, US-20, FR-028, FR-029; `roadmap.md` S-38, S-43, MS-03
