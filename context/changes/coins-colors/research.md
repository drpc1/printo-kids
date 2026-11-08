---
date: 2026-11-08
researcher: Claude
git_commit: 55c17c9a183835fe568eb318f60789b6190650e9
branch: claude/priceless-satoshi-530d60
repository: printo-kids
topic: "Przełącznik Kolory na karcie Kto ma więcej? (GitHub #270), kolorowe i bardziej realistyczne monety i banknoty"
tags: [research, codebase, money, card-settings, colors]
status: complete
last_updated: 2026-11-08
last_updated_by: Claude
---

# Research: kolory na karcie „Kto ma więcej?”

## Research Question

Jaki jest obecny stan karty `pieniadze` (rysowanie, ustawienia, kontrakt karty) i jak sekwencje oraz symetria realizują ustawienie `colors`, żeby zaplanować jedno ustawienie `colors` (domyślnie wyłączone) z kolorowymi, bardziej realistycznymi monetami i banknotami?

## Summary

Karta jest dziś w całości czarna, a jej rysowanie jest w jednym pliku React plus stałych. Dołożenie `colors` jest mechaniczne, bo wzorzec istnieje w sekwencjach: pole w `MoneySettings`, `SettingToggle` „Kolory” na pasku, brak wpływu na `contentKey`, wpis „kolory” w podsumowaniu profilu. Jedyna nowa praca projektowa to wygląd: moneta to koło, a banknot to dwa prostokąty, oba z `fill="var(--card)"` i konturem `var(--foreground)`. Układ (`layout.ts`) zależy tylko od wymiarów kawałków, więc zmiana wyglądu go nie rusza. Hexów w komponentach nie wolno dodawać (AGENTS.md); są tokeny `--symmetry-*` (9 kredek), ale brakuje złota, srebra, miedzi i barw banknotów, więc to nowe tokeny w `src/styles/global.css`.

## Detailed Findings

### Rysowanie monet i banknotów

- Cała grafika karty jest w `src/components/MoneyGenerator.tsx`: `MoneySheet` (SVG A4) i `Pile`, który dla `piece.kind === "coin"` rysuje `<circle>` + `<text>`, a inaczej banknot (zewnętrzny `<rect>`, wewnętrzna ramka, `<text>`). W tych dwóch funkcjach wszystko używa `var(--card)` i `var(--foreground)`.
- Stałe wyglądu: `src/lib/money/sheet.ts` (`coinDiameter` 11, `coinStroke` 0.8, `coinFontSize` 5.6, `noteWidth` 18, `noteHeight` 10, `noteInnerInset` 1, `fontWeight` 700). Komentarz nad `MONEY_SHEET` mówi, że moneta i banknot są uproszczone i nie kopiują prawdziwych; skrypty miniatury i makiety czytają te same stałe.
- `src/lib/money/layout.ts` (`layoutPile`, `layoutMoneySheet`) układa kawałki według wymiarów; nie zna koloru. Wszystkie monety mają ten sam rozmiar i wszystkie banknoty ten sam (wielkość nie zdradza wartości).
- Nominały: 1, 2, 5 zł to monety, 10 i 20 zł to banknoty (`src/lib/money/levels.ts`, pole `nominals`, komentarz w interfejsie).

### Ustawienia i pamięć

- `MoneySettings` ma tylko `level` (`src/lib/card-settings.ts:39-41`); domyślnie `{ level: DEFAULT_MONEY_LEVEL_ID }` (`card-settings.ts:91`, test `card-settings.test.ts:22`).
- Parser: `parseCard` iteruje po polach ustawień domyślnych, a `fieldValue` ma gałąź dla `colors` (boolean, inaczej wartość domyślna) w `card-settings.ts:174`. Dodanie `colors: false` do domyślnych działa bez zmian parsera; zapisane wcześniej profile bez pola dostają `false`.
- Podsumowanie profilu: `src/lib/card-summary.ts:97-103` dla `pieniadze` zwraca `extras: []`; sekwencje dodają `["kolory"]` (`card-summary.ts:77`). Plakietka katalogu to tylko `badge` (poziom); kolory trafiają do `extras` podsumowania w oknie profilu.
- Strona: `MoneyGenerator.tsx` woła `memory.remember({ level: id })`, a `handleGenerate` przekazuje do silnika literał `{ level: levelId }`; trzeba przejść na `memory.settings`, jak `SequenceGenerator.tsx` (`generateSheet(sheet, sequenceEngine, memory.settings, …)`).

### Wzorzec `colors` w sekwencjach

