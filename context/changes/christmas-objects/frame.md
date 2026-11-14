# Frame Brief: Świąteczne obiekty w katalogu szablonów (S-38)

> Framing step before /10x-plan. This document captures what is _actually_
> at issue, separated from what was initially assumed.

## Reported Observation

Rodzic chce przed grudniem 2026 drukować karty symetrii, nonogramu, dyktanda graficznego i „Skopiuj obrazek” ze świątecznymi obiektami. Katalog szablonów ma dziś 34 obiekty w sześciu kategoriach i żadnej świątecznej (roadmapa S-38, issue drpc1/printo-kids#369, MS-03: „pierwszy sezon Boże Narodzenie”).

## Initial Framing (preserved)

- **User's stated cause or approach**: brakuje świątecznych obiektów; otwarte są trzy rzeczy: siódma kategoria „Święta” czy sezonowy tag, obiekty przez cały rok czy tylko w sezonie, i lista obiektów (roadmapa S-38 Unknowns).
- **User's proposed direction**: dodać do katalogu szablonów od 4 do 8 świątecznych obiektów (np. bombka, choinka z ozdobami, Mikołaj, bałwanek, piernik, gwiazda betlejemska) w trzech rozmiarach. Zakres mały, bo jest termin.
- **Pre-dispatch narrowing**: zawęża sam brief sesji nadrzędnej. Trzy decyzje są nazwane wprost, a celem jest szybkość. Krok 1.5 nie zadał osobnych pytań, bo sesja nie ma rozmowy z użytkowniczką przed rozpoznaniem. Decyzje 2 i 3 są w pytaniu na końcu.

## Dimension Map

1. **Mechanizm grupowania** (kategoria czy tag): czy „sezonowy tag” w ogóle istnieje albo powstanie w S-43 dla obiektów. ← initial framing (opcja tagu)
2. **Widoczność w czasie** (cały rok czy sezon): czy obiekty świąteczne poza sezonem przeszkadzają w „Wszystkie”, i czy da się to rozwiązać bez daty w wyniku.
3. **Rysowalność obiektów**: czy kandydaci spełniają reguły katalogu i cztery karty naraz (połowa 4×12, osiem kredek bez białej, jedno rozwiązanie nonogramu, obrys dyktanda bez styku rogiem, test „≥2 karty na kategorię i rozmiar”).
4. **Zasięg zmiany kategorii**: co jeszcze zmienia siódma kategoria (pasek, zapisane ustawienia, „Który nie pasuje”, testy, PRD, glosariusz).

## Hypothesis Investigation

| Hypothesis                                                   | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Verdict                                                |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| 1. Sezonowy tag to realna alternatywa, która tylko nie zdąży | S-43 to tagi **rodzajów kart** na stronie głównej („zawęża katalog na stronie głównej do kart z wybranym tagiem”, `roadmap.md` S-43), a nie obiektów szablonów. Tag obiektu byłby trzecim, nowym mechanizmem. Glosariusz wprost zabrania nazywać kategorię „tag” (`context/domain/glossary.md:41`). PRD przewiduje już **kategorię** sezonową: „Sezonowa kategoria (święta, pory roku) i »Morze« czekają na więcej obiektów” (`prd.md`, Katalog szablonów obiektów).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | NONE (tag) / STRONG (kategoria)                        |
| 2. Sezonowość wymaga daty w kodzie                           | Dzisiaj żadna logika nie zależy od daty. „Wszystkie” to po prostu cały katalog (`templates.ts:58`). Choinka z gwiazdą i bombkami jest już w Przyrodzie i w „Wszystkie” przez cały rok (`objects/przyroda.ts:8-40`, holeColor red = bombki). Ukrywanie według daty dokłada stan zależny od zegara do `contentKey` i testów. Wariant bez daty to obiekty „Święta” losowane tylko przy jawnie wybranej kategorii, ale łamie on dzisiejszą regułę „Wszystkie to każdy obiekt” (`object-categories.test.ts:66`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | WEAK (potrzeby nie ma w kodzie; to decyzja produktowa) |
| 3. Kandydaci z listy roadmapy dadzą się narysować            | Reguły: symetria lewo–prawo, pionowo, osiem kredek **bez białej** (`template-format.ts:1`), dziury z `holeColor` albo białe (`null`), bez styku rogiem (`templates.test.ts:104`). Każdy obiekt średniego i trudnego nonogramu ma mieć działający wariant (`nonogram/generate.test.ts:122,137`). Każda kategoria potrzebuje ≥2 kart nonogramu i ≥2 obrysów dyktanda na każdym rozmiarze (`object-categories.test.ts:117,143`). Mikołaj (postać, biała broda, słabo czytelny w 4×12, zachodzi na S-39), renifer (cienkie poroże) i skarpeta czy laska cukrowa (niesymetryczne) odpadają. „Gwiazda betlejemska” jest dwuznaczna: to i kwiat (poinsecja, widziany z góry, nie pionowy), i gwiazda z warkoczem.                                                                                                                                                                                                                                                                                                        | STRONG dla części listy, NONE dla Mikołaja i renifera  |
| 4. Siódma kategoria to mała zmiana                           | Pasek czyta `OBJECT_CATEGORY_CHOICES`, które sortuje się samo po polsku (`templates.ts:45-48`), więc „Święta” wpada między Przyrodę a Zwierzęta, jak każe US-20. Odczyt ustawień jest tolerancyjny: nieznana kategoria zamienia się na domyślną (`card-settings.ts:212-213`), więc stare wpisy nie wymagają migracji, a gdyby „swieta” kiedyś zniknęła, też spadnie na „Wszystkie”. „Który nie pasuje” ma własne kategorie ikon (`odd-one-out/icons.ts:7-9`), więc jej to nie dotyczy. E2E sprawdza tylko etykietę „Kategoria:” (`phone-settings-rows.spec.ts:122-138`). Na sztywno wpisane są: lista etykiet (`object-categories.test.ts:59-62`), glosariusz (`glossary.md:41`), PRD US-19, US-20 i FR-028 („sześć kategorii”), tabela katalogu („34 obiekty”) i `shape-notes.md:82,140`. Obiekt może mieć kilka kategorii (`template-format.ts:42`), więc istniejąca choinka i gwiazda mogą dostać „swieta” bez przestawiania (kolejność `CATALOG` w `templates.ts:32` zostaje, a nowy plik dochodzi na końcu). | STRONG                                                 |

## Narrowing Signals

- S-43 nie dotyczy obiektów, więc pytanie „kategoria czy tag” znika. Zostaje kategoria (decyzja 1 rozstrzygnięta z kodu i PRD, bez pytania).
- W katalogu są już dwa świąteczne obiekty: choinka z gwiazdą i bombkami oraz gwiazda. Dopisanie im kategorii daje „Świętom” dwa obiekty prawie bez kosztu, więc nowych rysunków wystarczy 4–5, a nie 6–8.
- Brak białej kredki zmienia bałwanka: w kolorach korpus jest szary (albo niebieski), a oczy i guziki to dziury `holeColor: black`. Na czarnej sylwetce nie ma problemu.

## Cross-System Convention

W repo każda grupa obiektów to kategoria (`OBJECT_CATEGORIES`) z własnym plikiem `symmetry/objects/<id>.ts`. Tak weszły też „Kształty” (GitHub 198), łącznie z tekstami w PRD, glosariuszu i teście etykiet. Kolejne sezony (MS-03 „pierwszy sezon”) wchodzą tą samą drogą, jako kolejne kategorie. Hipoteza kategorii jest zgodna z konwencją i z zapowiedzią w PRD.

## Reframed (or Confirmed) Problem Statement

> **The actual problem to plan around is**: dorysować 4–5 nowych świątecznych obiektów w trzech rozmiarach tak, by przeszły reguły czterech kart, i zebrać je razem z istniejącą choinką i gwiazdą w siódmej kategorii „Święta” (id `swieta`). Jedyna otwarta decyzja produktowa to to, czy poza sezonem pokazują się też w „Wszystkie”.

Ramę „kategoria czy tag” można usunąć: tag dla obiektów nie jest w planie (S-43 taguje rodzaje kart), a kategoria to istniejący mechanizm, który PRD już przewiduje. Ryzyko leży w rysunkach (czytelność w 4×12, nonogram, dyktando), a nie w mechanizmie.

**Rekomendacja 2 (widoczność): cały rok, także w „Wszystkie”, bez daty w kodzie.** Choinka z bombkami jest już tam cały rok, nie trzeba nowego mechanizmu, reguła „Wszystkie to każdy obiekt” zostaje, a testy są deterministyczne. Jeśli użytkowniczce przeszkadza bałwanek w lipcu w „Wszystkie”, wariantem bez daty jest „Święta tylko po jawnym wyborze kategorii”. Kosztuje to wyjątek w `symmetryTemplatesFor` i nową regułę w PRD i glosariuszu.

**Rekomendacja 3 (lista, do potwierdzenia):**

| Obiekt                       | Dlaczego pasuje                                      | Kolory (kredki)                                        | Ryzyko                                                                          |
| ---------------------------- | ---------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------- |
| choinka (istnieje)           | już ma gwiazdę i bombki; dopisać kategorię `swieta`  | zielony, brąz, bombki czerwone                         | brak                                                                            |
| gwiazda (istnieje, Kształty) | dopisać kategorię `swieta`                           | żółty                                                  | brak                                                                            |
| bombka                       | kula z zawieszką, paski i kropki jako dziury         | czerwony, zawieszka żółta                              | jest prawie okrągła, więc może się mylić z kołem i balonem; ratuje ją zawieszka |
| dzwonek                      | wyraźna sylwetka, serce dzwonu i kokarda jako części | żółty, kokarda czerwona                                | niskie                                                                          |
| prezent                      | pudełko z kokardą, wstążka jako dziury               | czerwony, wstążka żółta lub zielona                    | niskie (dziury muszą zostawić nonogram jednoznaczny)                            |
| piernik (ludzik)             | lukier jako białe dziury (`holeColor: null`)         | brąz                                                   | nogi i ręce bez styku rogiem w 4×12                                             |
| bałwanek                     | trzy kule i kapelusz; oczy i guziki jako dziury      | szary (brak białej), kapelusz czarny, nos pomarańczowy | szary bałwanek w kolorach; kule muszą stykać się bokiem, nie rogiem             |

Minimum na termin: bombka, dzwonek, prezent i piernik (4 nowe) plus choinka i gwiazda, czyli 6 obiektów w „Świętach” (US-19 wymaga ≥4). Bałwanek jest piąty, jeśli starczy czasu. Odpadają: Mikołaj (postać, biała broda, nieczytelny w 4×12, zachodzi na S-39), renifer (poroże ze stykami rogiem), skarpeta i laska cukrowa (niesymetryczne; mogą kiedyś wejść jako kształty dyktanda) oraz gwiazda betlejemska jako kwiat (widziana z góry, nie pionowa).

## Confidence

- **HIGH** dla decyzji 1 (kategoria): dowody w kodzie, PRD i glosariuszu, zgodne z konwencją „Kształtów”.
- **MEDIUM** dla listy: rysowalność potwierdza dopiero test nonogramu i dyktanda na rysunkach. Obiekt, który odpadnie, zastępuje inny z tabeli (reguła z PRD).

## What Changes for /10x-plan

Plan nie wybiera już mechanizmu, tylko dodaje kategorię `swieta` (jedna pozycja w `OBJECT_CATEGORIES`, nowy plik `objects/swieta.ts` na końcu `CATALOG`, kategoria dopisana choince i gwieździe). Główna praca to rysunki 4–5 obiektów × trzy rozmiary, z testami czterech kart, i aktualizacja „sześć kategorii” i „34 obiekty” w PRD, glosariuszu, shape-notes i teście etykiet. Bez daty i bez migracji ustawień, chyba że użytkowniczka wybierze „Święta tylko po jawnym wyborze”.

## References

- `src/lib/symmetry/template-format.ts:1,6-15,42`; `src/lib/symmetry/templates.ts:23-62`
- `src/lib/card-settings.ts:118-125,212-213`; `src/components/CategoryChoice.tsx`
- `src/lib/object-categories.test.ts:52-80`; `src/lib/symmetry/templates.test.ts:31,104`; `src/lib/nonogram/generate.test.ts:122,137`
- `src/lib/symmetry/objects/przyroda.ts:8-130` (choinka), `objects/ksztalty.ts:69` (gwiazda)
- `src/lib/odd-one-out/icons.ts:7-9`; `tests/e2e/phone-settings-rows.spec.ts:122-138`
- `context/domain/glossary.md:41,46`; `context/foundation/prd.md` US-19, US-20, FR-028, Katalog szablonów obiektów; `roadmap.md` S-38, S-43, MS-03
- Investigation: inline reads (no sub-agents; small surface)
