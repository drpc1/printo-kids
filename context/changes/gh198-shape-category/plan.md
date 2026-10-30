# Kategoria „Kształty” — plan wdrożenia

## Overview

Dodajemy szóstą kategorię obiektów „Kształty” do wspólnego katalogu szablonów (symetria, nonogram, dyktando): serce, gwiazda, koło, trójkąt, romb, krzyżyk, księżyc (poziomy sierp) i chmurka, każda w trzech rozmiarach (połowa 4×12, 6×15, 9×24) z losowanymi ozdobami. Figura, która łamie reguły którejś karty w którymś rozmiarze, odpada, ale zostają co najmniej cztery w każdym rozmiarze.

## Current State Analysis

- Kategorie to `OBJECT_CATEGORIES` w `src/lib/symmetry/template-format.ts:4`; `CATALOG` w `src/lib/symmetry/templates.ts:18` zbiera pliki z `src/lib/symmetry/objects/*.ts`, a filtr „Kategoria” bierze listę z `OBJECT_CATEGORY_CHOICES`.
- Zapisana kategoria w profilu i w ostatnich parametrach jest walidowana względem `OBJECT_CATEGORY_CHOICES` (`src/lib/card-settings.ts:125`), a etykieta w podsumowaniu i na miniaturze bierze się z tej samej listy (`src/lib/card-summary.ts:120`). Nowy id działa bez migracji.
- Obiekt to trzy szablony (`half4`, `half6`, `half9`) z `base`, `parts` (losowane warianty) i `holeColor`; wzór: `LOLLIPOP_4/6/9` w `src/lib/symmetry/objects/jedzenie.ts:670`.
- Testy narzucają: ≥4 obiekty na kategorię w każdym rozmiarze (`templates.test.ts:47`), te same obiekty w każdym rozmiarze (`templates.test.ts:21`), co najmniej jeden zestaw wariantów z sylwetką w jednym kawałku bez styku rogiem (`templates.test.ts:78`; wyjątek `CORNER_TOUCH_ALLOWED`).
- Nonogram pokazuje tylko warianty z jednym rozwiązaniem bez zgadywania (`src/lib/nonogram/generate.ts:108`); dyktando buduje katalog kart per poziom i kategoria (`src/lib/dictation/generate.ts:93`).
- `src/lib/object-categories.test.ts` przypina listę etykiet („Zwierzęta … Domy i budowle”), a `src/components/CategoryChoice.tsx:6` mówi w komentarzu o „five categories”.

## Desired End State

Pasek „Kategoria” na symetrii, nonogramie i dyktandzie ma wpis „Kształty”; wybranie go daje kartę z jedną z figur, a kolejne Generuj daje inną kartę. Profil zapamiętuje kategorię i pokazuje ją w podsumowaniu. PRD opisuje szóstą kategorię i wyjątek od „pionowy”. `npm run lint`, `npm test`, `npx astro check` i `npm run build` przechodzą.

### Key Discoveries:

- Nowy id kategorii działa w profilu i podsumowaniu bez migracji (`card-settings.ts:125`, `card-summary.ts:120`).
- Wysokość szablonu jest niezależna od wysokości siatki (przesunięcie wiersza wchodzi do klucza karty, `symmetry/generate.ts:47`), więc figury o proporcji 1:1 mieszczą się w siatce wyższej niż szerokiej.
- Test „te same obiekty w każdym rozmiarze” wymusza, że figura odpada ze wszystkich rozmiarów naraz, a nie z jednego.

## What We're NOT Doing

- Kształtów dyktanda bez osi symetrii z #115 (zostają w `dictation/shapes.ts`) ani kategorii dla korony (nie weszła na listę figur).
- Zmiany poziomów, rozmiarów siatek, kolorów kredek ani układu karty.
- Rozciągania figur na całą wysokość siatki: koło ma być kołem.
- Nowych kontrolek, ekranów ani zmian w modelu danych profilu.

## Implementation Approach

Najpierw rysunki i miernik reguł (faza 1), bo ryzyko leży w tym, które figury przejdą trzy zestawy reguł naraz. Potem selekcja, ozdoby i testy zmienności (faza 2), na końcu zasięg poza szablonami: tekst UI, testy ustawień i PRD (faza 3).