- `SequenceGenerator.tsx`: `colorsControl` to `<SettingToggle label="Kolory" checked={colors} onCheckedChange={(next) => memory.remember({ colors: next })} />`. Przełącznik nie woła `applySettings`, więc nie układa nowej karty; jest w `controls` po `levelControl`.
- `contentKey` w `src/lib/sequence/engine.ts:56` to `settings.level`; w `src/lib/money/engine.ts:62` także `settings.level`. Kontrakt: dekoracje (postać, kolory) nie wchodzą do klucza (`src/lib/card-contract.ts:23`). Test I-9 w `src/lib/card-engines.test.ts:294-305` sprawdza to na liście `decoration`; dla `pieniadze` trzeba dodać wpis z `colors: true`.
- Sekwencje losują kredkę na kształt przy Generuj i trzymają ją w karcie (`shapeColors`). Pieniądze tego nie potrzebują: kolor zależy od nominału, więc `MoneyCard`, generator, reguły i układ zostają bez zmian.
- Tokeny kredek: `src/styles/global.css:60-68` (`--symmetry-red/green/yellow/blue/orange/gray/black/purple/brown`).

### Testy i miejsca zależne

- E2E: `tests/e2e/card-settings.spec.ts` ma wpis `pieniadze` (zmiana poziomu) i obsługę `colors: true` przez `getByRole("switch", { name: "Kolory" })` dla innych kart; `tests/e2e/phone-layout.spec.ts` sprawdza dla sekwencji, sudoku i symetrii, że Kolory, Generuj, Drukuj i Profil się nie zasłaniają; `tests/e2e/money.spec.ts` sprawdza układ paska na telefonie bez Kolory.
- `src/lib/sheet/print-contract.test.ts` pilnuje `printColorAdjust: "exact"` w SVG kart; `MoneySheet` już ma ten styl.
- Miniatura katalogu `public/thumbnails/pieniadze.svg` powstaje ze `scripts/build-thumbnails.mjs`; makieta `scripts/money-mockup.mjs` pisze czarne SVG do `context/changes/coins-who-has-more/` (zarchiwizowane w `context/archive/2026-11-01-coins-who-has-more/mockup-*.svg`).

## Historical Context

- `context/archive/2026-11-01-coins-who-has-more/plan.md:39`: kolor wyłączony z S-33 jako osobny kawałek; „ustawienia karty to obiekt, do którego dojdzie pole `colors`”.
- PRD Open Questions 14: wygląd pieniędzy stylizowany, bez zabezpieczeń i godeł; wizerunek na karcie edukacyjnej jest dopuszczalny, o ile nie uchodzi za prawdziwy pieniądz. PRD US-23 i Business Logic „Karta „Kto ma więcej?”” mówią o druku czarnym i o jednakowej wielkości monet.

## Code References

- `src/components/MoneyGenerator.tsx` - strona, `MoneySheet`, `Pile`
- `src/lib/money/sheet.ts` - stałe wyglądu
- `src/lib/money/engine.ts:62` - `contentKey` (tylko poziom)
- `src/lib/card-settings.ts:39,91,174` - `MoneySettings`, domyślne, parser `colors`
- `src/lib/card-summary.ts:97-103` - podsumowanie profilu
- `src/components/SequenceGenerator.tsx` - wzorzec przełącznika
- `src/lib/card-engines.test.ts:294-305` - test I-9
- `src/styles/global.css:60-68` - tokeny kredek

## Architecture Insights

- Ustawienie dekoracyjne to pole w ustawieniach karty, brak w `contentKey`, `remember` bez `applySettings`.
- Kolor jest czystą funkcją nominału, więc dobrym miejscem jest nowy czysty moduł w `src/lib/money/` (np. `colors.ts`) z testem, jak `sequence/colors.ts`.
- AGENTS.md: bez hexów i palet Tailwind w komponentach; nowy kolor to nowy token w `global.css`.

## Open Questions

1. Wygląd „bardziej realistyczny” do oceny użytkowniczki na makiecie: np. 1 zł srebrna, 2 zł złota, 5 zł dwukolorowa (pierścień i środek), banknoty 10 zł czerwonawy i 20 zł zielonkawy. Granica prawna: bez zabezpieczeń, godeł, portretów i dokładnych wzorów NBP.
2. Czytelność liczby na kolorowym tle na czarno-białej drukarce: do sprawdzenia na wydruku.
3. Miniatura katalogu: rekomendacja, że zostaje czarna (domyślne ustawienie).
4. Podsumowanie profilu: rekomendacja `extras: ["kolory"]`, jak w sekwencjach.
