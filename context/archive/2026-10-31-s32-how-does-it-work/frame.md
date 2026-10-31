# Frame Brief: S-32 „Jak to działa”

## Reported Observation

Niejasne, co S-32 ma dostarczyć: osobną stronę pomocy czy „asystenta” (bez LLM, wyjaśnienia w tooltipie) przy kolejnych kartach i krokach.

## Initial Framing (preserved)

- **User's stated cause or approach**: brak; dwie alternatywy (strona vs. podpowiedzi przy kartach).
- **User's proposed direction**: otwarte, prosi o rekomendację.
- **Pre-dispatch narrowing**: pominięte, bo dowody z repo rozstrzygają pytanie (patrz niżej).

## Dimension Map

1. **Strona pomocy** — jedna statyczna strona z całą zasadą.
2. **Podpowiedzi w miejscu wyboru** — tooltipy / komunikaty przy pasku, postaci, oknie profilu.
3. **Asystent / samouczek** — okno pomocy, tour przy pierwszym wejściu.

## Hypothesis Investigation

| Hypothesis                                          | Evidence                                                                                                                                                                                                                                                                                                  | Verdict                         |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Podpowiedzi w miejscu wyboru są do zrobienia w S-32 | Już są, w swoich kawałkach: `RememberedNote.tsx` / `useCardSettings.ts:37` („Zapamiętane dla”), `CharacterChoiceControl.tsx:86,100` („Tylko na tę kartę”, „Ustaw jako ulubioną”), `ProfileCorner.tsx:577` (zdanie w oknie profilu). Roadmap S-32 Risk: te podpowiedzi „wchodzą razem ze swoimi kawałkami” | NONE (nic do dodania)           |
| Asystent / okno pomocy / samouczek                  | PRD Non-Goals: „MVP nie ma samouczka… ani okna pomocy”; US-22: „Nie ma samouczka… ani okna pomocy”; roadmap S-32: „Bez samouczka i bez okna pomocy”                                                                                                                                                       | NONE (wprost wykluczone)        |
| Osobna krótka strona linkowana ze stopki            | US-22 („W stopce jest link do krótkiej strony »Jak to działa«”), FR-031, roadmap S-32 Outcome. W `src` nie ma stopki ani takiej strony (`src/pages`: tylko generatory + index)                                                                                                                            | STRONG (jedyna brakująca część) |

## Narrowing Signals

- Połowa „asystenta” (tooltipy w miejscu wyboru) jest już dostarczona i zamknięta w S-27/S-28/S-29/S-31.
- Pytanie „strona czy asystent” jest w PRD rozstrzygnięte: podpowiedzi w miejscu + jedna strona, nic więcej.

## Cross-System Convention

Mała aplikacja bez kont: kontekstowe mikro-podpowiedzi przy kontrolkach plus jedna statyczna strona „FAQ / jak to działa” w stopce; bez toursów (i tak są odrzucone w PRD).

## Reframed (or Confirmed) Problem Statement

> **The actual problem to plan around is**: dodać stopkę (której nie ma) z linkiem do jednej statycznej strony „Jak to działa”, która spina w jednym miejscu zasady już istniejących podpowiedzi; żadnego asystenta ani nowych tooltipów.

Pytanie „strona czy asystent” jest już rozstrzygnięte w PRD: odpowiedzią jest oba, ale asystent (podpowiedzi w miejscu) już istnieje. S-32 to tylko strona.

## Confidence

**HIGH**: PRD, roadmap i kod zgadzają się.

## What Changes for /10x-plan

Plan obejmuje: stopkę we wspólnym layoucie (`GeneratorShell.astro` i katalog `/`), trasę np. `src/pages/jak-to-dziala.astro` (statyczna treść w Astro, bez React), treść zgodną z tym, co UI faktycznie robi (poziomy bez wieku, profil pamięta pasek każdej karty, ulubiona postać tylko jawnie, postać przy poleceniu), stopkę niewidoczną w druku. Otwarte do planu: adres strony, czy stopka ma być na stronach generatorów (wpływa na margines/druk A4 i układ mobilny).

## References

- `context/foundation/roadmap.md:146-156`, GH issue 139
- PRD US-22, FR-031, Non-Goals