## Phase 1: Kategoria, rysunki i miernik reguł

### Overview

Kategoria widoczna w katalogu z ośmioma figurami w trzech rozmiarach oraz tymczasowy raport, które figury przechodzą symetrię, nonogram i dyktando.

### Changes Required:

#### 1. Id kategorii i lista

**File**: `src/lib/symmetry/template-format.ts`, `src/lib/symmetry/templates.ts`

**Intent**: Dodać szóstą kategorię na końcu listy (po „Domy i budowle”). Do `CATALOG` wpinamy tylko te figury, które przeszły miernik (pkt 4), więc `npm test` zostaje zielony na końcu fazy.

**Contract**: `OBJECT_CATEGORIES` zyskuje `{ id: "ksztalty", label: "Kształty" }`; `ObjectCategoryId` obejmuje `"ksztalty"`; `CATALOG` zawiera `KSZTALTY: SymmetryObjectSizes` z samymi figurami, które przeszły miernik, i co najmniej czterema w każdym rozmiarze (jeśli któryś rozmiar ma mniej, rysunki wracają do poprawki przed wpięciem).

#### 2. Figury

**File**: `src/lib/symmetry/objects/ksztalty.ts` (nowy)

**Intent**: Osiem obiektów (serce, gwiazda, koło, trójkąt, romb, krzyżyk, księżyc jako poziomy sierp, chmurka) po trzy szablony. Figury zachowują proporcje (koło 1:1), zajmują pas siatki i dotykają osi. Każda ma losowane części (ozdoba: dziura w środku, kropki, pasek), jak `pattern` i `bow` w lizaku. Kolory kredek i `holeColor` ustawić tak, by figura była czytelna w kolorze.

**Contract**: `export const KSZTALTY: SymmetryObjectSizes` z `half4`, `half6`, `half9`; każdy szablon ma `categories: ["ksztalty"]`, `width` zgodną z rozmiarem (4, 6, ≤9), te same `id` we wszystkich rozmiarach. Wymogi istniejących testów katalogu, które szablon musi spełnić: na 9×24 co najmniej 3 części (`symmetry/generate.test.ts`, test „7 lat”); każda część zmienia obraz, bo różne zestawy wariantów rysują różne kratki (test „different variant sets”); na 4×12 sylwetka zostawia miejsce na 3 kratki podpowiedzi (test „4 lat”); każdy zestaw wariantów komponuje się w poprawną kartę na każdym przesunięciu wiersza.

#### 3. Testy etykiet

**File**: `src/lib/object-categories.test.ts`, `src/lib/symmetry/templates.test.ts`

**Intent**: Zaktualizować przypięte etykiety i liczbę kategorii; dodać asercję, że „Kształty” mają obiekt w każdym rozmiarze.

**Contract**: Test paska oczekuje `["Wszystkie", …, "Domy i budowle", "Kształty"]`.

#### 4. Tymczasowy miernik

**File**: `src/lib/symmetry/templates.test.ts` (tymczasowy blok „ksztalty report”, usuwany w fazie 2)

**Intent**: Dla każdej figury i rozmiaru, liczonych z `KSZTALTY` bezpośrednio (nie przez `CATALOG`), wypisać: czy istnieje zestaw wariantów z czystym obrysem, ile wariantów nonogramu ma jedno rozwiązanie bez zgadywania, ile różnych obrysów daje dyktando. Wynik służy do wyboru figur do wpięcia w `CATALOG` i do selekcji w fazie 2.

**Contract**: Blok leży w `templates.test.ts`, bo `variantSets`, `silhouette` i `isCleanOutline` są tam i w `symmetry/generate.test.ts` prywatne (bez `export`). Nonogram liczy przez `composeNonogramCard` i `nonogramCardProblems`, dyktando przez obrys z `dictation/outline.ts`; nie zmienia kodu produkcyjnego.

### Success Criteria:

#### Automated Verification:

- Testy przechodzą z nową kategorią: `npm test`
- Typy przechodzą: `npx astro check`
- Lint przechodzi: `npm run lint`
- Miernik wypisuje wynik dla 8 figur × 3 rozmiarów: `node --experimental-strip-types --test src/lib/symmetry/templates.test.ts`

