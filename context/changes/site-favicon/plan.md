# Ikona zakładki w charakterze strony — Implementation Plan

## Overview

Podmienić czarny znak Astro w zakładce na kartkę z krótkim labiryntem, szałwią na papierze strony, i podać ten sam znak jako apple-touch oraz w manifeście (GitHub issue #29, `Closes #29`). Słowo „PrintoKids” i druk karty zostają.

## Current State Analysis

Jedyny link ikony jest w `src/layouts/Layout.astro` i wskazuje `/favicon.png`. Ten plik to czarny znak Astro ze startowego szablonu. Nie ma `apple-touch-icon`, `theme-color` ani manifestu. Ten sam układ owija katalog i wszystkie generatory, a strony nie dokładają własnych linków w `<head>`.

Papier strony to `--background` (`oklch(0.9621 0.0074 80.721)`), szałwia przycisków to `--primary` (`oklch(0.5284 0.0483 135.7039)`). Miniatury w `public/thumbnails/` to pełne karty A4, nie znak zakładki.

## Desired End State

W zakładce widać kryjącą ikonę: papier jak tło strony, na nim szałwiowa kartka z zagiętym rogiem i krótkim labiryntem, czytelną w rozmiarze około 16 px. Nie ma znaku Astro. Ten sam rysunek jest plikiem apple-touch i ikonami manifestu. Manifest nazywa stronę PrintoKids, ma `display: "browser"` i nie instaluje service workera. Napis „PrintoKids” oraz druk karty wyglądają jak przed zmianą.

### Key Discoveries:

- `src/layouts/Layout.astro:17` — `link rel="icon" type="image/png" href="/favicon.png"`. Adres zostaje.
- `src/styles/global.css:7` i `:13` — papier i szałwia. W pliku PNG odpowiadają im `#f5f2ed` i `#5f7256`.
- `scripts/build-thumbnails.mjs:4` — hex w statycznym pliku `public/` jest dozwolony; zakaz hexów dotyczy stron i komponentów.
- `package.json` skrypt `test` wymienia pliki z nazwy. Nowy test trzeba dopisać do tej listy, inaczej `npm test` go nie uruchomi.
- `context/foundation/roadmap.md` nie ma Change ID `site-favicon`.

## What We're NOT Doing

- Service worker, tryb offline, prompt instalacji i `display: "standalone"`.
- Zamiana linku zakładki na SVG albo drugi plik obok `/favicon.png`.
- `theme-color`, zmiana `lang` w układzie, podmiana miniatur katalogu i rysunku słowa „PrintoKids”.
- Zmiana druku karty.

## Implementation Approach

Jeden rysunek (kartka z zagiętym prawym górnym rogiem i trzema kreskami krótkiego labiryntu) trafia do kilku PNG o ustalonych rozmiarach. Faza 1 podmienia tylko ikonę zakładki. Faza 2 dokłada większe PNG, manifest i dwa linki w tym samym `<head>`.

## Critical Implementation Details

Tło każdego PNG jest kryjącym papierem `#f5f2ed`, kreska szałwią `#5f7256`. Przezroczyste tło wzięłoby kolor zakładki przeglądarki. Manifest ma `display: "browser"` i nie dostaje service workera, bo strona druku ma zostać stroną. Przeglądarki cache’ują favicon pod tym samym adresem, więc ocena zakładki wymaga twardego odświeżenia.

## Phase 1: Ikona zakładki

### Overview

Zastąpić `public/favicon.png` zatwierdzonym znakiem. Link w układzie zostaje.

### Changes Required:

#### 1. Plik ikony zakładki

**File**: `public/favicon.png`

**Intent**: Usunąć znak Astro z zakładki i wstawić znak, który da się odczytać jako kartkę z labiryntem.

**Contract**: PNG 32×32 pod dotychczasowym adresem `/favicon.png`. Tło kryje cały kwadrat papierem `#f5f2ed`. Znak jest szałwią `#5f7256`: pionowa kartka, zagięty róg u góry po prawej, w środku trzy grube kreski (pozioma, pionowa w dół, pozioma). Kreska ma zostać widoczna po zeskalowaniu do 16 px. `src/layouts/Layout.astro` w tej fazie bez zmian.

#### 2. Sprawdzenie rozmiaru PNG

**File**: `scripts/site-icons.test.mjs`, `package.json`

**Intent**: `npm test` ma wyłapać przypadek, w którym plik zakładki znów nie jest PNG 32×32.

**Contract**: Test czyta nagłówek `public/favicon.png` i wymaga PNG o szerokości 32 i wysokości 32. Plik testu jest dopisany do skryptu `test` w `package.json`. W tej fazie test nie wymaga jeszcze apple-touch ani manifestu.

### Success Criteria:

#### Automated Verification:

- `npm test` sprawdza, że `public/favicon.png` jest PNG 32×32
- `npm test` przechodzi
- `npm run lint` przechodzi

#### Manual Verification:

- Po twardym odświeżeniu zakładka pokazuje kartkę z krótkim labiryntem na papierze, bez znaku Astro
- Znak da się odczytać w rozmiarze zakładki, a napis „PrintoKids” i druk karty są bez zmian

**Implementation Note**: Po zielonej weryfikacji automatycznej zatrzymaj się na ręczne potwierdzenie, zanim zacznie się faza 2. W blokach faz są zwykłe wypunktowania. Odpowiadające im pola `- [ ]` są tylko w `## Progress`.

---

## Phase 2: Apple-touch i manifest

### Overview

Dodać ten sam znak jako ikonę ekranu głównego i jako ikony manifestu oraz podlinkować oba w układzie.

### Changes Required:

#### 1. Większe PNG

**File**: `public/apple-touch-icon.png`, `public/icon-192.png`, `public/icon-512.png`

**Intent**: Ten sam znak ma być ostry na ekranie głównym i w manifeście, nie tylko w zakładce 32 px.

**Contract**: Ten sam rysunek i te same dwa kolory co w fazie 1. `apple-touch-icon.png` jest 180×180, `icon-192.png` jest 192×192, `icon-512.png` jest 512×512. Tło każdego pliku jest kryjącym papierem.

#### 2. Manifest

**File**: `public/site.webmanifest`

**Intent**: Przeglądarka ma dostać nazwę strony i ikony bez zamieniania PrintoKids w aplikację instalowaną offline.

**Contract**: JSON z `name` i `short_name` równymi `PrintoKids`, `start_url` równym `/`, `display` równym `browser`. Tablica `icons` wskazuje `/icon-192.png` (`sizes` `192x192`, `type` `image/png`) i `/icon-512.png` (`sizes` `512x512`, `type` `image/png`). Nie ma `service worker`. Nie ma pola, które przełącza stronę w tryb standalone.

#### 3. Linki w układzie

**File**: `src/layouts/Layout.astro`

**Intent**: Katalog i generatory mają dostać apple-touch i manifest z jednego układu.

**Contract**: Obok istniejącego `href="/favicon.png"` dochodzą `rel="apple-touch-icon"` z `href="/apple-touch-icon.png"` oraz `rel="manifest"` z `href="/site.webmanifest"`. Dotychczasowy link ikony zakładki zostaje, łącznie z `type="image/png"`.

#### 4. Rozszerzenie testu

**File**: `scripts/site-icons.test.mjs`

**Intent**: Rozmiary nowych PNG i treść manifestu oraz linków mają paść w `npm test`, zanim ktoś otworzy zakładkę.

**Contract**: Test wymaga PNG 180×180, 192×192 i 512×512 pod ścieżkami z tej fazy, `display` równego `browser` w `public/site.webmanifest` oraz obu nowych `href` w `src/layouts/Layout.astro`. Sprawdzenie 32×32 z fazy 1 zostaje.

### Success Criteria:

#### Automated Verification:

- `npm test` sprawdza PNG 180, 192 i 512, `display` równy `browser` oraz oba nowe `href` w układzie
- `npm test` przechodzi
- `npm run lint` przechodzi
- `npx astro check` przechodzi

#### Manual Verification:

- Na `/` i na `/labirynt` w źródle strony widać link apple-touch i link manifestu
- Ikony z manifestu to ta sama kartka z krótkim labiryntem co w zakładce

**Implementation Note**: Po zielonej weryfikacji automatycznej zatrzymaj się na ręczne potwierdzenie tej fazy.

---

## Testing Strategy

### Unit Tests:

- Nagłówki PNG: 32×32, potem także 180×180, 192×192 i 512×512.
- Manifest: `display` to `browser`, nazwa to PrintoKids.
- Układ: istniejący `href="/favicon.png"` oraz dwa nowe `href`.

### Integration Tests:

- Brak nowego scenariusza HTTP. `scripts/smoke.mjs` nadal sprawdza zdania katalogu i generatorów, nie piksele ikony.

### Manual Testing Steps:

1. Twarde odświeżenie katalogu i spojrzenie na zakładkę.
2. Wejście na `/labirynt` i sprawdzenie, że zakładka jest ta sama.
3. Podgląd źródła: link ikony, apple-touch i manifest.
4. Otwarcie `/site.webmanifest` i porównanie ikon z zakładką.
5. Jedno drukowanie karty, żeby potwierdzić, że arkusz się nie zmienił.

## Performance Considerations

Ikony są statycznymi plikami w `public/`. Największy to PNG 512×512 jednego płaskiego znaku. Nie ma kosztu w czasie generowania karty.

## Migration Notes

Podmiana idzie w ten sam adres `/favicon.png`. Stary znak Astro znika z repozytorium razem z plikiem. Przeglądarka może trzymać poprzednią ikonę do twardego odświeżenia albo do opróżnienia cache ikon.

## References

- GitHub issue #29
- `src/layouts/Layout.astro:17`
- `src/styles/global.css:7`, `src/styles/global.css:13`
- `scripts/build-thumbnails.mjs:4`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles. See `references/progress-format.md`.

### Phase 1: Ikona zakładki

#### Automated

- [x] 1.1 `npm test` sprawdza, że `public/favicon.png` jest PNG 32×32 — 2865841
- [x] 1.2 `npm test` przechodzi — 2865841
- [x] 1.3 `npm run lint` przechodzi — 2865841

#### Manual

- [x] 1.4 Po twardym odświeżeniu zakładka pokazuje kartkę z krótkim labiryntem na papierze, bez znaku Astro — 2865841
- [x] 1.5 Znak da się odczytać w rozmiarze zakładki, a napis „PrintoKids” i druk karty są bez zmian — 2865841

### Phase 2: Apple-touch i manifest

#### Automated

- [x] 2.1 `npm test` sprawdza PNG 180, 192 i 512, `display` równy `browser` oraz oba nowe `href` w układzie
- [x] 2.2 `npm test` przechodzi
- [x] 2.3 `npm run lint` przechodzi
- [x] 2.4 `npx astro check` przechodzi

#### Manual

- [x] 2.5 Na `/` i na `/labirynt` w źródle strony widać link apple-touch i link manifestu
- [x] 2.6 Ikony z manifestu to ta sama kartka z krótkim labiryntem co w zakładce
