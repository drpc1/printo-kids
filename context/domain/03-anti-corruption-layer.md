---
title: Plan refaktoru — warstwa antykorupcyjna dla Web Storage (pamięć urządzenia)
created: 2026-11-03
type: refactor-plan
---

# Plan refaktoru: `DeviceMemory` — jedyne miejsce, które zna `localStorage`

To jest **plan**, nie implementacja. Nie zmieniłem żadnego pliku produkcyjnego ani testu. Nie uruchamiałem `npm test`, Playwrighta, Strykera ani `depcruise`. Każde `plik:linia` poniżej otworzyłem albo wyświetliłem grepem w tej sesji. Wyjątek: cytaty z `02-invariant-aggregate-refactor.md` i `01-domain-distillation.md` oznaczam „za D01/D02".

Skróty: **PRD** = `context/foundation/prd.md`, **D01** = `context/domain/01-domain-distillation.md`, **AG** = `AGENTS.md`.

## 0. Kontekst i uczciwe zastrzeżenia

**Stack.** Astro 7 SSR na Cloudflare Workers, wyspy React 19, TypeScript, Tailwind 4 (`package.json`, `AGENTS.md:3`). Cała logika kart i profili działa w przeglądarce. W `src` nie ma `fetch(` ani `src/pages/api/` (grep w tej sesji; zgodne z D01:17), więc **nie ma kontraktów wire (DTO/response)** i nie ma biblioteki serwerowej wciąganej do bundla klienta. Te dwa sygnały z szablonu zadania nie mają tu zastosowania.