#### Manual Verification:

- Na `/symmetry`, `/nonogram`, `/dictation` pasek „Kategoria” ma wpis „Kształty” i da się wygenerować kartę.
- Figury są rozpoznawalne na ekranie (koło jest kołem, nie owalem).

**Implementation Note**: Po fazie 1 zatrzymaj się na ręczne potwierdzenie rysunków, zanim zaczniesz selekcję.

---

## Phase 2: Selekcja figur i zmienność kart

### Overview

Zostają figury, które przechodzą reguły trzech kart w każdym rozmiarze (co najmniej cztery), a Generuj daje kolejne różne karty.

### Changes Required:

#### 1. Poprawki albo usunięcie figur

**File**: `src/lib/symmetry/objects/ksztalty.ts`

**Intent**: Na podstawie raportu poprawić rysunek figur łamiących reguły (styk rogiem, dwa kawałki, brak wariantu z jednym rozwiązaniem), a tych, których nie da się poprawić, usunąć ze wszystkich trzech rozmiarów. Zostaje co najmniej 4 figury.

**Contract**: Wszystkie rozmiary mają ten sam zbiór `id`; żaden wyjątek w `CORNER_TOUCH_ALLOWED` nie jest dopisywany bez zapisu przyczyny w komentarzu.

#### 2. Testy kategorii na trzech kartach

**File**: `src/lib/object-categories.test.ts`

**Intent**: Rozszerzyć pętle po `CATEGORIES` tak, by „Kształty” miały ≥2 różne karty z rzędu na symetrii, nonogramie i dyktandzie w każdym rozmiarze (jak pozostałe kategorie), bez przypinania liczb.

**Contract**: Istniejące testy kategorii przechodzą dla szóstej kategorii bez specjalnego traktowania.

#### 3. Sprzątanie miernika

**File**: `src/lib/symmetry/templates.test.ts`

**Intent**: Usunąć tymczasowy blok miernika; liczby, które mają zostać w dokumentacji, trafiają do PRD (Open Questions 11) w fazie 3.

**Contract**: W `templates.test.ts` nie ma bloku „ksztalty report” po fazie.

### Success Criteria:

#### Automated Verification:

- Wszystkie testy przechodzą: `npm test`
- Typy i lint: `npx astro check`, `npm run lint`
- Co najmniej 4 figury w każdym rozmiarze: test `templates.test.ts` „every category has at least four objects”

#### Manual Verification:

- Kilkanaście razy Generuj w kategorii „Kształty” na każdej z trzech kart daje różne karty.
- Nonogram „Kształty” trudny i dyktando trudne mieszczą się na A4 i da się je rozwiązać.

---

## Phase 3: Zasięg poza szablonami i PRD

### Overview

Tekst UI, testy ustawień i podsumowania, PRD i weryfikacja w przeglądarce, także na telefonie.

### Changes Required:

#### 1. Komentarz UI

**File**: `src/components/CategoryChoice.tsx`

**Intent**: Poprawić komentarz o „five categories”; sprawdzić, że lista w oknie wyboru mieści sześć wpisów na telefonie.

**Contract**: Bez zmiany propsów.

#### 2. Testy profilu i podsumowania

**File**: `src/lib/card-settings.test.ts`, `src/lib/card-summary.test.ts`, `src/lib/catalog-badges.test.ts`

**Intent**: Dodać przypadek z kategorią `ksztalty`: zapisuje się i wczytuje, a podsumowanie pokazuje etykietę „Kształty”.

**Contract**: Zapisana nieznana kategoria nadal wraca do domyślnej.

#### 3. PRD

**File**: `context/foundation/prd.md`

**Intent**: Zaktualizować US-19, US-20, FR-028, FR-029, Business Logic „Katalog szablonów obiektów” (6 kategorii, tabela obiektów, wyjątek od „pionowy” dla figur 1:1) i Open Questions 11 (liczby z miernika). Usunąć z BL zapis, że „Kształty” czekają na GitHub 198.

**Contract**: Kategoria „Kształty” i lista figur zgodna z kodem; data decyzji 2026-10-30, GitHub 198.

#### 4. Weryfikacja w przeglądarce

