# Brief: glossary w AGENTS.md

Pełny plan: `plan.md`

## Cel

Agent w każdej sesji widzi `context/domain/glossary.md` i nazywa rzeczy językiem domeny.

## Starting Point

`CLAUDE.md` importuje `@AGENTS.md`; glossary istnieje, ale nie jest nigdzie wskazany.

## Key Decisions

| Decyzja         | Wybór             | Dlaczego                                            |
| --------------- | ----------------- | --------------------------------------------------- |
| Gdzie odwołanie | tylko `AGENTS.md` | `CLAUDE.md` dziedziczy; duplikat to podwójny import |
| D02 §8          | poza zakresem     | to krok po zmianie `VerifiedCard`                   |

## Phases

| Faza | Zakres                                                                 |
| ---- | ---------------------------------------------------------------------- |
| 1    | Jeden punkt z `@context/domain/glossary.md` w `AGENTS.md`; lint i test |

Prerequisites: brak. Estimated effort: minuty.