**Zależności zewnętrzne z manifestu** (`package.json`): `react`, `react-dom`, `radix-ui`, `lucide-react`, `clsx`, `tailwind-merge`, `class-variance-authority`, `astro`, `@astrojs/cloudflare`. Supabase **nie ma** w manifestu, choć `tech-stack.md:24` mówi, że starter go dostarcza („leave it unused").

**Ważne zastrzeżenie o przedmiocie planu.** Najgorszy przeciek, jaki znalazłem, to nie pakiet z npm, tylko **API platformy: Web Storage (`localStorage`)**. Kryterium „grep po nazwie pakietu" zamieniam więc na grep po `localStorage`, `Storage` i prefiksie kluczy `printo-kids:` (sekcja 6). Do tego **żaden dokument nie deklaruje, że magazyn ma być wymienialny** — nie mam rozjazdu „intencja vs kod" i nie będę go udawał. Najbliższe dowody intencji opisuję w 2.

**Czego nie sprawdziłem.** Nie otwierałem w tej sesji dokumentacji MDN ani specyfikacji HTML. Rozstrzygnięcia z sekcji 5 opieram na znanym mi kontrakcie Web Storage i oznaczam je jako do potwierdzenia testem w przeglądarce (faza 1).

## 1. Identyfikacja: kto dziś zna `localStorage`

### 1.1 Wołanie globalu `localStorage` — 36 miejsc w 7 plikach produkcyjnych

Grep `localStorage` w `src`, bez testów, daje dokładnie te trafienia:

| Warstwa | Plik | Linie (`localStorage`) |
|---|---|---|
| Skrypt Astro (katalog) | `src/components/CardCatalog.astro` | 43 |
| UI (React) | `src/components/ProfileCorner.tsx` | 183, 184, 187, 215, 221, 244, 255, 292, 300, 601, 619 |
| UI (React) | `src/components/WorksheetGenerator.tsx` | 81, 90, 96 |
| Hooki | `src/hooks/useBarCharacter.ts` | 41, 50, 56 |
| Hooki | `src/hooks/useCardSettings.ts` | 74, 75, 79, 85, 116, 126 |
| Hooki | `src/hooks/useChildProfileVisit.ts` | 50, 60, 66, 70, 71, 75, 98, 108, 109, 111 |
| Hooki | `src/hooks/useFavoriteCharacter.ts` | 31, 38 |

To cztery warstwy: skrypt Astro, komponenty, hooki, a pod nimi `lib`. Poza tym `src/lib/sheet/print-contract.test.ts:153` i `:177` mają komentarz, że wyspa czyta `localStorage` przy pierwszym renderze, więc nie może renderować się na serwerze — to ukryte ograniczenie wynikające z przecieku.

### 1.2 Kontrakt `Storage` zduplikowany w czterech interfejsach plus typ DOM

Każdy moduł `lib` deklaruje własny, prawie identyczny interfejs magazynu zamiast jednego:

- `src/lib/active-profile.ts:6` `ActiveProfileStorage` (`getItem`, `setItem`, `removeItem`)
- `src/lib/last-used.ts:6` `LastUsedStorage` (`getItem`, `setItem`)
- `src/lib/child-profiles.ts:9` `ChildProfileStorage` (`getItem`, `setItem`)
- `src/lib/sheet/own-image-store.ts:8` `OwnImageStorage` (`getItem`, `setItem`)
- `src/hooks/useChildProfileVisit.ts:141` `Pick<Storage, "getItem" | "setItem">` — typ DOM wprost w hooku

Konsumenci `lib`, którzy dostają magazyn w parametrze: `src/lib/catalog-badges.ts:23` (`storage: ChildProfileStorage`), `src/lib/sheet/own-image-store.ts:59` (`drawnVisitCharacter`) i `:86` (`recordBarCharacter`).

### 1.3 Klucze i kształt JSON rozsiane po czterech modułach i dziesięciu specach

Cztery klucze, każdy zdefiniowany we własnym module:

- `src/lib/active-profile.ts:1` `printo-kids:active-profile`
- `src/lib/last-used.ts:3` `printo-kids:last-used`
- `src/lib/child-profiles.ts:6` `printo-kids:child-profiles`
- `src/lib/sheet/own-image-store.ts:4` `printo-kids:own-image` (wyeksportowany jako `OWN_IMAGE_KEY`)

Te same literały są **przepisane** poza adapterem:

- w testach e2e: `tests/e2e/card-settings.spec.ts:9-11`, `catalog.spec.ts:8` i `:272`, `dialog-close.spec.ts:8`, `favorite-character.spec.ts:11-12`, `how-it-works.spec.ts:8-9`, `money.spec.ts:8-9`, `phone-layout.spec.ts:10`, `profile-summary.spec.ts:14-15`, `own-image.spec.ts:70`, `:73`, `:85`, `:103`, `level-bar.spec.ts:73`;
- w testach jednostkowych: `active-profile.test.ts:11`, `catalog-badges.test.ts:5-6`, `child-profiles.test.ts:19`, `last-used.test.ts:5`, `own-image-store.test.ts:92`, `:176`, `:180`.

Dwa e2e zasiewają **dawny kształt** `{ character, level }` (`level-bar.spec.ts:73`, `own-image.spec.ts:103`), więc wiedza o migracji `level` → `cards.labirynt` (`src/lib/card-settings.ts:139`, `parseStoredCards`) żyje też w teście.

Ten sam klucz `last-used` pisze **dwa moduły**: `writeLastUsed` (`last-used.ts:73`) i `writeLastUsedCards` (`last-used.ts:87`), a pierwszy jest wołany z `recordBarCharacter` w innym pliku (`own-image-store.ts:91`). Oba robią odczyt-modyfikację-zapis całego bloba, bez wspólnego miejsca na tę regułę.

### 1.4 Reguła „czytaj tuż przed zapisem" skopiowana trzy razy

Test-plan opisuje wzorzec: zapis czyta profile z `localStorage` tuż przed zapisem, żeby nie cofnąć zmiany z innej karty (`context/foundation/test-plan.md:155`). Kod ma tę regułę **w trzech kopiach**, każda z komentarzem lub z tą samą sekwencją `readChildProfiles` → `find` → `with…` → `writeChildProfiles`:

- `src/hooks/useCardSettings.ts:79-85` (ustawienia karty)
- `src/hooks/useFavoriteCharacter.ts:30-38` (komentarz w `:30`, „Read just before writing")
- `src/components/ProfileCorner.tsx:244-255` (komentarz przy `:243`)

Czwarte miejsce zapisu profili (`ProfileCorner.tsx:187`, usuwanie) bierze listę ze stanu i czyta `lastUsed` oraz `activeProfile` osobno (`:183-184`).

### 1.5 `ALLOWED_CHARACTER_IDS` jako drugi parametr przy każdym odczycie

`ALLOWED_CHARACTER_IDS` (`src/lib/sheet/character.ts:103`) jest przekazywany do `readChildProfiles` / `readLastUsed` w 11 miejscach produkcyjnych (`ProfileCorner.tsx:183`, `:244`; `useCardSettings.ts:74`, `:79`, `:116`, `:126`; `useChildProfileVisit.ts:70`, `:142`, `:143`; `useFavoriteCharacter.ts:31`; `catalog-badges.ts:24-25`). Wiedza „które postacie są dozwolone przy czytaniu z dysku" jest więc rozproszona po warstwie UI, choć należy do mapowania z persystencji.

### 1.6 Obserwowanie zmian: zdarzenie `storage` w trzech miejscach

- `src/components/CardCatalog.astro:68` `window.addEventListener("storage", showBadges)`
- `src/components/CatalogProfileCorner.tsx:58` `window.addEventListener("storage", refresh)`
- własne zdarzenie `PROFILE_CHANGED_EVENT` (`src/lib/catalog-badges.ts:8`), wysyłane z `CatalogProfileCorner.tsx:22` i nasłuchiwane w `CardCatalog.astro:70`. Komentarz w `CardCatalog.astro:69` mówi dlaczego: zdarzenie `storage` nie odpala się w karcie, która sama zapisała.

To jest kolejny szczegół kontraktu Web Storage, znany dziś trzem plikom.

## 2. Klasyfikacja i wybór #1

| # | Zależność | (a) Dotknięte warstwy / pliki | (b) Koszt wymiany dziś | (c) Deklarowana wymienialność |
|---|---|---|---|---|
| **1** | **Web Storage (`localStorage`, zdarzenie `storage`)** | 4 warstwy; 7 plików produkcyjnych, 36 wywołań, 4 moduły `lib` z własnym interfejsem i kluczem, 10 speców e2e z kluczami | **Wysoki**: zmiana magazynu (np. IndexedDB, bo data URL własnego obrazka w profilu rośnie, albo synchronizacja) dotyka 7 plików UI/hooków, 4 modułów `lib` i 10 speców; API Web Storage jest synchroniczne, a każdy nie-synchroniczny magazyn zmienia sygnatury wszystkich 36 miejsc | Pośrednio: PRD:931 i `roadmap.md:168` odkładają „konta i synchronizację" jako kierunek, nie jako wymóg. D01:123 klasyfikuje magazyn jako **Generic** |
| 2 | `cloudflare:workers` (`env`) | 2 pliki serwerowe: `src/middleware.ts:2`, `src/layouts/Layout.astro:2` (+ deklaracja `src/cloudflare-workers.d.ts:1`); jedna warstwa, tylko SSR | Niski: dwa odczyty `env.ENVIRONMENT`, przepuszczane przez `robotsHeader` (`src/lib/robots.ts`) | `infrastructure.md:36` i `:54` opisują wyjście z adaptera jako koszt, ale jako opcję, nie cel |
| 3 | `react` | 20 importów w wyspach i hookach | Nieadekwatne: framework, a nie zależność za portem | Brak |
| 4 | `lucide-react` (8 plików), `radix-ui` (3), `clsx`/`tailwind-merge`/`cva` (przez `cn()`) | Jedna warstwa (UI); `AGENTS.md:8` już narzuca `cn()` jako jedyne wejście dla klas | Niski | Brak |
| 5 | `window.print()` | 1 miejsce: `src/components/CardPage.tsx:86` | Trywialny | Brak |

**Wybór: #1, Web Storage.** Uzasadnienie:

1. **Rozsmarowanie (a):** jedyna zależność, która przecina wszystkie warstwy naraz — skrypt Astro, komponenty, hooki, `lib`, a przez klucze także testy. Pozostałe leżą w jednej warstwie.
2. **Koszt (b):** wspólna reguła „czytaj tuż przed zapisem" (1.4) wymaga dziś pamiętania w trzech kopiach i była już powodem testu z przełamaniem (`test-plan.md:155`). Błąd w czwartej kopii (np. przy dodawaniu M-5 „Szlaczki") cofnąłby zapis z innej karty po cichu.
3. **Intencja (c) jest słaba i mówię to wprost:** nie ma deklaracji wymienialności. Argument to nie rozjazd z dokumentem, tylko to, że produkt ma już zapowiedziany ruch (synchronizacja, `roadmap.md:168`) i już zna dwa problemy kontraktu (kwota, zablokowany magazyn — 5), a ich obsługa jest rozproszona.

Co by obaliło wybór: gdyby właściciel uznał, że magazyn nigdy się nie zmieni i nie przybędzie nowych kart z ustawieniami. Pozostałe cele (hooki, `lib`) zyskują i tak: jedna reguła zapisu zamiast trzech.

## 3. Diagnoza

### 3.1 Duplikacja (cytaty)

Trzy kopie tej samej sekwencji zapisu profilu:

```ts
// src/hooks/useCardSettings.ts:79-85
const stored = readChildProfiles(localStorage, ALLOWED_CHARACTER_IDS);
const current = stored.find((profile) => profile.id === visit.activeId);
if (current === undefined) { return; }
const nextProfiles = withProfileCards(stored, current.id, withCardSettings(current.cards ?? {}, cardId, next));
if (nextProfiles !== null && writeChildProfiles(localStorage, nextProfiles)) {
```

```ts
// src/hooks/useFavoriteCharacter.ts:30-38
// Read just before writing, so a change made on another open page is not overwritten with a stale list.
const stored = readChildProfiles(localStorage, ALLOWED_CHARACTER_IDS);
const current = stored.find((profile) => profile.id === active.id);
...
const next = withFavorite(stored, current.id, bar.character, ALLOWED_CHARACTER_IDS, href);
if (next === null || !writeChildProfiles(localStorage, next)) {
```

```ts
// src/components/ProfileCorner.tsx:244-255
const stored = readChildProfiles(localStorage, ALLOWED_CHARACTER_IDS);
const current = stored.find((profile) => profile.id === activeProfile.id);
...
const nextProfiles = withFavorite(stored, current.id, id, ALLOWED_CHARACTER_IDS, imageHref);
if (nextProfiles === null || !writeChildProfiles(localStorage, nextProfiles)) {
```

Dwie kopie wybierania postaci z paska, z tym samym odczytem własnego obrazka i zapisem „ostatniej postaci":

```ts
// src/components/WorksheetGenerator.tsx:80-91      // src/hooks/useBarCharacter.ts:40-50
const href = readOwnImage(localStorage);            const href = readOwnImage(localStorage);
...                                                 ...
recordBarCharacter(localStorage, activeId, id);     recordBarCharacter(localStorage, visit.activeId, id);
```

(`WorksheetGenerator.tsx` obsługuje labirynt, `useBarCharacter.ts` pozostałe karty — to są dwie równoległe ścieżki, nie jedna.)

### 3.2 Przecieki przez granice

- **UI zna kształt przechowywania.** `ProfileCorner.tsx:601` inicjalizuje stan z `readOwnImage(localStorage)`; komponent wie, że własny obrazek leży w osobnym kluczu, a nie w profilu.
- **Hook zna typ DOM.** `useChildProfileVisit.ts:141` przyjmuje `Pick<Storage, …>`.
- **Moduły domeny zdublowały kontrakt** (1.2), więc test każdego ma własny fałszywy magazyn: `active-profile.test.ts:79`, `child-profiles.test.ts:732`, `last-used.test.ts:243`, `own-image-store.test.ts:149` (cztery `memoryStorage`).
- **Mapowanie persystencji przecieka do UI.** Odfiltrowanie postaci spoza katalogu na odczycie (`child-profiles.ts:265`) powoduje, że `useCardSettings.persist` (`:79-85`) zapisuje z powrotem **przefiltrowaną** listę. D01 (opis w R-3, za D01:198) wskazuje, że wpis z postacią spoza `allowed` znika wtedy z dysku przy następnej zmianie paska, choć PRD:647 obiecuje „dostępne… do czasu usunięcia przez rodzica". To jest skutek tego, że odczyt i zapis nie są jedną operacją po tej samej stronie granicy.
- **Rozjazd z dokumentem (jedyny, który znalazłem):** PRD:647 (za D01:198) kontra `child-profiles.ts:265`. Nie jest to rozjazd o wymienialności, tylko o trwałości.

### 3.3 Co przecieka do bundla

Nic serwerowego do klienta. Odwrotnie: `CardCatalog.astro:43` używa `localStorage` w skrypcie klienckim, a strony kart są wyspami bez renderu na serwerze (`print-contract.test.ts:153`, `:177`), czyli ograniczeniem narzuconym przez przeciek.

## 4. Projekt ACL

Katalog nowej warstwy: `src/lib/device-memory/`. Reszta kodu importuje tylko `index.ts` (port i typy domenowe).

### 4.1 Value object / encja: rekord profilu i „migawka urządzenia"

`src/lib/device-memory/snapshot.ts` — **jedyne miejsce, które zna kształt JSON** z dysku, migrację `level` i filtr postaci. Zero `Storage`, zero `localStorage`. Czysty kod, testowany `node:test`.

```ts
// Typy domenowe (przeniesione z child-profiles.ts / last-used.ts, bez zmiany pól)
export type ChildProfile  = { id; name; character; image?; cards? };
export type LastUsed      = { character: string; cards: CardSettingsMap };
export type ActiveChoice  = { kind: "unset" } | { kind: "none" } | { kind: "profile"; id: string };
export type OwnImage      = { href: string };            // tylko data:image/(jpeg|png)

// Migawka tego, co urządzenie pamięta. Niezmiennik: wszystkie pola już zwalidowane.
export interface DeviceSnapshot {
  readonly profiles: readonly ChildProfile[];
  readonly active: ActiveChoice;
  readonly lastUsed: LastUsed;
  readonly ownImage: OwnImage | null;
}

// Mapowanie z/do persystencji (surowe stringi, bo takie dostaje adapter)
export interface RawRecords { profiles: string | null; active: string | null; lastUsed: string | null; ownImage: string | null }

export function parseSnapshot(raw: RawRecords, allowedCharacters: readonly string[]): DeviceSnapshot;
export function serializeProfiles(profiles: readonly ChildProfile[]): string;
export function serializeActive(choice: ActiveChoice): string | null;   // null = usuń klucz
export function serializeLastUsed(lastUsed: LastUsed, previousRaw: string | null): string; // zachowuje obce pola, wycina `level`
export function serializeOwnImage(href: string): string | null;       // null = nie jest JPEG/PNG data URL
```

Pseudokod `parseSnapshot`:

```
parseSnapshot(raw, allowed):
  profiles  = keepProfiles(parseJson(raw.profiles).profiles, allowed)   // dzisiejsze acceptEntry
  lastUsed  = { character: allowedOrNone(json.character), cards: parseStoredCards(json) }  // migruje level
  active    = raw.active === null || "" -> unset ; "none" -> none ; id -> profile(id)
  ownImage  = isOwnImageDataUrl(json.href) ? { href } : null
  każdy parse błędny -> wartość pusta, nigdy wyjątek
```

Operacje domenowe na migawce (czyste, bez I/O) zostają obok i przejmują dzisiejsze funkcje: `openingVisit`, `visitAfterDelete`, `withFavorite`, `withProfileCards`, `favoriteDiffers`, `drawnVisitCharacter` (przyjmuje `OwnImage | null` zamiast magazynu: dziś `own-image-store.ts:59` bierze magazyn tylko po to, żeby odczytać `readOwnImage`).

### 4.2 Wąski port domenowy

`src/lib/device-memory/port.ts`:

```ts
export type SaveFailure = "blocked" | "quota";
export type SaveResult = { ok: true } | { ok: false; reason: SaveFailure };

export interface DeviceMemory {
  /** Całość stanu, bez wyjątków. Zablokowany magazyn czyta się jak pusty. */
  load(): DeviceSnapshot;

  /** Zapis profili wraz z regułą „czytaj tuż przed zapisem": adapter wczytuje świeże profile,
   *  woła `change` i zapisuje wynik. `change` zwracające null = nic nie zapisuj. */
  updateProfiles(change: (fresh: readonly ChildProfile[]) => readonly ChildProfile[] | null): SaveResult & { profiles?: readonly ChildProfile[] };
  replaceProfiles(profiles: readonly ChildProfile[]): SaveResult;      // usuwanie z ProfileCorner

  chooseActive(choice: ActiveChoice): void;                             // zapis niefatalny
  rememberCharacter(character: string): void;                           // last-used.character
  rememberCards(change: (cards: CardSettingsMap) => CardSettingsMap): SaveResult;
  saveOwnImage(href: string): SaveResult;

  /** Jedno źródło prawdy o „coś się zmieniło": zdarzenie `storage` z innej karty,
   *  zapis z tej karty i `pageshow` z cache. */
  subscribe(listener: () => void): () => void;
}
```

Port **nie mówi** `getItem`/`setItem`, kluczy ani JSON. Metody opisują intencje domeny (czterech agregatów pamięci: profile, aktywny wybór, ostatnie, własny obrazek).

### 4.3 Adapter

`src/lib/device-memory/web-storage.ts` — **jedyny plik**, który zna `localStorage`, `Storage`, klucze `printo-kids:*`, `try/catch` wokół `getItem`/`setItem`, rozróżnienie `QuotaExceededError`, zdarzenie `storage` i `pageshow`.

```ts
export function webStorageMemory(opts: {
  storage: () => Storage;                 // fabryka, bo dostęp do `localStorage` sam potrafi rzucić SecurityError
  allowedCharacters: readonly string[];
}): DeviceMemory;

export const WEB_STORAGE_KEYS = {          // jedyna definicja kluczy; importuje ją helper e2e
  profiles: "printo-kids:child-profiles",
  active: "printo-kids:active-profile",
  lastUsed: "printo-kids:last-used",
  ownImage: "printo-kids:own-image",
} as const;
```

Pseudokod `updateProfiles`:

```
updateProfiles(change):
  fresh = parseSnapshot(readRaw(), allowed).profiles       // zawsze świeży odczyt
  next  = change(fresh)
  if next === null: return { ok: true }                     // brak zmiany
  return write(KEYS.profiles, serializeProfiles(next))      // write() łapie wyjątki -> SaveResult
```

`write` klasyfikuje błąd: `DOMException` o nazwie `QuotaExceededError` → `quota`, reszta → `blocked`. Po udanym zapisie adapter powiadamia lokalnych subskrybentów (to zastępuje `PROFILE_CHANGED_EVENT`).

Drugi adapter, `src/lib/device-memory/in-memory.ts`, implementuje ten sam port na `Map`, z opcją `failWith: SaveFailure`. Zastępuje cztery `memoryStorage` w testach i pozwala przetestować zapis bez przeglądarki.

### 4.4 Podłączenie

`src/lib/device-memory/index.ts` eksportuje typy i port oraz `deviceMemory()` — leniwy singleton, który tworzy `webStorageMemory({ storage: () => localStorage, allowedCharacters: ALLOWED_CHARACTER_IDS })`. Hooki biorą pamięć z `useDeviceMemory()` (jedna linijka, możliwa podmiana w testach przez parametr). `ALLOWED_CHARACTER_IDS` znika z wywołań w UI (1.5).

## 5. Rozstrzygnięcia zależne od kontraktu Web Storage (kodowane w ACL, nie w UI)

Opieram je na znanym mi kontrakcie, bez fetcha dokumentacji w tej sesji — **faza 1 zamienia każde w test w przeglądarce**.

1. **`setItem` może rzucić.** Przy przekroczonej kwocie (`QuotaExceededError`) i przy zablokowanym magazynie. Wyjątek zostawia poprzednią wartość klucza. **Decyzja:** adapter zwraca `SaveResult` z `reason`; UI dostaje dziś jedno `boolean` (`SAVE_ERROR_TEXT`, `STORE_ERROR_TEXT`), więc w fazie 3 mapuję oba na dotychczasowe teksty, a rozróżnienie `quota` dla własnego obrazka odkładam do osobnej decyzji (zob. 7, pytanie 2). To zamyka lukę z `test-plan.md:174` („test przekroczonej kwoty `localStorage`" wymieniony jako niewykonany).
2. **Samo odwołanie do `localStorage` może rzucić** (`SecurityError`), nie tylko `getItem`. Dlatego adapter dostaje **fabrykę** `storage: () => Storage`, a nie obiekt; dziś chroni to `try/catch` w `CardCatalog.astro:42-44` i w każdym module `lib`.
3. **Zdarzenie `storage` nie odpala się w dokumencie, który sam zapisał.** Dowód w kodzie: komentarz `CardCatalog.astro:69`. **Decyzja:** `subscribe` łączy trzy źródła (`storage`, własny zapis, `pageshow` z `persisted`) i to jest jedyne miejsce, które o tym wie. Znika `PROFILE_CHANGED_EVENT` z `catalog-badges.ts:8`.
4. **Wartości są łańcuchami.** Cały JSON, w tym dawny `{ character, level }`, jest odczytywany tylko w `parseSnapshot`, więc migracja `level` (`card-settings.ts:139`) jest wywoływana z jednego miejsca. E2E zasiewające dawny kształt (`level-bar.spec.ts:73`, `own-image.spec.ts:103`) przechodzą przez helper z fazy 5.
5. **Odczyt-modyfikacja-zapis całego bloba** (1.3, 1.4) jest metodą portu (`updateProfiles`, `rememberCards`), a nie konwencją wywołującego. Zapis `last-used` ma jeden właściciel, więc `writeLastUsed` i `writeLastUsedCards` przestają konkurować o ten sam klucz.
6. **Trwałość wpisu spoza katalogu (R-3, D01) to decyzja produktowa, nie kontraktowa.** ACL jej nie rozstrzyga. Daje za to jedno miejsce zmiany: `acceptEntry` w `snapshot.ts` (dzisiejsze `child-profiles.ts:265`). Dopóki właściciel nie zdecyduje, zachowanie zostaje jak dziś.

## 6. Dowód izolacji, before/after i kryterium sukcesu

### 6.1 Wymiana magazynu dotyka tylko adaptera

Przy założeniu, że port z 4.2 jest wystarczający:

| Zmiana | Dotyka | Nie dotyka |
|---|---|---|
| `localStorage` → IndexedDB | `web-storage.ts` (nowy `indexeddb.ts`) i fabryka w `index.ts`. Port musiałby się stać asynchroniczny (`Promise`), co zmienia sygnatury portu raz, w jednym miejscu | tabel (brak), API (brak), komponentów i hooków poza jednokrotną zmianą na `await`/stan ładowania |
| Zmiana kluczy lub dodanie wersji schematu | `snapshot.ts` + `web-storage.ts` | UI, hooków, `lib/<karta>/` |
| Synchronizacja (`roadmap.md:168`) | nowy adapter, który zapisuje lokalnie i w tle wysyła | UI i hooków |
| Nowa karta z ustawieniami (M-5) | `card-settings.ts` (już dziś) | adaptera: `rememberCards` jest ogólne |

Uczciwy koszt: przejście na magazyn **asynchroniczny** wymaga zmiany sygnatury portu, więc wszyscy konsumenci i tak się dotkną raz. ACL nie usuwa tej zmiany, tylko ogranicza ją do jednego interfejsu zamiast 36 wywołań.

### 6.2 Before/after

**`useCardSettings.persist`** (dziś `src/hooks/useCardSettings.ts:71-89`, 19 linii):

```ts
// BEFORE
const stored = readChildProfiles(localStorage, ALLOWED_CHARACTER_IDS);
const current = stored.find((p) => p.id === visit.activeId);
if (current === undefined) return;
const nextProfiles = withProfileCards(stored, current.id, withCardSettings(current.cards ?? {}, cardId, next));
if (nextProfiles !== null && writeChildProfiles(localStorage, nextProfiles)) {
  visit.replaceProfiles(nextProfiles); show(name);
}

// AFTER
const result = memory.updateProfiles((fresh) =>
  withProfileCards(fresh, visit.activeId, withCardSettings(profileOf(fresh, visit.activeId)?.cards ?? {}, cardId, next)));
if (result.ok && result.profiles) { visit.replaceProfiles(result.profiles); show(name); }
```

**`useFavoriteCharacter.save`** i **`ProfileCorner.saveFavorite`**: obie zamieniają trzy kroki (odczyt, `with…`, zapis) na jedno `memory.updateProfiles(fresh => withFavorite(fresh, …))`. Komentarz „Read just before writing" znika z hooków; reguła żyje w `web-storage.ts` jako kontrakt metody.

**`CardCatalog.astro` (skrypt):**

```ts
// BEFORE: shown = catalogBadges(localStorage); + dwa listenery storage/PROFILE_CHANGED_EVENT/pageshow
// AFTER:  const render = () => paint(catalogBadges(memory.load()));
//         render(); memory.subscribe(render);
```

**`catalogBadges(storage: ChildProfileStorage)`** (`catalog-badges.ts:23`) → `catalogBadges(snapshot: DeviceSnapshot)`: staje się czystą funkcją, a test (`catalog-badges.test.ts`) przestaje składać JSON w fałszywym magazynie.

**Warstwa UI dostaje gotowe dane domenowe:** `load()` zwraca `DeviceSnapshot` z `ChildProfile[]`, `ActiveChoice`, `LastUsed`, `OwnImage | null`. Żaden komponent ani hook nie dostaje stringa, klucza ani obiektu `Storage`.

### 6.3 Kryterium sukcesu (grepy, do uruchomienia po ostatniej fazie)

```bash
grep -rnE "localStorage|sessionStorage|\bStorage\b|addEventListener\(\"storage\"" src tests
grep -rn "printo-kids:" src tests scripts
```

Oczekiwany wynik **po refaktorze**: trafienia wyłącznie w `src/lib/device-memory/web-storage.ts` (plus jego test `web-storage.test.ts`) i w jednym helperze e2e `tests/e2e/support/device-memory.ts`, który importuje klucze z `WEB_STORAGE_KEYS`. Komentarze w `print-contract.test.ts:153` i `:177` ulegają przeredagowaniu („wyspa czyta pamięć urządzenia").

| Dziś zna `localStorage` / `Storage` / klucze | Po refaktorze |
|---|---|
| `CardCatalog.astro`, `ProfileCorner.tsx`, `WorksheetGenerator.tsx` | nie |
| `useBarCharacter.ts`, `useCardSettings.ts`, `useChildProfileVisit.ts`, `useFavoriteCharacter.ts` | nie |
| `active-profile.ts`, `last-used.ts`, `child-profiles.ts`, `sheet/own-image-store.ts`, `catalog-badges.ts` | nie (znikają interfejsy `*Storage` i klucze; zostają czyste funkcje domeny w `device-memory/` lub w dotychczasowych plikach) |
| `tests/e2e/*.spec.ts` (10 plików) | nie (przez helper) |
| — | **tak: `src/lib/device-memory/web-storage.ts`** i helper e2e |

`dependency-cruiser` nie wykryje globalu `localStorage` (to nie moduł). Dlatego straż ma dwa elementy: (1) reguła ESLint `no-restricted-globals` na `localStorage`/`sessionStorage` z wyjątkiem pliku adaptera (w `eslint.config.js` nie ma dziś `no-restricted-*`, grep w tej sesji); (2) reguła `depcruise`, że `web-storage.ts` importuje wyłącznie `index.ts` (grep po regułach w `.dependency-cruiser.cjs` pokazuje tylko reguły domyślne, nazwy od `no-circular` do `peer-deps-used`).

## 7. Plan faz (konwencja projektu)

Konwencja: zmiany w `context/changes/<id>/` przez `/10x-new` → `/10x-plan` → `/10x-implement`; PR do `main`; `AGENTS.md` nie ustala formatu komunikatów commitów („Commit-message convention is unset"). Proponuję id `device-memory-acl`. Każda faza kończy się zielonym `npm run lint`, `npm run depcruise`, `npm test`, `npx astro check`, `npm run build` (jak job `ci`, `AGENTS.md:44`) i Playwrightem na wybranych specach.

| Faza | Zakres | Zachowanie | Dowód |
|---|---|---|---|
| 0 | Charakteryzacja: zostawiam istniejące testy jako siatkę (`active-profile`, `child-profiles`, `last-used`, `own-image-store`, `catalog-badges` + e2e profilu) | bez zmian | zielone przed startem |
| 1 | Dodaję `device-memory/` obok starego kodu: `snapshot.ts` (przeniesione `acceptEntry`, migracja), `port.ts`, `web-storage.ts`, `in-memory.ts`, `index.ts`. Testy: kontrakt portu uruchamiany na obu adapterach; w przeglądarce (Playwright) potwierdzam punkty z 5 (kwota, `SecurityError`, brak zdarzenia `storage` w zapisującej karcie) | produkt bez zmian; nowy kod bez konsumentów | nowe testy zielone; stary kod nietknięty |
| 2 | Stare funkcje `lib` delegują do `snapshot.ts` (jedna implementacja parsowania) | bez zmian | te same testy zielone |
| 3 | Migracja hooków: `useChildProfileVisit`, `useCardSettings`, `useFavoriteCharacter`, `useBarCharacter` na `DeviceMemory` | bez zmian | e2e `card-settings`, `favorite-character`, `profile-summary`, `level-bar` |
| 4 | Migracja komponentów i Astro: `ProfileCorner`, `WorksheetGenerator`, `CatalogProfileCorner`, `CardCatalog.astro`; usunięcie `PROFILE_CHANGED_EVENT` | bez zmian | e2e `catalog`, `own-image`, `dialog-close`, `phone-layout` |
| 5 | Testy: `in-memory.ts` zastępuje 4 × `memoryStorage`; helper `tests/e2e/support/device-memory.ts` zastępuje klucze w 10 specach. Mutacje: `npm run mutate:local-data` zawężone do `device-memory/` (`AGENTS.md`, sekcja Mutation testing: tylko kod objęty zmianą, bez ścigania 100%) | bez zmian | specy zielone; mutanty przejrzone pojedynczo |
| 6 | Straż: reguła ESLint + reguła depcruise; usunięcie martwych interfejsów `*Storage` | bez zmian | grepy z 6.3 zwracają tylko adapter i helper |

**Ryzyka.** (1) Fabryka `storage: () => Storage` musi być wywoływana leniwie, inaczej wyspa wywróci się na serwerze (`print-contract.test.ts:153`). (2) Faza 4 usuwa własne zdarzenie, więc test „odświeżenie miniatur po zmianie profilu w tej karcie" w `catalog.spec.ts` musi przejść przez `subscribe`. (3) Sztywne kolejność: nie łączyć fazy 3 z 4 w jednym PR.

**Otwarte pytania do właściciela** (nie blokują faz 1–6):

1. R-3 z D01: czy profil z postacią spoza katalogu ma znikać, czy wracać do „Brak"? Zmiana mieści się w `acceptEntry`.
   - **Odpowiedź (2026-11-03, z D01):** Postaci nie znikają z katalogu; wycofany plik zostanie podmieniony pod tym samym id. Ścieżka nie zachodzi, więc R-3 jest ryzykiem niskim i zaakceptowanym; zachowanie `acceptEntry` zostaje bez zmian.
2. Czy błąd `quota` przy własnym obrazku ma dostać osobny komunikat? Dziś jeden tekst (`ProfileCorner.tsx:619-624` ustawia `STORE_ERROR_TEXT`).
3. Czy wartość „asynchroniczny port" ma być zapisana od razu (Promise), żeby przyszłe IndexedDB nie zmieniało sygnatur? Proponuję **nie**: synchronicznie dziś, bo `useState(() => …)` w hookach (np. `useChildProfileVisit.ts:50`) czyta stan przy pierwszym renderze.