**File**: (bez zmian w kodzie)

**Intent**: Sprawdzić wszystkie trzy strony z wybraną kategorią w podglądzie i w druku A4, w wąskim widoku telefonu.

**Contract**: Brak błędów w konsoli; Generuj i Drukuj się nie nakładają.

### Success Criteria:

#### Automated Verification:

- Pełny pakiet: `npm run lint`, `npm test`, `npx astro check`, `npm run build`
- Testy profilu i podsumowania przechodzą z kategorią `ksztalty`: `npm test`

#### Manual Verification:

- Wybór „Kształty” zapamiętuje się w profilu i widać go w podsumowaniu okna profilu.
- Karty trzech rodzajów w kategorii „Kształty” drukują się jako jedna strona A4 z marginesem 10 mm.
- Widok telefonu (360 px) pokazuje cały pasek „Kategoria” bez ucięcia.

---

## Testing Strategy

### Unit Tests:

- Kategoria na liście, ≥4 obiekty w każdym rozmiarze, te same id w rozmiarach.
- Sylwetka w jednym kawałku bez styku rogiem; jedno rozwiązanie nonogramu; różne karty dyktanda i symetrii w kategorii.
- Zapis i odczyt kategorii w ustawieniach i podsumowaniu.

### Integration Tests:

- Istniejące testy e2e pasków kart (Playwright) bez regresji.

### Manual Testing Steps:

1. Na każdej z trzech stron wybierz „Kształty” i kliknij Generuj kilka razy.
2. Włącz kolory na symetrii; sprawdź, że figury mają czytelne kolory.
3. Podgląd wydruku A4 i widok telefonu.

## Performance Considerations

Generowanie ma zostać poniżej 5 s; trudny nonogram sprawdza wszystkie warianty (dziś 1,5–6,7 s, próg testu 15 s), więc dodanie figur o małej liczbie części nie powinno przekroczyć progu. Do sprawdzenia w fazie 2.

## References

- Frame: `context/changes/gh198-shape-category/frame.md`
- Podobna implementacja: `src/lib/symmetry/objects/jedzenie.ts:670` (lizak), `src/lib/symmetry/objects/kosmos.ts:682` (kotwica)
- Reguły: `src/lib/symmetry/templates.test.ts:47,78`, `src/lib/nonogram/generate.ts:108`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Kategoria, rysunki i miernik reguł

#### Automated

- [x] 1.1 Testy przechodzą z nową kategorią i wpiętymi figurami, które przeszły miernik: `npm test`
- [x] 1.2 Typy przechodzą: `npx astro check`
- [x] 1.3 Lint przechodzi: `npm run lint`
- [x] 1.4 Miernik wypisuje wynik dla 8 figur × 3 rozmiarów

#### Manual

- [x] 1.5 Pasek „Kategoria” ma wpis „Kształty” na trzech stronach i da się wygenerować kartę
- [x] 1.6 Figury są rozpoznawalne na ekranie (koło jest kołem, nie owalem)

### Phase 2: Selekcja figur i zmienność kart

#### Automated

- [ ] 2.1 Wszystkie testy przechodzą: `npm test`
- [ ] 2.2 Typy i lint przechodzą: `npx astro check`, `npm run lint`
- [ ] 2.3 Co najmniej 4 figury w każdym rozmiarze

#### Manual

- [ ] 2.4 Kilkanaście razy Generuj w „Kształty” na każdej karcie daje różne karty
- [ ] 2.5 Nonogram trudny i dyktando trudne mieszczą się na A4 i da się je rozwiązać

### Phase 3: Zasięg poza szablonami i PRD

#### Automated

- [ ] 3.1 Pełny pakiet: `npm run lint`, `npm test`, `npx astro check`, `npm run build`
- [ ] 3.2 Testy profilu i podsumowania przechodzą z kategorią `ksztalty`

#### Manual

- [ ] 3.3 Wybór „Kształty” zapamiętuje się w profilu i widać go w podsumowaniu
- [ ] 3.4 Karty trzech rodzajów drukują się jako jedna strona A4 z marginesem 10 mm
- [ ] 3.5 Widok telefonu (360 px) pokazuje cały pasek „Kategoria” bez ucięcia
